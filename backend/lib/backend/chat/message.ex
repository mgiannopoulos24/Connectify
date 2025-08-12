defmodule Backend.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Chat.ChatRoom

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "messages" do
    field :content, :string
    belongs_to :user, User
    belongs_to :chat_room, ChatRoom

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :user_id, :chat_room_id])
    |> validate_required([:content, :user_id, :chat_room_id])
  end
end