defmodule BackendWeb.ConnectionController do
  use BackendWeb, :controller

  alias Backend.Connections
  alias Backend.Connections.Connection
  alias BackendWeb.ConnectionJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    connections = Connections.list_user_connections(current_user.id)
    render(conn, ConnectionJSON, :index, connections: connections, current_user: current_user)
  end

  def pending(conn, _params) do
    current_user = conn.assigns.current_user
    pending_requests = Connections.list_pending_requests(current_user.id)
    render(conn, ConnectionJSON, :pending, pending_requests: pending_requests)
  end

  def create(conn, %{"recipient_id" => recipient_id}) do
    current_user = conn.assigns.current_user

    with {:ok, %Connection{} = connection} <- Connections.send_connection_request(current_user.id, recipient_id) do
      conn
      |> put_status(:created)
      |> render(ConnectionJSON, :show, connection: connection)
    end
  end

  def accept(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    connection = Connections.get_connection!(id)

    if connection.connected_user_id == current_user.id do
      with {:ok, %Connection{} = connection} <- Connections.accept_connection_request(connection) do
        render(conn, ConnectionJSON, :show, connection: connection)
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def decline(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    connection = Connections.get_connection!(id)

    # Allow either the recipient to decline or the sender to withdraw the request
    if connection.connected_user_id == current_user.id or connection.user_id == current_user.id do
      with {:ok, _} <- Connections.decline_connection_request(connection) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end
end