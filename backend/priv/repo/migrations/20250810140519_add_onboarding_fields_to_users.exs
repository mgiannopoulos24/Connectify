defmodule Backend.Repo.Migrations.AddOnboardingFieldsToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :location, :string
      add :onboarding_completed, :boolean, default: false, null: false
    end
  end
end
