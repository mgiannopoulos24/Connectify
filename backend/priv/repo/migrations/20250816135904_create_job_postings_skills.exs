defmodule Backend.Repo.Migrations.CreateJobPostingsSkills do
  use Ecto.Migration

  def change do
    create table(:job_postings_skills, primary_key: false) do
      add :job_posting_id, references(:job_postings, on_delete: :delete_all, type: :binary_id),
        primary_key: true

      add :skill_id, references(:skills, on_delete: :delete_all, type: :binary_id),
        primary_key: true
    end
  end
end
