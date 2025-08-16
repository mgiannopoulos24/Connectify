defmodule Backend.Connections do
  @moduledoc """
  The Connections context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Connections.Connection
  alias Backend.Notifications

  def get_connection!(id), do: Repo.get!(Connection, id)

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

  def list_pending_requests(user_id) do
    # --- FIX STARTS HERE ---
    # Build the full query with preloads first, then execute Repo.all() at the end.
    Connection
    |> where(connected_user_id: ^user_id, status: "pending")
    # Preload the user (the requester) and their job experiences with the company
    |> preload(user: [job_experiences: :company])
    |> Repo.all()

    # --- FIX ENDS HERE ---
  end

  def list_user_connections(user_id) do
    # Find connections where the user is either the requester or the recipient
    # and the status is 'accepted'
    query =
      from c in Connection,
        where:
          (c.user_id == ^user_id or c.connected_user_id == ^user_id) and c.status == "accepted",
        # Preload the nested data for both users in the connection
        preload: [
          user: [job_experiences: [:company]],
          connected_user: [job_experiences: [:company]]
        ]

    Repo.all(query)
  end
end
