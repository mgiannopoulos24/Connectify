defmodule Backend.Notifications.Notification do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "notifications" do
    field :type, :string
    field :resource_id, :binary_id
    field :resource_type, :string
    field :read_at, :utc_datetime

    belongs_to :user, User
    belongs_to :notifier, User, foreign_key: :notifier_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(notification, attrs) do
    notification
    |> cast(attrs, [:user_id, :notifier_id, :type, :resource_id, :resource_type, :read_at])
    |> validate_required([:user_id, :notifier_id, :type])
  end
end
