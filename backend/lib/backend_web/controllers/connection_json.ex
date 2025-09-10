defmodule BackendWeb.ConnectionJSON do
  @moduledoc """
  Conveniences for rendering data to JSON.
  """
  alias Backend.Accounts.User
  alias Backend.Connections.Connection

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
      job_title =
        if Ecto.assoc_loaded?(other_user.job_experiences) do
          case List.first(other_user.job_experiences) do
            nil -> "Professional"
            job_experience -> job_experience.job_title
          end
        else
          "Professional"
        end

      %{
        "id" => connection.id,
        "status" => connection.status,
        "connected_user" => %{
          "id" => other_user.id,
          "name" => other_user.name,
          "surname" => other_user.surname,
          "photo_url" => other_user.photo_url,
          "job_title" => job_title
        },
        "inserted_at" => connection.inserted_at,
        "updated_at" => connection.updated_at
      }
    else
      %{
        "id" => connection.id,
        "status" => connection.status,
        "inserted_at" => connection.inserted_at,
        "updated_at" => connection.updated_at
      }
    end
  end

  defp pending_request_data(%Connection{} = connection) do
    job_title =
      if Ecto.assoc_loaded?(connection.user.job_experiences) do
        case List.first(connection.user.job_experiences) do
          nil -> "Professional"
          job_experience -> job_experience.job_title
        end
      else
        "Professional"
      end

    %{
      "id" => connection.id,
      "status" => connection.status,
      "requester" => %{
        "id" => connection.user.id,
        "name" => connection.user.name,
        "surname" => connection.user.surname,
        "photo_url" => connection.user.photo_url,
        "job_title" => job_title
      },
      "inserted_at" => connection.inserted_at
    }
  end
end
