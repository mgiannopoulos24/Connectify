defmodule Backend.Repo.Migrations.AddParentIdToComments do
  use Ecto.Migration

  def change do
    alter table(:comments) do
      add :parent_comment_id, references(:comments, on_delete: :delete_all, type: :binary_id)
    end

    create index(:comments, [:parent_comment_id])
  end
end
