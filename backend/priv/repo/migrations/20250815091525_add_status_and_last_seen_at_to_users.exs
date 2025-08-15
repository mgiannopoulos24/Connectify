defmodule Backend.Repo.Migrations.AddStatusAndLastSeenAtToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :status, :string, default: "offline", null: false
      add :last_seen_at, :naive_datetime
    end
  end
end
