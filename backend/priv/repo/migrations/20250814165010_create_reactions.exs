defmodule Backend.Repo.Migrations.CreateReactions do
  use Ecto.Migration

  def change do
    create table(:reactions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :type, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false
      add :post_id, references(:posts, on_delete: :delete_all, type: :binary_id), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:reactions, [:user_id])
    create index(:reactions, [:post_id])
    create unique_index(:reactions, [:user_id, :post_id], name: :user_post_reaction_unique_index)
  end
end
