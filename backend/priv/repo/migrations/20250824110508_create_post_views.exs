defmodule Backend.Repo.Migrations.CreatePostViews do
  use Ecto.Migration

  def change do
    create table(:post_views, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false
      add :post_id, references(:posts, on_delete: :delete_all, type: :binary_id), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:post_views, [:user_id])
    create index(:post_views, [:post_id])

    create unique_index(:post_views, [:user_id, :post_id], name: :user_post_view_unique_index)
  end
end
