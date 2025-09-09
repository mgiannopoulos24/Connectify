defmodule Backend.Chat.MessageReaction do
  @moduledoc """
  The MessageReaction schema represents a reaction (like, love, etc.)
  made by a user to a message in a chat room.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Chat.Message

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "message_reactions" do
    field :type, :string

    belongs_to :user, User
    belongs_to :message, Message

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [:type, :user_id, :message_id])
    |> validate_required([:type, :user_id, :message_id])
    |> unique_constraint([:user_id, :message_id], name: :user_message_reaction_unique_index)
  end
end
