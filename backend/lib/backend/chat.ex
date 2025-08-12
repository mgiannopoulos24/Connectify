defmodule Backend.Chat do
  @moduledoc """
  The Chat context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Chat.ChatRoom
  alias Backend.Chat.Message

  def get_or_create_chat_room(user1_id, user2_id) do
    # Ensure user1_id < user2_id to avoid duplicate rooms
    {u1, u2} = if user1_id < user2_id, do: {user1_id, user2_id}, else: {user2_id, user1_id}

    case Repo.get_by(ChatRoom, user1_id: u1, user2_id: u2) do
      nil ->
        %ChatRoom{}
        |> ChatRoom.changeset(%{user1_id: u1, user2_id: u2})
        |> Repo.insert()

      chat_room ->
        {:ok, chat_room}
    end
  end

  def create_message(chat_room, user, attrs \\ %{}) do
    attrs = Map.put(attrs, "user_id", user.id)

    %Message{chat_room_id: chat_room.id}
    |> Message.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, message} -> {:ok, Repo.preload(message, :user)}
      error -> error
    end
  end

  def list_messages(chat_room_id) do
    Message
    |> where(chat_room_id: ^chat_room_id)
    |> order_by(asc: :inserted_at)
    |> Repo.all()
    |> Repo.preload(:user)
  end

  def get_chat_room!(id) do
    Repo.get!(ChatRoom, id)
  end
end