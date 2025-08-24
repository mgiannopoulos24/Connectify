defmodule BackendWeb.ChatChannelTest do
  use BackendWeb.ChannelCase, async: true
  alias Backend.Chat
  import Backend.AccountsFixtures

  setup do
    user1 = user_fixture()
    user2 = user_fixture()

    # ensure there is a chat room for the two users
    {:ok, room} = Chat.get_or_create_chat_room(user1.id, user2.id)

    %{
      user1: user1,
      user2: user2,
      room: room
    }
  end

  describe "join/3 authorization" do
    test "allows a user who is part of the chat room to join", %{user1: u1, room: room} do
      {:ok, _, socket} =
        socket("user_socket", %{current_user_id: u1.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      # join succeeded, socket present and assigned current_user_id preserved
      assert socket.assigns.current_user_id == u1.id
    end

    test "rejects a user who is not part of the chat room", %{room: room} do
      stranger = user_fixture()

      assert {:error, %{reason: "unauthorized"}} =
               subscribe_and_join(
                 socket("user_socket", %{current_user_id: stranger.id}),
                 BackendWeb.ChatChannel,
                 "chat:#{room.id}",
                 %{}
               )
    end
  end

  describe "handle_in/3 \"new_msg\"" do
    test "broadcasts new_msg and replies :ok when message creation succeeds", %{
      user1: u1,
      user2: u2,
      room: room
    } do
      {:ok, _, socket1} =
        socket("user_socket", %{current_user_id: u1.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      # another participant to ensure broadcast_from!/2 still transmits
      {:ok, _, _socket2} =
        socket("user_socket", %{current_user_id: u2.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      payload = %{"body" => "Hello!", "temp_id" => "temp-123"}

      ref = push(socket1, "new_msg", payload)
      assert_reply(ref, :ok, %{})

      # capture broadcast payload, accept atom- or string-keyed maps and assert expected keys
      assert_broadcast("new_msg", broadcast_payload)

      normalized =
        broadcast_payload
        |> Enum.into(%{}, fn
          {k, v} when is_atom(k) -> {Atom.to_string(k), v}
          {k, v} -> {k, v}
        end)

      assert normalized["temp_id"] == "temp-123"
      assert Map.has_key?(normalized, "message")
    end

    test "replies with error and does not broadcast when creation fails", %{
      user1: u1,
      room: room
    } do
      {:ok, _, socket} =
        socket("user_socket", %{current_user_id: u1.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      # send an invalid payload likely to fail validations (no content/post)
      ref = push(socket, "new_msg", %{"body" => nil, "temp_id" => "t-invalid"})

      # accept either string-keyed or atom-keyed payloads for errors
      assert_reply(ref, :error, payload)
      errors = payload["errors"] || payload[:errors]
      assert not is_nil(errors)
      # ensure nothing was broadcast
      refute_broadcast("new_msg", %{})
    end
  end

  describe "handle_in/3 \"typing\"" do
    test "broadcasts typing events to other subscribers", %{user1: u1, user2: u2, room: room} do
      {:ok, _, socket1} =
        socket("user_socket", %{current_user_id: u1.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      {:ok, _, _socket2} =
        socket("user_socket", %{current_user_id: u2.id})
        |> subscribe_and_join(BackendWeb.ChatChannel, "chat:#{room.id}", %{})

      push(socket1, "typing", %{"typing" => true, "user_id" => u1.id})
      # capture the id into a variable for pinning in the assert pattern
      uid = u1.id
      # typing broadcasts the payload unchanged
      assert_broadcast("typing", %{"typing" => true, "user_id" => ^uid})
    end
  end
end
