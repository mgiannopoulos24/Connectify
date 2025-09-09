defmodule BackendWeb.Admin.JobApplicationControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Jobs
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

  describe "GET /api/admin/job_applications" do
    test "lists all job applications for an admin", %{admin_conn: conn} do
      recruiter = user_fixture()
      applicant = user_fixture()
      company = company_fixture(%{name: "TestCorp"})

      {:ok, posting} =
        Jobs.create_job_posting(recruiter, %{
          "title" => "Elixir Developer",
          "description" => "Build cool stuff.",
          "job_type" => "Full-time",
          "company_id" => company.id
        })

      {:ok, application} =
        Jobs.apply_for_job(applicant, posting, %{"cover_letter" => "Please hire me."})

      conn = get(conn, ~p"/api/admin/job_applications")
      response_data = json_response(conn, 200)["data"]

      assert length(response_data) == 1
      [first_app] = response_data

      assert first_app["id"] == application.id
      assert first_app["status"] == "submitted"
      assert first_app["cover_letter"] == "Please hire me."

      assert first_app["user"]["id"] == applicant.id
      assert first_app["user"]["name"] == applicant.name

      assert first_app["job_posting"]["id"] == posting.id
      assert first_app["job_posting"]["title"] == "Elixir Developer"
      assert first_app["job_posting"]["company"]["name"] == "TestCorp"
    end

    test "returns an empty list when no applications exist", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/job_applications")
      assert json_response(conn, 200)["data"] == []
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/job_applications")

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end

    test "returns 401 unauthorized for a logged-out user" do
      conn = get(build_conn(), ~p"/api/admin/job_applications")

      assert json_response(conn, 401)["errors"]["detail"] ==
               "Authentication required"
    end
  end
end
