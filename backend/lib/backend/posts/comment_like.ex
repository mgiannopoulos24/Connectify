defmodule Backend.Posts.CommentLike do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Posts.Comment

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "comment_likes" do
    belongs_to :user, User
    belongs_to :comment, Comment

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(like, attrs) do
    like
    |> cast(attrs, [:user_id, :comment_id])
    |> validate_required([:user_id, :comment_id])
    |> unique_constraint([:user_id, :comment_id], name: :user_comment_like_unique_index)
  end
end
