defmodule Backend.Repo.Migrations.CreateJobPostings do
  use Ecto.Migration

  def change do
    create table(:job_postings, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :text, null: false
      add :location, :string
      add :job_type, :string, comment: "e.g., Full-time, Part-time, Contract"
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false

      add :company_id, references(:companies, on_delete: :nilify_all, type: :binary_id),
        null: false

      timestamps(type: :utc_datetime)
    end

    create index(:job_postings, [:user_id])
    create index(:job_postings, [:company_id])
  end
end
