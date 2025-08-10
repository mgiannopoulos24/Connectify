defmodule Backend.Repo.Migrations.AddEmailConfirmationToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :email_confirmation_token, :string
      add :email_confirmed_at, :naive_datetime
    end

    create index(:users, [:email_confirmation_token])
  end
end
