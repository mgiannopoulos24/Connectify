defmodule Backend.Chat do
  @moduledoc """
  The Chat context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Chat.ChatRoom
  alias Backend.Chat.Message
  # --- FIX: Alias the correct context ---
  alias Backend.Accounts
  alias Backend.Posts.Post

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
      {:ok, message} ->
        # OPTIMIZED: Preload only the post and its author, not comments/reactions.
        {:ok, Repo.preload(message, [:user, post: [:user]])}

      error ->
        error
    end
  end

  @doc """
  Sends a post as a message from a sender to a recipient.
  Verifies that the sender and recipient are connected.
  """
  def send_post_as_message(sender, recipient_id, %Post{} = post) do
    # --- FIX: Call are_users_connected? from the Accounts context ---
    if Accounts.are_users_connected?(sender.id, recipient_id) do
      with {:ok, chat_room} <- get_or_create_chat_room(sender.id, recipient_id) do
        create_message(chat_room, sender, %{"post_id" => post.id})
      end
    else
      {:error, :not_connected}
    end
  end

  def list_messages(chat_room_id) do
    Message
    |> where(chat_room_id: ^chat_room_id)
    |> order_by(asc: :inserted_at)
    # OPTIMIZED: Preload only the post and its author for the message list.
    |> preload([:user, post: [:user]])
    |> Repo.all()
  end

  def get_chat_room!(id) do
    Repo.get!(ChatRoom, id)
  end
end
