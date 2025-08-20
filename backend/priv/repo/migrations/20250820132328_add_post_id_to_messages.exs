defmodule Backend.Repo.Migrations.AddPostIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      # The post_id is nullable because not all messages are shared posts.
      # If the original post is deleted, this value will be set to null.
      add :post_id, references(:posts, on_delete: :nilify_all, type: :binary_id)
    end

    # Add an index for faster lookups
    create index(:messages, [:post_id])
  end
end