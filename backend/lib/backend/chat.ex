defmodule Backend.Chat do
  @moduledoc """
  The Chat context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Chat.ChatRoom
  alias Backend.Chat.Message
  alias Backend.Chat.MessageReaction
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
        # OPTIMIZED: Preload user and post, plus an empty reactions list for the new message.
        {:ok, Repo.preload(message, [:user, post: [:user], reactions: []])}

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
    # Preload reactions and their users as well.
    |> preload([:user, post: [:user], reactions: [:user]])
    |> Repo.all()
  end

  def get_chat_room!(id) do
    Repo.get!(ChatRoom, id)
  end

  def get_message!(id) do
    Message
    |> Repo.get!(id)
    |> Repo.preload([:user, post: [:user], reactions: [:user]])
  end

  @doc """
  Reacts to a message for a given user. Creates or updates the reaction.
  """
  def react_to_message(user, message, type) do
    %MessageReaction{}
    |> MessageReaction.changeset(%{user_id: user.id, message_id: message.id, type: type})
    |> Repo.insert(
      on_conflict: [set: [type: type, updated_at: DateTime.utc_now()]],
      conflict_target: [:user_id, :message_id]
    )
  end

  @doc """
  Removes a reaction from a message for a given user.
  """
  def remove_reaction_from_message(user, message) do
    from(mr in MessageReaction, where: mr.user_id == ^user.id and mr.message_id == ^message.id)
    |> Repo.delete_all()

    {:ok, message}
  end
end