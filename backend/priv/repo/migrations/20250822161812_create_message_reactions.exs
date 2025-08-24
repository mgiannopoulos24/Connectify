defmodule Backend.Repo.Migrations.CreateMessageReactions do
  use Ecto.Migration

  def change do
    create table(:message_reactions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :type, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all, type: :binary_id), null: false

      add :message_id, references(:messages, on_delete: :delete_all, type: :binary_id),
        null: false

      timestamps(type: :utc_datetime)
    end

    create index(:message_reactions, [:user_id])
    create index(:message_reactions, [:message_id])

    create unique_index(:message_reactions, [:user_id, :message_id],
             name: :user_message_reaction_unique_index
           )
  end
end
