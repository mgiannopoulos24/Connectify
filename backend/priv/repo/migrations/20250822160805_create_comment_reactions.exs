defmodule Backend.Repo.Migrations.CreateCommentReactions do
  use Ecto.Migration

  def change do
    create table(:comment_reactions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :type, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false

      add :comment_id, references(:comments, on_delete: :delete_all, type: :binary_id),
        null: false

      timestamps(type: :utc_datetime)
    end

    create index(:comment_reactions, [:user_id])
    create index(:comment_reactions, [:comment_id])

    create unique_index(:comment_reactions, [:user_id, :comment_id],
             name: :user_comment_reaction_unique_index
           )
  end
end
