defmodule BackendWeb.Admin.UserControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Accounts
  alias Backend.Posts
  import Backend.AccountsFixtures

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    admin_user =
      user_fixture(%{
        role: "admin",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    professional_user =
      user_fixture(%{
        role: "professional",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    %{
      admin_user: admin_user,
      prof_user: professional_user,
      admin_conn: login_user(build_conn(), admin_user),
      prof_conn: login_user(build_conn(), professional_user)
    }
  end

  describe "index" do
    test "lists all users for an admin", %{admin_conn: conn, admin_user: admin, prof_user: prof} do
      conn = get(conn, ~p"/api/admin/users")
      response_data = json_response(conn, 200)["data"]

      assert length(response_data) == 2
      user_ids = Enum.map(response_data, & &1["id"])
      assert admin.id in user_ids
      assert prof.id in user_ids
    end

    test "returns 403 for non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/users")
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "show" do
    test "shows a specific user with full admin data", %{admin_conn: conn, prof_user: prof} do
      # Add a post to the user to ensure it's preloaded for the admin view
      {:ok, post} = Posts.create_post(prof, %{"content" => "A post"})

      conn = get(conn, ~p"/api/admin/users/#{prof.id}")
      response_data = json_response(conn, 200)["data"]

      assert response_data["id"] == prof.id
      assert response_data["email"] == prof.email
      # Assert that admin-specific preloads are present
      assert is_list(response_data["posts"])
      assert hd(response_data["posts"])["id"] == post.id
    end

    test "returns 404 for non-existent user ID", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/users/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end

  describe "update_role" do
    test "updates a user's role for an admin", %{admin_conn: conn, prof_user: prof} do
      assert prof.role == "professional"

      conn =
        put(conn, ~p"/api/admin/users/#{prof.id}/role", %{
          "user" => %{"role" => "admin"}
        })

      response_data = json_response(conn, 200)["data"]
      assert response_data["id"] == prof.id
      assert response_data["role"] == "admin"
    end

    test "returns 422 for an invalid role", %{admin_conn: conn, prof_user: prof} do
      conn =
        put(conn, ~p"/api/admin/users/#{prof.id}/role", %{
          "user" => %{"role" => "super_user"}
        })

      assert json_response(conn, 422)["errors"]["role"] == ["is invalid"]
    end

    test "returns 404 for a non-existent user ID", %{admin_conn: conn} do
      conn =
        put(conn, ~p"/api/admin/users/#{Ecto.UUID.generate()}/role", %{
          "user" => %{"role" => "admin"}
        })

      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end

    test "returns 403 for a non-admin user", %{prof_conn: conn, prof_user: prof} do
      conn =
        put(conn, ~p"/api/admin/users/#{prof.id}/role", %{
          "user" => %{"role" => "admin"}
        })

      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "export" do
    test "exports all users as JSON by default", %{
      admin_conn: conn,
      admin_user: admin,
      prof_user: prof
    } do
      conn = get(conn, ~p"/api/admin/users/export")
      response_data = json_response(conn, 200)["data"]
      assert length(response_data) == 2

      assert get_resp_header(conn, "content-type")
             |> hd()
             |> String.starts_with?("application/json")
    end

    test "exports specific users by ID as JSON", %{admin_conn: conn, prof_user: prof} do
      conn = get(conn, ~p"/api/admin/users/export?user_ids[]=#{prof.id}")
      response_data = json_response(conn, 200)["data"]
      assert length(response_data) == 1
      assert hd(response_data)["id"] == prof.id
    end

    test "exports users as XML", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/users/export?format=xml")
      assert response(conn, 200)

      assert get_resp_header(conn, "content-type")
             |> hd()
             |> String.starts_with?("application/xml")

      # --- FIX: Use a simple, robust string check instead of a fragile regex ---
      assert String.starts_with?(conn.resp_body, "<?xml version=\"1.0\"")
      assert String.contains?(conn.resp_body, "<users>")
    end

    test "returns 400 for invalid format", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/users/export?format=csv")
      assert json_response(conn, 400)["errors"]["detail"] =~ "Invalid format"
    end

    test "returns 403 for non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/users/export")
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end
end
