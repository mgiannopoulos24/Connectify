defmodule Backend.Connections.Connection do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @statuses ["pending", "accepted", "declined"]

  schema "connections" do
    field :status, :string, default: "pending"

    belongs_to :user, User, foreign_key: :user_id
    belongs_to :connected_user, User, foreign_key: :connected_user_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(connection, attrs) do
    connection
    |> cast(attrs, [:user_id, :connected_user_id, :status])
    |> validate_required([:user_id, :connected_user_id, :status])
    |> validate_inclusion(:status, @statuses)
    |> unique_constraint([:user_id, :connected_user_id], name: :user_connection_unique_index)
  end
end
