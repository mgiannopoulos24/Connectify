defmodule Backend.Repo.Migrations.RefactorInterestsForFollows do
  use Ecto.Migration

  def change do
    # The old index needs to be dropped first before changing columns it depends on.
    drop unique_index(:interests, [:user_id, :name, :type], name: :user_interest_unique_index)

    alter table(:interests) do
      # Remove the old name column
      remove :name
      # Add the new polymorphic ID column.
      # It cannot be a foreign key because it can refer to different tables.
      add :followed_id, :binary_id, null: false
    end

    # Create an index on the new column for performance.
    create index(:interests, [:followed_id])

    # Re-create the unique index with the new column to prevent duplicate follows.
    create unique_index(:interests, [:user_id, :followed_id, :type],
             name: :user_follow_unique_index
           )
  end
end
