defmodule Backend.Repo.Migrations.AddGifUrlToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :gif_url, :string
    end
  end
end
