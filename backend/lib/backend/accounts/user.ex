defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :email, :string
    field :name, :string
    field :surname, :string
    field :password_hash, :string
    field :phone_number, :string
    field :photo_url, :string
    field :role, :string, default: "professional"

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :surname, :email, :password_hash, :phone_number, :photo_url, :role])
    |> validate_required([:name, :surname, :email, :password_hash])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> unique_constraint(:email)
  end
end
