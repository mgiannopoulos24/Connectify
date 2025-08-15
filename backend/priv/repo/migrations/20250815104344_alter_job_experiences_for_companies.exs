defmodule Backend.Repo.Migrations.AlterJobExperiencesForCompanies do
  use Ecto.Migration

  def change do
    alter table(:job_experiences) do
      # We remove the old free-text field
      remove :company_name
      # We add a foreign key to the companies table
      add :company_id, references(:companies, on_delete: :nilify_all, type: :binary_id)
    end

    create index(:job_experiences, [:company_id])
  end
end