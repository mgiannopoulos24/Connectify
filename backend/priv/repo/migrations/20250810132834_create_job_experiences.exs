defmodule Backend.Repo.Migrations.CreateJobExperiences do
  use Ecto.Migration

  def change do
    create table(:job_experiences, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :job_title, :string, null: false
      add :employment_type, :string, null: false
      add :company_name, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create index(:job_experiences, [:user_id])
  end
end
