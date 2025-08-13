defmodule Backend.Repo.Migrations.CreateConnections do
  use Ecto.Migration

  def change do
    create table(:connections, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :status, :string, null: false, default: "pending"
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)
      add :connected_user_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create index(:connections, [:user_id])
    create index(:connections, [:connected_user_id])

    create unique_index(:connections, [:user_id, :connected_user_id],
             name: :user_connection_unique_index
           )
  end
end
