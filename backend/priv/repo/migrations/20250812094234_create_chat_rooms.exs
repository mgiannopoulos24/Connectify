defmodule Backend.Repo.Migrations.CreateChatRooms do
  use Ecto.Migration

  def change do
    create table(:chat_rooms, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user1_id, references(:users, on_delete: :delete_all, type: :binary_id)
      add :user2_id, references(:users, on_delete: :delete_all, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create index(:chat_rooms, [:user1_id])
    create index(:chat_rooms, [:user2_id])
    create unique_index(:chat_rooms, [:user1_id, :user2_id])
  end
end