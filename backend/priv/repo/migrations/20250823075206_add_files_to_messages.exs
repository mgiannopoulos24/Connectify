defmodule Backend.Repo.Migrations.AddFilesToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :file_url, :string
      add :file_name, :string
    end
  end
end
