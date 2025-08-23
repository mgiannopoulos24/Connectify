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
      Logger.warning(
        "ChatChannel: Unauthorized attempt by user #{current_user_id} to join chat room #{chat_room_id}.",
        []
      )

      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("new_msg", payload, socket) do
    chat_room_id = String.trim_leading(socket.topic, "chat:")
    chat_room = Chat.get_chat_room!(chat_room_id)
    user = %{id: socket.assigns.current_user_id}

    Logger.info("ChatChannel: Received new_msg in room #{chat_room_id} from user #{user.id}.")

    # "body" from the client maps to the "content" field in the database.
    # The payload can also contain an "image_url". Both are optional.
    attrs = %{
      "content" => payload["body"],
      "image_url" => payload["image_url"],
      "file_url" => payload["file_url"],
      "file_name" => payload["file_name"],
      "gif_url" => payload["gif_url"]
    }

    case Chat.create_message(chat_room, user, attrs) do
      {:ok, message} ->
        broadcast_from!(socket, "new_msg", %{
          message: BackendWeb.MessageJSON.data(message),
          temp_id: payload["temp_id"]
        })

        {:reply, :ok, socket}

      {:error, changeset} ->
        Logger.error("ChatChannel: Failed to create message. Changeset: #{inspect(changeset)}")
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end

  def handle_in("typing", payload, socket) do
    Logger.info(
      "ChatChannel: Broadcasting typing event from user #{socket.assigns.current_user_id}."
    )

    broadcast_from!(socket, "typing", payload)
    {:noreply, socket}
  end
end