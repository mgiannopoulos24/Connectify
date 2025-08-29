defmodule BackendWeb.ConnectionControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Connections
  alias Backend.Repo
  import Backend.AccountsFixtures

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    user_me =
      user_fixture(%{
        name: "Current",
        surname: "User",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    user_other =
      user_fixture(%{
        name: "Other",
        surname: "User",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    user_third_party =
      user_fixture(%{
        name: "Third",
        surname: "Party",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    logged_in_conn = login_user(build_conn(), user_me)

    %{
      user_me: user_me,
      user_other: user_other,
      user_third_party: user_third_party,
      conn: logged_in_conn
    }
  end

  describe "GET /api/connections (index)" do
    test "lists all accepted connections for the current user", %{
      conn: conn,
      user_me: me,
      user_other: other
    } do
      {:ok, request} = Connections.send_connection_request(me.id, other.id)
      Connections.accept_connection_request(request)
      # This pending one should NOT be in the list
      Connections.send_connection_request(user_fixture().id, me.id)

      conn = get(conn, ~p"/api/connections")
      response_data = json_response(conn, 200)["data"]

      assert length(response_data) == 1
      assert hd(response_data)["status"] == "accepted"
      assert hd(response_data)["connected_user"]["id"] == other.id
    end

    test "returns 401 for an unauthenticated user" do
      conn = get(build_conn(), ~p"/api/connections")
      assert json_response(conn, 401)["errors"]["detail"] == "Authentication required"
    end
  end

  describe "GET /api/connections/pending" do
    test "lists all pending requests for the current user", %{conn: conn, user_me: me} do
      sender = user_fixture(%{name: "Sender"})
      Connections.send_connection_request(sender.id, me.id)
      # This one was sent BY me, should not be in the list
      Connections.send_connection_request(me.id, user_fixture().id)

      conn = get(conn, ~p"/api/connections/pending")
      response_data = json_response(conn, 200)["data"]

      assert length(response_data) == 1
      assert hd(response_data)["requester"]["name"] == "Sender"
    end
  end

  describe "POST /api/connections" do
    test "creates a new pending connection request", %{conn: conn, user_other: other} do
      conn = post(conn, ~p"/api/connections", %{"recipient_id" => other.id})
      response_data = json_response(conn, 201)["data"]

      assert response_data["status"] == "pending"
      assert response_data["connected_user"]["id"] == other.id
    end

    test "returns 422 for a duplicate request", %{conn: conn, user_me: me, user_other: other} do
      Connections.send_connection_request(me.id, other.id)
      conn = post(conn, ~p"/api/connections", %{"recipient_id" => other.id})
      assert json_response(conn, 422)["errors"]["user_id"]
    end
  end

  describe "PUT /api/connections/:id/accept" do
    test "allows the recipient to accept a request", %{conn: conn, user_me: me} do
      sender = user_fixture()
      {:ok, request} = Connections.send_connection_request(sender.id, me.id)

      conn = put(conn, ~p"/api/connections/#{request.id}/accept")
      response_data = json_response(conn, 200)["data"]
      assert response_data["status"] == "accepted"
    end

    test "returns 403 if the sender tries to accept their own request", %{
      user_me: me,
      user_other: other
    } do
      {:ok, request} = Connections.send_connection_request(me.id, other.id)
      # Log in as the sender
      sender_conn = login_user(build_conn(), me)
      conn = put(sender_conn, ~p"/api/connections/#{request.id}/accept")
      assert json_response(conn, 403)["errors"]["detail"] == "Forbidden"
    end

    test "returns 404 for a non-existent connection ID", %{conn: conn} do
      assert_error_sent :not_found, fn ->
        put(conn, ~p"/api/connections/#{Ecto.UUID.generate()}/accept")
      end
    end
  end

  describe "PUT /api/connections/:id/decline" do
    test "allows the recipient to decline a request", %{conn: conn, user_me: me} do
      sender = user_fixture()
      {:ok, request} = Connections.send_connection_request(sender.id, me.id)

      conn = put(conn, ~p"/api/connections/#{request.id}/decline")
      assert response(conn, 204)
      # --- FIX: Use Repo.get/2 to safely check for absence ---
      assert Repo.get(Connections.Connection, request.id) == nil
    end

    test "allows the sender to withdraw (decline) a request", %{user_me: me, user_other: other} do
      {:ok, request} = Connections.send_connection_request(me.id, other.id)
      sender_conn = login_user(build_conn(), me)

      conn = put(sender_conn, ~p"/api/connections/#{request.id}/decline")
      assert response(conn, 204)
      # --- FIX: Use Repo.get/2 to safely check for absence ---
      assert Repo.get(Connections.Connection, request.id) == nil
    end

    test "returns 403 if a third party tries to decline", %{
      user_me: me,
      user_other: other,
      user_third_party: third
    } do
      {:ok, request} = Connections.send_connection_request(me.id, other.id)
      third_party_conn = login_user(build_conn(), third)

      conn = put(third_party_conn, ~p"/api/connections/#{request.id}/decline")
      assert json_response(conn, 403)["errors"]["detail"] == "Forbidden"
    end
  end

  describe "DELETE /api/connections/user/:user_id" do
    test "deletes an existing connection", %{conn: conn, user_me: me, user_other: other} do
      {:ok, request} = Connections.send_connection_request(me.id, other.id)
      Connections.accept_connection_request(request)
      assert Connections.get_connection_between_users(me.id, other.id)

      conn = delete(conn, ~p"/api/connections/user/#{other.id}")
      assert response(conn, 204)
      assert Connections.get_connection_between_users(me.id, other.id) == nil
    end

    test "succeeds even if no connection exists", %{conn: conn, user_other: other} do
      conn = delete(conn, ~p"/api/connections/user/#{other.id}")
      assert response(conn, 204)
    end
  end
end
