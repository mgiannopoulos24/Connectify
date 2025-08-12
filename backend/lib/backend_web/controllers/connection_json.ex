defmodule BackendWeb.ConnectionJSON do
  alias Backend.Connections.Connection
  alias Backend.Accounts.User

  def index(%{connections: connections, current_user: current_user}) do
    %{data: Enum.map(connections, &connection_data(&1, current_user))}
  end

  def pending(%{pending_requests: pending_requests}) do
    %{data: Enum.map(pending_requests, &pending_request_data/1)}
  end

  def show(%{connection: connection, current_user: current_user}) do
    %{data: connection_data(connection, current_user)}
  end

  defp connection_data(%Connection{} = connection, %User{} = current_user) do
    # Determine the other user in the connection
    other_user =
      cond do
        connection.user_id == current_user.id -> connection.connected_user
        connection.connected_user_id == current_user.id -> connection.user
        true -> nil
      end

    if other_user do
      %{
        id: connection.id,
        status: connection.status,
        connected_user: %{
          id: other_user.id,
          name: other_user.name,
          surname: other_user.surname,
          photo_url: other_user.photo_url,
          job_title:
            (other_user.job_experiences |> List.first() |> Map.get(:job_title, "Professional"))
        },
        inserted_at: connection.inserted_at,
        updated_at: connection.updated_at
      }
    else
      # Handle cases where the current_user is not part of the connection, though this shouldn't happen in normal flow.
      %{
        id: connection.id,
        status: connection.status,
        inserted_at: connection.inserted_at,
        updated_at: connection.updated_at
      }
    end
  end

  defp pending_request_data(%Connection{} = connection) do
    %{
      id: connection.id,
      status: connection.status,
      requester: %{
        id: connection.user.id,
        name: connection.user.name,
        surname: connection.user.surname,
        photo_url: connection.user.photo_url,
        job_title: (connection.user.job_experiences |> List.first() |> Map.get(:job_title, "Professional"))
      },
      inserted_at: connection.inserted_at
    }
  end
end