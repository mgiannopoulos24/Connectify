defmodule Backend.Repo.Migrations.CreateCompanies do
  use Ecto.Migration

  def change do
    create table(:companies, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :logo_url, :string
      add :description, :text

      timestamps(type: :utc_datetime)
    end

    create unique_index(:companies, [:name])
  end
end
