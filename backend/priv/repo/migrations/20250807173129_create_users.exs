defmodule Backend.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :name, :string
      add :surname, :string
      add :password_hash, :string
      add :phone_number, :string
      add :photo_url, :string

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end
