defmodule BackendWeb.ChatController do
  use BackendWeb, :controller

  alias Backend.Chat
  alias BackendWeb.MessageJSON
  require Logger

  action_fallback BackendWeb.FallbackController

  @upload_dir "priv/static/uploads/chat_images"

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
end
