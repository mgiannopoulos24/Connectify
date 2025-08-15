defmodule Backend.Posts.Reaction do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  # No need to alias Post here anymore for the schema definition.

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @reaction_types ~w(like support congrats awesome funny constructive)

  schema "reactions" do
    field :type, :string

    belongs_to :user, User
    belongs_to :post, Backend.Posts.Post

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [:type, :user_id, :post_id])
    |> validate_required([:type, :user_id, :post_id])
    |> validate_inclusion(:type, @reaction_types)
    |> unique_constraint([:user_id, :post_id], name: :user_post_reaction_unique_index)
  end
end
