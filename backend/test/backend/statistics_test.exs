defmodule Backend.StatisticsTest do
  use Backend.DataCase, async: true

  alias Backend.Statistics
  import Backend.AccountsFixtures

  test "get_dashboard_stats returns correct counts" do
    assert %{total_users: 0, accepted_connections: 0} == Statistics.get_dashboard_stats()

    user1 = user_fixture()
    user2 = user_fixture()
    user3 = user_fixture()

    assert %{total_users: 3, accepted_connections: 0} == Statistics.get_dashboard_stats()

    {:ok, conn1} = Backend.Connections.send_connection_request(user1.id, user2.id)
    Backend.Connections.send_connection_request(user1.id, user3.id)

    assert %{total_users: 3, accepted_connections: 0} == Statistics.get_dashboard_stats()

    {:ok, accepted_conn} = Backend.Connections.accept_connection_request(conn1)
    assert accepted_conn.status == "accepted"

    assert %{total_users: 3, accepted_connections: 1} == Statistics.get_dashboard_stats()
  end
end