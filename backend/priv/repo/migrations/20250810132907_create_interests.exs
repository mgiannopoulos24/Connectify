defmodule Backend.Repo.Migrations.CreateInterests do
  use Ecto.Migration

  def change do
    create table(:interests, primary_key: false) do
      add :id, :binary_id, primary_key: true
      # e.g., "Google", "Microsoft"
      add :name, :string, null: false
      # e.g., "company"
      add :type, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create index(:interests, [:user_id])
    create unique_index(:interests, [:user_id, :name, :type], name: :user_interest_unique_index)
  end
end
