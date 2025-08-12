defmodule Backend.Connections do
  @moduledoc """
  The Connections context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Connections.Connection

  def get_connection!(id), do: Repo.get!(Connection, id)

  def send_connection_request(requester_id, recipient_id) do
    %Connection{}
    |> Connection.changeset(%{user_id: requester_id, connected_user_id: recipient_id})
    |> Repo.insert()
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
    Connection
    |> where(connected_user_id: ^user_id, status: "pending")
    |> Repo.all()
    |> Repo.preload([:user])
  end

  def list_user_connections(user_id) do
    # Find connections where the user is either the requester or the recipient
    # and the status is 'accepted'
    query =
      from c in Connection,
      where: (c.user_id == ^user_id or c.connected_user_id == ^user_id) and c.status == "accepted",
      preload: [:user, :connected_user]

    Repo.all(query)
  end
end