defmodule Backend.Repo.Migrations.CreateNotifications do
  use Ecto.Migration

  def change do
    create table(:notifications, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :type, :string, null: false
      add :read_at, :utc_datetime
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false
      add :notifier_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false
      add :resource_id, :binary_id
      add :resource_type, :string

      timestamps(type: :utc_datetime)
    end

    create index(:notifications, [:user_id])
    create index(:notifications, [:notifier_id])
  end
end
