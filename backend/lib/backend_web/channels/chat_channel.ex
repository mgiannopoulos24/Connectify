defmodule BackendWeb.ChatChannel do
  use BackendWeb, :channel
  alias Backend.Chat

  def join("chat:" <> chat_room_id, _payload, socket) do
    current_user_id = socket.assigns.current_user_id
    chat_room = Chat.get_chat_room!(chat_room_id)

    if current_user_id == chat_room.user1_id || current_user_id == chat_room.user2_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    chat_room_id = String.trim_leading(socket.topic, "chat:")
    chat_room = Chat.get_chat_room!(chat_room_id)
    user = %{id: socket.assigns.current_user_id}

    case Chat.create_message(chat_room, user, %{"content" => body}) do
      {:ok, message} ->
        broadcast!(socket, "new_msg", %{message: BackendWeb.MessageJSON.data(message)})
        {:reply, :ok, socket}

      {:error, changeset} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end
end