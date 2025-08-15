defmodule BackendWeb.UserSocket do
  use Phoenix.Socket

  alias Backend.Auth
  alias Backend.Accounts
  require Logger

  channel "chat:*", BackendWeb.ChatChannel
  channel "status", BackendWeb.StatusChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    Logger.info("UserSocket: Attempting to connect with token.")

    case Auth.verify_token(token) do
      {:ok, user_id} ->
        Logger.info("UserSocket: Token verified for user_id: #{user_id}. Connection successful.")

        try do
          user = Accounts.get_user!(user_id)
          Accounts.update_user_status(user, "active")
          {:ok, assign(socket, :current_user_id, user.id)}
        rescue
          Ecto.NoResultsError ->
            Logger.error("UserSocket: User with id #{user_id} not found.")
            :error
        end

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
  def terminate(_reason, socket) do
    if user_id = socket.assigns.current_user_id do
      Logger.info("UserSocket: User #{user_id} disconnected.")

      if user = Accounts.get_user(user_id) do
        Accounts.update_user_status(user, "offline")
      end
    end

    :ok
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end