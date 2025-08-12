defmodule BackendWeb.ChatController do
  use BackendWeb, :controller

  alias Backend.Chat
  alias BackendWeb.MessageJSON

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"user_id" => other_user_id}) do
    current_user = conn.assigns.current_user

    with {:ok, chat_room} <- Chat.get_or_create_chat_room(current_user.id, other_user_id) do
      conn
      |> put_status(:created)
      |> json(%{data: %{id: chat_room.id}})
    end
  end

  def index(conn, %{"chat_room_id" => chat_room_id}) do
    messages = Chat.list_messages(chat_room_id)
    render(conn, MessageJSON, :index, messages: messages)
  end
end