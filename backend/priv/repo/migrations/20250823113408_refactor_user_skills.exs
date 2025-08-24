defmodule Backend.Repo.Migrations.RefactorUserSkills do
  use Ecto.Migration

  def change do
    # Create the new join table for the many-to-many relationship
    create table(:users_skills, primary_key: false) do
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id),
        primary_key: true

      add :skill_id, references(:skills, on_delete: :delete_all, type: :binary_id),
        primary_key: true
    end

    # Previously, a skill was unique per user. Now, a skill name is globally unique.
    drop unique_index(:skills, [:user_id, :name], name: :user_skill_unique_index)
    create unique_index(:skills, [:name], name: :skills_name_index)

    # Finally, remove the user_id column from the skills table as it's no longer needed.
    alter table(:skills) do
      remove :user_id
    end
  end
end
