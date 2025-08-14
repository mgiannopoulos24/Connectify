defmodule Backend.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :content, :text, null: true
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id)
      add :chat_room_id, references(:chat_rooms, on_delete: :delete_all, type: :binary_id)
      add :image_url, :string

      timestamps(type: :utc_datetime)
    end

    create index(:messages, [:chat_room_id])
    create index(:messages, [:user_id])
  end
end
