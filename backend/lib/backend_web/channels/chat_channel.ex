defmodule BackendWeb.ChatChannel do
  use BackendWeb, :channel
  alias Backend.Chat
  require Logger

  def join("chat:" <> chat_room_id, _payload, socket) do
    current_user_id = socket.assigns.current_user_id

    Logger.info(
      "ChatChannel: User #{current_user_id} attempting to join chat room #{chat_room_id}."
    )

    chat_room = Chat.get_chat_room!(chat_room_id)

    if current_user_id == chat_room.user1_id || current_user_id == chat_room.user2_id do
      Logger.info(
        "ChatChannel: User #{current_user_id} successfully joined chat room #{chat_room_id}."
      )

      {:ok, socket}
    else
      Logger.warn(
        "ChatChannel: Unauthorized attempt by user #{current_user_id} to join chat room #{chat_room_id}."
      )

      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    chat_room_id = String.trim_leading(socket.topic, "chat:")
    chat_room = Chat.get_chat_room!(chat_room_id)
    user = %{id: socket.assigns.current_user_id}

    Logger.info("ChatChannel: Received new_msg in room #{chat_room_id} from user #{user.id}.")

    case Chat.create_message(chat_room, user, %{"content" => body}) do
      {:ok, message} ->
        # BONUS IMPROVEMENT: Use `broadcast_from!` to avoid sending the message back to the sender.
        broadcast_from!(socket, "new_msg", %{message: BackendWeb.MessageJSON.data(message)})
        {:reply, :ok, socket}

      {:error, changeset} ->
        Logger.error("ChatChannel: Failed to create message. Changeset: #{inspect(changeset)}")
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end

  # FIX: Add this new function to handle the "typing" event.
  def handle_in("typing", payload, socket) do
    # This broadcasts the "typing" event to everyone in the channel
    # EXCEPT for the user who sent it. This is exactly what we want.
    Logger.info(
      "ChatChannel: Broadcasting typing event from user #{socket.assigns.current_user_id}."
    )

    broadcast_from!(socket, "typing", payload)
    {:noreply, socket}
  end
end
