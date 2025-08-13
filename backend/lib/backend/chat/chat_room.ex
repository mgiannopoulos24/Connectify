defmodule Backend.Chat.ChatRoom do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Chat.Message

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "chat_rooms" do
    belongs_to :user1, User, foreign_key: :user1_id
    belongs_to :user2, User, foreign_key: :user2_id
    has_many :messages, Message

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(chat_room, attrs) do
    chat_room
    |> cast(attrs, [:user1_id, :user2_id])
    |> validate_required([:user1_id, :user2_id])
    |> unique_constraint([:user1_id, :user2_id], name: :chat_rooms_user1_id_user2_id_index)
  end
end
