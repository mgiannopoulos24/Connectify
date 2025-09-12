defmodule Backend.Release do
  @moduledoc """
  Module for handling database migrations and seeding during releases.
  """
  @app :backend

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def seed do
    load_app()
    
    # Start the application to ensure all modules are loaded
    {:ok, _} = Application.ensure_all_started(@app)
    
    # Load and execute the seeds file
    seeds_file = Path.join([Application.app_dir(@app, "priv"), "repo", "seeds.exs"])
    
    if File.exists?(seeds_file) do
      IO.puts("Running seeds from #{seeds_file}...")
      Code.eval_file(seeds_file)
      IO.puts("Seeds completed successfully!")
    else
      IO.puts("No seeds file found at #{seeds_file}")
    end
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
