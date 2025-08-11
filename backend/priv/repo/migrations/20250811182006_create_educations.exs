defmodule Backend.Repo.Migrations.CreateEducations do
  use Ecto.Migration

  def change do
    create table(:educations, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :school_name, :string, null: false
      add :degree, :string, null: false
      add :field_of_study, :string, null: false
      add :start_date, :date
      add :end_date, :date
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create index(:educations, [:user_id])
  end
end
