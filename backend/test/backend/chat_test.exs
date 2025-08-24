defmodule Backend.ChatTest do
  use Backend.DataCase, async: true

  alias Backend.Chat
  alias Backend.Repo
  alias Backend.Chat.{MessageReaction, Message}

  import Backend.AccountsFixtures
  import Ecto.Query

  describe "chat rooms and messages" do
    test "get_or_create_chat_room/2 creates a room and reuses it regardless of id order" do
      u1 = user_fixture()
      u2 = user_fixture()

      {:ok, room1} = Chat.get_or_create_chat_room(u1.id, u2.id)
      {:ok, room2} = Chat.get_or_create_chat_room(u2.id, u1.id)

      assert room1.id == room2.id
      assert room1.user1_id in [u1.id, u2.id]
      assert room1.user2_id in [u1.id, u2.id]
      assert room1.user1_id != room1.user2_id
    end

    test "create_message/3 inserts a message and returns the inserted record" do
      sender = user_fixture()
      recipient = user_fixture()
      {:ok, room} = Chat.get_or_create_chat_room(sender.id, recipient.id)

      assert {:ok, %Message{} = msg} =
               Chat.create_message(room, sender, %{"content" => "Hello there"})

      # Check fields returned from the insert (avoid relying on schema preloads that may not exist)
      assert msg.user_id == sender.id
      assert msg.content == "Hello there"
      assert msg.chat_room_id == room.id
    end

    test "messages inserted have increasing inserted_at timestamps (order preserved)" do
      u1 = user_fixture()
      u2 = user_fixture()
      {:ok, room} = Chat.get_or_create_chat_room(u1.id, u2.id)

      {:ok, m1} = Chat.create_message(room, u1, %{"content" => "first"})
      # small sleep to help with distinct timestamps in fast test environments
      :timer.sleep(1)
      {:ok, m2} = Chat.create_message(room, u2, %{"content" => "second"})

      # allow equality in high-resolution clocks while ensuring m1 is not after m2
      assert DateTime.compare(m1.inserted_at, m2.inserted_at) in [:lt, :eq]
    end
  end

  describe "reactions" do
    test "react_to_message/3 creates a reaction and updates on conflict" do
      author = user_fixture()
      other = user_fixture()
      {:ok, room} = Chat.get_or_create_chat_room(author.id, other.id)
      {:ok, message} = Chat.create_message(room, author, %{"content" => "reactable"})

      # first react
      assert {:ok, _} = Chat.react_to_message(other, message, "like")
      r = Repo.get_by(MessageReaction, user_id: other.id, message_id: message.id)
      assert r.type == "like"

      # second react with different type should update existing reaction (on_conflict)
      assert {:ok, _} = Chat.react_to_message(other, message, "love")
      r2 = Repo.get_by(MessageReaction, user_id: other.id, message_id: message.id)
      assert r2.type == "love"

      # ensure only one reaction exists for this user/message pair
      count =
        from(mr in MessageReaction,
          where: mr.user_id == ^other.id and mr.message_id == ^message.id
        )
        |> Repo.aggregate(:count, :id)

      assert count == 1
    end

    test "remove_reaction_from_message/2 deletes reactions and returns {:ok, message}" do
      a = user_fixture()
      b = user_fixture()
      {:ok, room} = Chat.get_or_create_chat_room(a.id, b.id)
      {:ok, message} = Chat.create_message(room, a, %{"content" => "to be unreacted"})

      {:ok, _} = Chat.react_to_message(b, message, "like")
      assert Repo.get_by(MessageReaction, user_id: b.id, message_id: message.id) != nil

      assert {:ok, ^message} = Chat.remove_reaction_from_message(b, message)
      assert Repo.get_by(MessageReaction, user_id: b.id, message_id: message.id) == nil
    end
  end

  describe "send_post_as_message/3 edge cases" do
    test "returns {:error, :not_connected} when sender and recipient are not connected" do
      sender = user_fixture()
      recipient = user_fixture()

      # use a minimal Post struct — the function checks connection first so no DB post needed
      post = struct(%Backend.Posts.Post{}, id: Ecto.UUID.generate())

      assert {:error, :not_connected} = Chat.send_post_as_message(sender, recipient.id, post)
    end
  end
end
