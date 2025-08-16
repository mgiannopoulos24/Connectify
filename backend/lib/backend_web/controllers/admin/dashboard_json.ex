defmodule BackendWeb.Admin.DashboardJSON do
  def index(%{stats: stats}) do
    %{data: data(stats)}
  end

  defp data(stats) do
    %{
      total_users: stats.total_users,
      accepted_connections: stats.accepted_connections,
      total_job_postings: stats.total_job_postings,
      total_posts: stats.total_posts
    }
  end
end
