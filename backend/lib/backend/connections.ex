defmodule Backend.Connections do
  @moduledoc """
  The Connections context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Connections.Connection
  alias Backend.Notifications

  def get_connection!(id), do: Repo.get!(Connection, id)

  # --- NEW: Function to find an existing connection between two users ---
  def get_connection_between_users(user1_id, user2_id) do
    from(c in Connection,
      where:
        ((c.user_id == ^user1_id and c.connected_user_id == ^user2_id) or
           (c.user_id == ^user2_id and c.connected_user_id == ^user1_id)) and
          c.status == "accepted"
    )
    |> Repo.one()
  end

  def send_connection_request(requester_id, recipient_id) do
    with {:ok, connection} <-
           %Connection{}
           |> Connection.changeset(%{user_id: requester_id, connected_user_id: recipient_id})
           |> Repo.insert() do
      # Create a notification for the recipient
      Notifications.create_notification(%{
        user_id: recipient_id,
        notifier_id: requester_id,
        type: "new_connection_request",
        resource_id: connection.id,
        resource_type: "connection"
      })

      {:ok, connection}
    end
  end

  def accept_connection_request(%Connection{} = connection) do
    connection
    |> Connection.changeset(%{status: "accepted"})
    |> Repo.update()
  end

  def decline_connection_request(%Connection{} = connection) do
    Repo.delete(connection)
  end

  # --- NEW: Deletes a connection record ---
  def delete_connection(%Connection{} = connection) do
    Repo.delete(connection)
  end

  def list_pending_requests(user_id) do
    Connection
    |> where(connected_user_id: ^user_id, status: "pending")
    |> preload(user: [job_experiences: :company])
    |> Repo.all()
  end

  def list_user_connections(user_id) do
    query =
      from c in Connection,
        where:
          (c.user_id == ^user_id or c.connected_user_id == ^user_id) and c.status == "accepted",
        preload: [
          user: [job_experiences: [:company]],
          connected_user: [job_experiences: [:company]]
        ]

    Repo.all(query)
  end
end
