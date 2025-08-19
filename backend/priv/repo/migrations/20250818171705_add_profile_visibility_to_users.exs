defmodule Backend.Repo.Migrations.AddProfileVisibilityToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :profile_visibility, :string, null: false, default: "public"
    end
  end
end
