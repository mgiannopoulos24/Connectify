defmodule BackendWeb.Admin.DashboardControllerTest do
  use BackendWeb.ConnCase, async: true

  import Backend.AccountsFixtures
  alias Backend.Auth

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "GET /api/admin/statistics" do
    test "returns 403 Forbidden for non-admin users", %{conn: conn} do
      user = user_fixture()
      conn = log_in_user(conn, user)

      conn = get(conn, ~p"/api/admin/statistics")
      assert response(conn, 403)

      assert %{"errors" => %{"detail" => "You are not authorized to access this resource."}} =
               json_response(conn, 403)
    end

    test "returns 403 Forbidden for anonymous users", %{conn: conn} do
      conn = get(conn, ~p"/api/admin/statistics")

      assert response(conn, 403)
    end

    test "returns 200 OK and stats for admin users", %{conn: conn} do
      admin = user_fixture(%{role: "admin"})
      conn = log_in_user(conn, admin)

      conn = get(conn, ~p"/api/admin/statistics")
      assert response(conn, 200)

      assert %{"data" => %{"total_users" => 1, "accepted_connections" => 0}} =
               json_response(conn, 200)
    end
  end

  defp log_in_user(conn, user) do
    {:ok, token, _claims} = Auth.sign_token(user)
    Plug.Conn.put_req_cookie(conn, "auth_token", token)
  end
end