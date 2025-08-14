defmodule BackendWeb.Admin.DashboardJSON do
  def index(%{stats: stats}) do
    %{data: data(stats)}
  end

  defp data(stats) do
    %{
      total_users: stats.total_users,
      accepted_connections: stats.accepted_connections
    }
  end
end
