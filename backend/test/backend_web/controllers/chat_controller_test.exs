defmodule BackendWeb.ChatControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Chat
  alias Backend.Repo
  import Backend.AccountsFixtures

  @doc """
  Posts a multipart request with a file upload.
  """
  defp multipart_post(conn, path, parts) do
    boundary = "multipart-boundary"

    body =
      Enum.reduce(parts, "", fn {key, path, {content_type, _headers}}, acc ->
        content = File.read!(path)
        filename = Path.basename(path)

        # Using a sigil for the line with quotes to resolve the linter warning.
        disposition_header =
          ~s(Content-Disposition: form-data; name="#{key}"; filename="#{filename}"\r\n)

        acc <>
          "--#{boundary}\r\n" <>
          disposition_header <>
          "Content-Type: #{content_type}\r\n\r\n" <>
          content <> "\r\n"
      end) <> "--#{boundary}--\r\n"

    conn
    |> put_req_header("content-type", "multipart/form-data; boundary=#{boundary}")
    |> post(path, body)
  end

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    user1 =
      user_fixture(%{
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    user2 =
      user_fixture(%{
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    logged_in_conn = login_user(build_conn(), user1)

    %{user1: user1, user2: user2, conn: logged_in_conn}
  end

  describe "POST /api/chat" do
    test "creates a new chat room between two users", %{conn: conn, user2: user2} do
      conn = post(conn, ~p"/api/chat", %{"user_id" => user2.id})
      response_data = json_response(conn, 201)["data"]
      assert is_binary(response_data["id"])

      # Verify the room exists in the DB
      assert Repo.get(Chat.ChatRoom, response_data["id"])
    end

    test "returns the same chat room if one already exists", %{
      conn: conn,
      user1: user1,
      user2: user2
    } do
      {:ok, room} = Chat.get_or_create_chat_room(user1.id, user2.id)

      conn = post(conn, ~p"/api/chat", %{"user_id" => user2.id})
      response_data = json_response(conn, 201)["data"]
      assert response_data["id"] == room.id
    end
  end

  describe "GET /api/chat/:chat_room_id/messages" do
    setup %{user1: user1, user2: user2} do
      {:ok, room} = Chat.get_or_create_chat_room(user1.id, user2.id)
      {:ok, _message} = Chat.create_message(room, user1, %{"content" => "Hello"})
      %{room: room}
    end

    test "lists all messages in a chat room", %{conn: conn, room: room} do
      conn = get(conn, ~p"/api/chat/#{room.id}/messages")
      response_data = json_response(conn, 200)["data"]
      assert length(response_data) == 1
      assert hd(response_data)["content"] == "Hello"
    end

    test "returns an empty list for a non-existent chat room ID", %{conn: conn} do
      conn = get(conn, ~p"/api/chat/#{Ecto.UUID.generate()}/messages")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "file and image uploads" do
    test "POST /api/chat/upload_image uploads an image", %{conn: conn} do
      File.write!("test_image.png", "dummy image content")
      image_path = Path.join(File.cwd!(), "test_image.png")

      conn =
        multipart_post(conn, ~p"/api/chat/upload_image", [
          {"image", image_path, {"image/png", []}}
        ])

      response_data = json_response(conn, 201)["data"]
      assert response_data["image_url"] =~ ~r/^\/uploads\/chat_images\/.+\.png$/
      File.rm("test_image.png")
    end

    test "POST /api/chat/upload_file uploads a file", %{conn: conn} do
      # --- FIX: Create and clean up the dummy file within the test ---
      File.write!("test_file.txt", "dummy file content")
      file_path = Path.join(File.cwd!(), "test_file.txt")

      conn =
        multipart_post(conn, ~p"/api/chat/upload_file", [
          {"file", file_path, {"text/plain", []}}
        ])

      response_data = json_response(conn, 201)["data"]
      assert response_data["file_url"] =~ ~r/^\/uploads\/chat_files\/.+\.txt$/
      assert response_data["file_name"] == "test_file.txt"
      File.rm("test_file.txt")
    end

    test "returns 400 Bad Request if no image is provided", %{conn: conn} do
      conn = post(conn, ~p"/api/chat/upload_image", %{})
      assert json_response(conn, 400)["errors"]["detail"] == "Image not provided."
    end
  end

  describe "message reactions" do
    setup %{user1: user1, user2: user2} do
      {:ok, room} = Chat.get_or_create_chat_room(user1.id, user2.id)
      {:ok, message} = Chat.create_message(room, user2, %{"content" => "React to me"})
      # Subscribe the test process to the chat room's topic
      Phoenix.PubSub.subscribe(Backend.PubSub, "chat:#{room.id}")
      %{room: room, message: message}
    end

    test "POST /.../react adds a reaction and broadcasts an update", %{
      conn: conn,
      room: room,
      message: message
    } do
      conn =
        post(conn, ~p"/api/chat/#{room.id}/messages/#{message.id}/react", %{
          "type" => "like"
        })

      response_data = json_response(conn, 200)["data"]
      assert Enum.any?(response_data["reactions"], &(&1["type"] == "like"))

      assert_receive {"msg_updated", %{message: updated_message}}
      assert updated_message["id"] == message.id
      assert Enum.any?(updated_message["reactions"], &(&1["type"] == "like"))
    end

    test "DELETE /.../react removes a reaction and broadcasts an update", %{
      conn: conn,
      user1: user1,
      room: room,
      message: message
    } do
      # First, add a reaction to remove
      Chat.react_to_message(user1, message, "like")

      conn = delete(conn, ~p"/api/chat/#{room.id}/messages/#{message.id}/react")
      response_data = json_response(conn, 200)["data"]
      assert response_data["reactions"] == []

      assert_receive {"msg_updated", %{message: updated_message}}
      assert updated_message["id"] == message.id
      assert updated_message["reactions"] == []
    end

    test "returns 400 if message does not belong to the chat room", %{
      conn: conn,
      user1: user1,
      room: room
    } do
      # Create a message in a different room
      user3 = user_fixture()
      {:ok, other_room} = Chat.get_or_create_chat_room(user1.id, user3.id)
      {:ok, other_message} = Chat.create_message(other_room, user3, %{"content" => "Wrong room"})

      conn =
        post(conn, ~p"/api/chat/#{room.id}/messages/#{other_message.id}/react", %{
          "type" => "like"
        })

      assert json_response(conn, 400)["errors"]["detail"]
    end
  end
end
