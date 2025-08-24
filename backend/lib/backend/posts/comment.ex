defmodule Backend.Posts.Comment do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "comments" do
    field :content, :string

    belongs_to :user, User
    belongs_to :post, Backend.Posts.Post

    # Self-referencing association for replies
    belongs_to :parent_comment, __MODULE__, foreign_key: :parent_comment_id
    has_many :replies, __MODULE__, foreign_key: :parent_comment_id, on_delete: :delete_all

    has_many :reactions, Backend.Posts.CommentReaction, on_delete: :delete_all

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(comment, attrs) do
    comment
    |> cast(attrs, [:content, :user_id, :post_id, :parent_comment_id])
    |> validate_required([:content, :user_id, :post_id])
  end
end
