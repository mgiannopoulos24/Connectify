defmodule BackendWeb.UserSocket do
  use Phoenix.Socket

  alias Backend.Auth

  channel("chat:*", BackendWeb.ChatChannel)

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case Auth.verify_token(token) do
      {:ok, user_id} ->
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, _reason} ->
        :error
    end
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end