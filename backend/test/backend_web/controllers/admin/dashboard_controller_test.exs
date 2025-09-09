defmodule BackendWeb.Admin.DashboardControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Connections
  alias Backend.Jobs
  alias Backend.Posts

  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

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

  describe "GET /api/admin/statistics" do
    test "returns dashboard statistics for an admin user", %{
      admin_conn: conn,
      prof_user: prof_user
    } do
      # --- Create data to be counted ---
      # 1. Users: We already have an admin and professional user from setup.
      #    Let's create two more to make the count 4.
      user1 = user_fixture()
      user2 = user_fixture()

      # 2. Connections: Create one accepted connection and one pending one.
      {:ok, request} = Connections.send_connection_request(user1.id, user2.id)
      Connections.accept_connection_request(request)
      Connections.send_connection_request(prof_user.id, user1.id)

      # 3. Job Postings: Create one job posting.
      company = company_fixture()

      Jobs.create_job_posting(user1, %{
        "title" => "Admin Test Job",
        "description" => "A job for testing stats.",
        "job_type" => "Full-time",
        "company_id" => company.id
      })

      # 4. Posts: Create one post.
      Posts.create_post(user2, %{"content" => "A test post for stats"})

      # --- Make the request and assert ---
      conn = get(conn, ~p"/api/admin/statistics")

      assert json_response(conn, 200)["data"] == %{
               "total_users" => 4,
               "accepted_connections" => 1,
               "total_job_postings" => 1,
               "total_posts" => 1
             }
    end

    test "returns zero counts when no data exists", %{
      admin_conn: conn,
      admin_user: admin_user,
      prof_user: prof_user
    } do
      # At this point, only the admin and prof_user exist from setup.
      # No other data has been created for this specific test.
      conn = get(conn, ~p"/api/admin/statistics")

      assert json_response(conn, 200)["data"] == %{
               "total_users" => 2,
               "accepted_connections" => 0,
               "total_job_postings" => 0,
               "total_posts" => 0
             }
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/statistics")

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end

    test "returns 401 unauthorized for a logged-out user", %{conn: conn} do
      conn = get(conn, ~p"/api/admin/statistics")

      assert json_response(conn, 401)["errors"]["detail"] ==
               "Authentication required"
    end
  end
end
