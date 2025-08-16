defmodule Backend.Repo.Migrations.CreateJobApplications do
  use Ecto.Migration

  def change do
    create table(:job_applications, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :status, :string, null: false, default: "submitted"
      add :cover_letter, :text
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false

      add :job_posting_id, references(:job_postings, on_delete: :delete_all, type: :binary_id),
        null: false

      timestamps(type: :utc_datetime)
    end

    create index(:job_applications, [:user_id])
    create index(:job_applications, [:job_posting_id])

    create unique_index(:job_applications, [:user_id, :job_posting_id],
             name: :user_job_posting_unique_application_index
           )
  end
end
