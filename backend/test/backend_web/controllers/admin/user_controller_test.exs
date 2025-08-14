defmodule BackendWeb.Admin.UserControllerTest do
  use BackendWeb.ConnCase, async: true

  import Backend.AccountsFixtures
  alias Backend.Auth

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  defp log_in_user(conn, user) do
    {:ok, token, _claims} = Auth.sign_token(user)
    Plug.Conn.put_req_cookie(conn, "auth_token", token)
  end

  describe "GET /api/admin/users" do
    test "returns 403 Forbidden for non-admin users", %{conn: conn} do
      user = user_fixture()
      conn = log_in_user(conn, user)

      conn = get(conn, ~p"/api/admin/users")
      assert response(conn, 403)
    end

    test "returns 200 OK and list of users for admin users", %{conn: conn} do
      user_fixture()
      user_fixture()

      admin = user_fixture(%{role: "admin"})
      conn = log_in_user(conn, admin)

      conn = get(conn, ~p"/api/admin/users")
      assert response(conn, 200)
      assert length(json_response(conn, 200)["data"]) == 3
    end
  end

  describe "PUT /api/admin/users/:id/role" do
    test "updates the user role for admins", %{conn: conn} do
      admin = user_fixture(%{role: "admin"})
      user_to_update = user_fixture(%{role: "professional"})
      conn = log_in_user(conn, admin)

      conn =
        put(conn, ~p"/api/admin/users/#{user_to_update.id}/role", %{
          "user" => %{"role" => "admin"}
        })

      assert response(conn, 200)
      json_body = json_response(conn, 200)
      assert json_body["data"]["id"] == user_to_update.id
      assert json_body["data"]["role"] == "admin"
    end

    test "returns 403 for non-admin users", %{conn: conn} do
      non_admin = user_fixture(%{role: "professional"})
      user_to_update = user_fixture()
      conn = log_in_user(conn, non_admin)

      conn =
        put(conn, ~p"/api/admin/users/#{user_to_update.id}/role", %{
          "user" => %{"role" => "admin"}
        })

      assert response(conn, 403)
    end

    test "returns 422 for invalid role", %{conn: conn} do
      admin = user_fixture(%{role: "admin"})
      user_to_update = user_fixture()
      conn = log_in_user(conn, admin)

      conn =
        put(conn, ~p"/api/admin/users/#{user_to_update.id}/role", %{
          "user" => %{"role" => "not_a_real_role"}
        })

      assert response(conn, 422)
      assert json_response(conn, 422)["errors"]["role"] == ["is invalid"]
    end
  end
end