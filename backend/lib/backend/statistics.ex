defmodule Backend.Statistics do
  @moduledoc """
  The Statistics context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Accounts.User
  alias Backend.Connections.Connection

  @doc """
  Gets all dashboard statistics.
  """
  def get_dashboard_stats do
    %{
      total_users: count_total_users(),
      accepted_connections: count_accepted_connections()
    }
  end

  defp count_total_users do
    Repo.aggregate(User, :count, :id)
  end

  defp count_accepted_connections do
    from(c in Connection, where: c.status == "accepted")
    |> Repo.aggregate(:count, :id)
  end
end