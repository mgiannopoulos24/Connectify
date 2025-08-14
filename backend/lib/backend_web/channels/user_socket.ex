defmodule BackendWeb.UserSocket do
  use Phoenix.Socket

  alias Backend.Auth
  require Logger

  channel "chat:*", BackendWeb.ChatChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    Logger.info("UserSocket: Attempting to connect with token.")

    case Auth.verify_token(token) do
      {:ok, user_id} ->
        Logger.info("UserSocket: Token verified for user_id: #{user_id}. Connection successful.")
        {:ok, assign(socket, :current_user_id, user_id)}

      # Handle the error case gracefully instead of crashing.
      {:error, reason} ->
        Logger.error("UserSocket: Token verification failed. Reason: #{inspect(reason)}")
        :error
    end
  end

  # This new function clause handles the case where the frontend doesn't provide a token.
  @impl true
  def connect(_params, _socket, _connect_info) do
    Logger.error("UserSocket: Connection attempt failed. Token was not provided in params.")
    :error
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end
