defmodule Backend.ConnectionsTest do
  use Backend.DataCase, async: true

  alias Backend.Connections
  alias Backend.Repo

  import Backend.AccountsFixtures
  import Backend.CareersFixtures

  describe "send_connection_request/2" do
    test "creates a pending connection request" do
      user1 = user_fixture()
      user2 = user_fixture()

      assert {:ok, connection} = Connections.send_connection_request(user1.id, user2.id)
      assert connection.status == "pending"
      assert connection.user_id == user1.id
      assert connection.connected_user_id == user2.id

      # Verify it's in the database
      db_connection = Repo.get!(Connections.Connection, connection.id)
      assert db_connection.status == "pending"
    end

    test "returns an error changeset when sending a duplicate request" do
      user1 = user_fixture()
      user2 = user_fixture()

      # First request should be ok
      {:ok, _} = Connections.send_connection_request(user1.id, user2.id)

      # Second, duplicate request should fail due to unique index
      assert {:error, %Ecto.Changeset{} = changeset} =
               Connections.send_connection_request(user1.id, user2.id)

      assert "has already been taken" in errors_on(changeset).user_id
    end

    test "returns an error when a user tries to connect with themselves" do
      user = user_fixture()

      assert {:error, %Ecto.Changeset{} = changeset} =
               Connections.send_connection_request(user.id, user.id)

      assert "cannot connect with oneself" in errors_on(changeset).connected_user_id
    end
  end

  describe "accept_connection_request/1" do
    test "updates the connection status to accepted" do
      requester = user_fixture()
      recipient = user_fixture()
      {:ok, connection} = Connections.send_connection_request(requester.id, recipient.id)

      assert {:ok, updated_connection} = Connections.accept_connection_request(connection)
      assert updated_connection.id == connection.id
      assert updated_connection.status == "accepted"
    end
  end

  describe "decline_connection_request/1" do
    test "deletes the connection request" do
      requester = user_fixture()
      recipient = user_fixture()
      {:ok, connection} = Connections.send_connection_request(requester.id, recipient.id)

      assert {:ok, _} = Connections.decline_connection_request(connection)
      assert Repo.get(Connections.Connection, connection.id) == nil
    end
  end

  describe "delete_connection/1" do
    test "deletes an existing connection record" do
      requester = user_fixture()
      recipient = user_fixture()
      {:ok, connection} = Connections.send_connection_request(requester.id, recipient.id)

      # delete should remove the record regardless of status
      assert {:ok, _} = Connections.delete_connection(connection)
      assert Repo.get(Connections.Connection, connection.id) == nil
    end
  end

  describe "get_connection_between_users/2" do
    test "returns an accepted connection regardless of user order" do
      user_a = user_fixture()
      user_b = user_fixture()

      {:ok, conn} = Connections.send_connection_request(user_a.id, user_b.id)
      Connections.accept_connection_request(conn)

      # lookup in both orders
      assert Connections.get_connection_between_users(user_a.id, user_b.id).id == conn.id
      assert Connections.get_connection_between_users(user_b.id, user_a.id).id == conn.id
    end

    test "returns nil when no accepted connection exists" do
      u1 = user_fixture()
      u2 = user_fixture()

      assert Connections.get_connection_between_users(u1.id, u2.id) == nil
    end
  end

  describe "list_pending_requests/1" do
    test "returns only pending requests for the given user with preloaded data" do
      recipient = user_fixture()
      requester1 = user_fixture()
      requester2 = user_fixture()
      user_with_no_requests = user_fixture()

      # 1. Pending request for recipient
      Connections.send_connection_request(requester1.id, recipient.id)

      # 2. Another pending request for recipient, this time with job experience
      company = company_fixture(%{name: "Test Co"})

      job_experience_fixture(%{
        user_id: requester2.id,
        company_id: company.id,
        job_title: "Developer"
      })

      Connections.send_connection_request(requester2.id, recipient.id)

      # 3. Accepted request for recipient (should NOT be listed)
      {:ok, accepted_conn} = Connections.send_connection_request(user_fixture().id, recipient.id)
      Connections.accept_connection_request(accepted_conn)

      # 4. Pending request sent BY the recipient (should NOT be listed)
      Connections.send_connection_request(recipient.id, user_fixture().id)

      # --- Assertions ---
      pending_requests = Connections.list_pending_requests(recipient.id)

      assert length(pending_requests) == 2
      requester_ids = Enum.map(pending_requests, & &1.user_id)
      assert requester1.id in requester_ids
      assert requester2.id in requester_ids

      # Test preloading
      req_with_job = Enum.find(pending_requests, &(&1.user_id == requester2.id))
      assert req_with_job.user.job_experiences != []
      assert hd(req_with_job.user.job_experiences).job_title == "Developer"
      assert hd(req_with_job.user.job_experiences).company.name == "Test Co"

      # Test for user with no requests
      assert Connections.list_pending_requests(user_with_no_requests.id) == []
    end
  end

  describe "list_user_connections/1" do
    test "returns all accepted connections for a user" do
      user = user_fixture()
      friend1 = user_fixture()
      friend2 = user_fixture()
      pending_friend = user_fixture()
      non_friend = user_fixture()

      # Connection where user is the requester
      {:ok, conn1} = Connections.send_connection_request(user.id, friend1.id)
      Connections.accept_connection_request(conn1)

      # Connection where user is the recipient
      {:ok, conn2} = Connections.send_connection_request(friend2.id, user.id)
      Connections.accept_connection_request(conn2)

      # Pending connection (should not be listed)
      Connections.send_connection_request(user.id, pending_friend.id)

      connections = Connections.list_user_connections(user.id)
      assert length(connections) == 2

      # Check that the connected users are correct
      connected_user_ids =
        Enum.map(connections, fn conn ->
          if conn.user_id == user.id,
            do: conn.connected_user_id,
            else: conn.user_id
        end)

      assert friend1.id in connected_user_ids
      assert friend2.id in connected_user_ids
      assert pending_friend.id not in connected_user_ids
      assert non_friend.id not in connected_user_ids
    end

    test "preloads user and connected_user data correctly" do
      user = user_fixture()
      friend = user_fixture()
      company = company_fixture(%{name: "Friend Co"})

      job_experience_fixture(%{
        "user_id" => friend.id,
        "company_id" => company.id,
        "job_title" => "Manager"
      })

      {:ok, conn} = Connections.send_connection_request(user.id, friend.id)
      Connections.accept_connection_request(conn)

      [connection] = Connections.list_user_connections(user.id)

      # Check preloads
      assert connection.user_id == user.id
      assert connection.connected_user_id == friend.id
      assert connection.user.name == user.name
      assert connection.connected_user.name == friend.name
      assert not is_nil(connection.connected_user.job_experiences)
      assert hd(connection.connected_user.job_experiences).job_title == "Manager"
    end

    test "returns an empty list for a user with no accepted connections" do
      user_with_no_connections = user_fixture()
      user_with_pending_request = user_fixture()

      Connections.send_connection_request(
        user_with_no_connections.id,
        user_with_pending_request.id
      )

      assert Connections.list_user_connections(user_with_no_connections.id) == []
      assert Connections.list_user_connections(user_with_pending_request.id) == []
    end
  end
end
