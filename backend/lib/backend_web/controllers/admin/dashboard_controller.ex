defmodule BackendWeb.Admin.DashboardController do
  use BackendWeb, :controller

  alias Backend.Statistics
  alias BackendWeb.Admin.DashboardJSON

  def index(conn, _params) do
    stats = Statistics.get_dashboard_stats()
    render(conn, DashboardJSON, :index, stats: stats)
  end
end