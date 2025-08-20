defmodule Backend.Interests.Interest do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @follow_types ["company", "user"]

  schema "interests" do
    field :type, :string
    field :followed_id, :binary_id

    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(interest, attrs) do
    interest
    |> cast(attrs, [:type, :user_id, :followed_id])
    |> validate_required([:type, :user_id, :followed_id])
    |> validate_inclusion(:type, @follow_types)
    |> unique_constraint([:user_id, :followed_id, :type], name: :user_follow_unique_index)
  end
end
