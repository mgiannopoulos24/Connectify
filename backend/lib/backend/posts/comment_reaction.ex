defmodule Backend.Posts.CommentReaction do
  @moduledoc """
  The CommentReaction schema, representing a reaction on a comment by a user.
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Posts.Comment

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @reaction_types ~w(like support congrats awesome funny constructive)

  schema "comment_reactions" do
    field :type, :string

    belongs_to :user, User
    belongs_to :comment, Comment

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [:type, :user_id, :comment_id])
    |> validate_required([:type, :user_id, :comment_id])
    |> validate_inclusion(:type, @reaction_types)
    |> unique_constraint([:user_id, :comment_id], name: :user_comment_reaction_unique_index)
  end
end
