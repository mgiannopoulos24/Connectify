defmodule BackendWeb.ConnectionJSONTest do
  use Backend.DataCase, async: true

  alias Backend.Connections
  alias Backend.Repo
  alias BackendWeb.ConnectionJSON

  import Ecto.Query
  import Backend.AccountsFixtures
  import Backend.CareersFixtures

  setup do
    current_user = user_fixture()

    user_with_job = user_fixture()
    company = company_fixture()

    job_experience_fixture(%{
      user_id: user_with_job.id,
      company_id: company.id,
      job_title: "Software Engineer"
    })

    user_no_job = user_fixture()

    %{current_user: current_user, user_with_job: user_with_job, user_no_job: user_no_job}
  end

  describe "index/1" do
    test "renders a list of connections", %{
      current_user: me,
      user_with_job: friend1,
      user_no_job: friend2
    } do
      # Connection where "me" is the requester
      {:ok, conn1_req} = Connections.send_connection_request(me.id, friend1.id)
      {:ok, conn1} = Connections.accept_connection_request(conn1_req)

      # Connection where "me" is the recipient
      {:ok, conn2_req} = Connections.send_connection_request(friend2.id, me.id)
      {:ok, conn2} = Connections.accept_connection_request(conn2_req)

      connections =
        from(c in Connections.Connection, where: c.id in ^[conn1.id, conn2.id])
        |> Repo.all()
        |> Repo.preload(user: [:job_experiences], connected_user: [:job_experiences])

      result = ConnectionJSON.index(%{connections: connections, current_user: me})
      assert length(result.data) == 2

      # Find rendered data by ID for reliable assertions
      conn_with_job = Enum.find(result.data, &(&1["connected_user"]["id"] == friend1.id))
      conn_no_job = Enum.find(result.data, &(&1["connected_user"]["id"] == friend2.id))

      assert conn_with_job["connected_user"]["job_title"] == "Software Engineer"
      assert conn_no_job["connected_user"]["job_title"] == "Professional"
    end

    test "renders an empty list when no connections are provided", %{current_user: me} do
      result = ConnectionJSON.index(%{connections: [], current_user: me})
      assert result == %{data: []}
    end
  end

  describe "pending/1" do
    test "renders a list of pending requests", %{
      current_user: me,
      user_with_job: sender1,
      user_no_job: sender2
    } do
      Connections.send_connection_request(sender1.id, me.id)
      Connections.send_connection_request(sender2.id, me.id)

      # Preload data as the controller would
      pending_requests = Connections.list_pending_requests(me.id)

      result = ConnectionJSON.pending(%{pending_requests: pending_requests})
      assert length(result.data) == 2

      # Find the specific requests in the rendered list to assert correctly
      req_with_job = Enum.find(result.data, &(&1["requester"]["id"] == sender1.id))
      req_no_job = Enum.find(result.data, &(&1["requester"]["id"] == sender2.id))

      assert req_with_job["requester"]["job_title"] == "Software Engineer"
      assert req_no_job["requester"]["job_title"] == "Professional"
    end
  end

  describe "show/1" do
    test "renders a single connection", %{current_user: me, user_with_job: other} do
      {:ok, conn_req} = Connections.send_connection_request(me.id, other.id)
      {:ok, conn} = Connections.accept_connection_request(conn_req)

      connection =
        Connections.get_connection!(conn.id)
        |> Repo.preload(user: [:job_experiences], connected_user: [:job_experiences])

      result = ConnectionJSON.show(%{connection: connection, current_user: me})

      assert result.data["id"] == conn.id
      assert result.data["connected_user"]["id"] == other.id
      assert result.data["connected_user"]["job_title"] == "Software Engineer"
    end
  end
end
