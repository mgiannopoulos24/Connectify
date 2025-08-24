defmodule BackendWeb.ChatController do
  use BackendWeb, :controller

  alias Backend.Chat
  alias BackendWeb.MessageJSON
  require Logger

  action_fallback BackendWeb.FallbackController

  @upload_dir "priv/static/uploads/chat_images"
  @file_upload_dir "priv/static/uploads/chat_files"

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

  def upload_image(conn, %{"image" => %Plug.Upload{} = image}) do
    File.mkdir_p!(@upload_dir)

    extension = Path.extname(image.filename)
    unique_filename = "#{Ecto.UUID.generate()}#{extension}"
    upload_path = Path.join(@upload_dir, unique_filename)

    case File.cp(image.path, upload_path) do
      :ok ->
        image_url = ~p"/uploads/chat_images/#{unique_filename}"

        conn
        |> put_status(:created)
        |> json(%{data: %{image_url: image_url}})

      {:error, reason} ->
        Logger.error("Failed to upload chat image: #{inspect(reason)}")

        conn
        |> put_status(:internal_server_error)
        |> json(%{errors: %{detail: "Failed to save image."}})
    end
  end

  def upload_image(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{errors: %{detail: "Image not provided."}})
  end

  def upload_file(conn, %{"file" => %Plug.Upload{} = file}) do
    File.mkdir_p!(@file_upload_dir)

    extension = Path.extname(file.filename)
    unique_filename = "#{Ecto.UUID.generate()}#{extension}"
    upload_path = Path.join(@file_upload_dir, unique_filename)

    case File.cp(file.path, upload_path) do
      :ok ->
        file_url = ~p"/uploads/chat_files/#{unique_filename}"

        conn
        |> put_status(:created)
        |> json(%{data: %{file_url: file_url, file_name: file.filename}})

      {:error, reason} ->
        Logger.error("Failed to upload chat file: #{inspect(reason)}")

        conn
        |> put_status(:internal_server_error)
        |> json(%{errors: %{detail: "Failed to save file."}})
    end
  end

  def upload_file(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{errors: %{detail: "File not provided."}})
  end

  def react_to_message(
        conn,
        %{"chat_room_id" => chat_room_id, "message_id" => message_id, "type" => type}
      ) do
    current_user = conn.assigns.current_user
    message = Chat.get_message!(message_id)

    if message.chat_room_id != chat_room_id do
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{detail: "Message does not belong to the specified chat room."}})
    else
      with {:ok, _reaction} <- Chat.react_to_message(current_user, message, type) do
        updated_message = Chat.get_message!(message.id)

        Phoenix.PubSub.broadcast(
          Backend.PubSub,
          "chat:#{chat_room_id}",
          {"msg_updated", %{message: MessageJSON.data(updated_message)}}
        )

        render(conn, MessageJSON, :show, message: updated_message)
      end
    end
  end

  def remove_reaction_from_message(conn, %{
        "chat_room_id" => chat_room_id,
        "message_id" => message_id
      }) do
    current_user = conn.assigns.current_user
    message = Chat.get_message!(message_id)

    if message.chat_room_id != chat_room_id do
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{detail: "Message does not belong to the specified chat room."}})
    else
      with {:ok, _} <- Chat.remove_reaction_from_message(current_user, message) do
        updated_message = Chat.get_message!(message.id)

        Phoenix.PubSub.broadcast(
          Backend.PubSub,
          "chat:#{chat_room_id}",
          {"msg_updated", %{message: MessageJSON.data(updated_message)}}
        )

        render(conn, MessageJSON, :show, message: updated_message)
      end
    end
  end
end
