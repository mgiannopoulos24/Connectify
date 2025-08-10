defmodule Backend.Interests.Interest do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "interests" do
    field :name, :string
    field :type, :string

    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(interest, attrs) do
    interest
    |> cast(attrs, [:name, :type, :user_id])
    |> validate_required([:name, :type, :user_id])
    |> unique_constraint([:user_id, :name, :type], name: :user_interest_unique_index)
  end
end
