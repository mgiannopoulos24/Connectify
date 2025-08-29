defmodule BackendWeb.Admin.JobPostingControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Jobs
  alias Backend.Skills
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

  describe "index" do
    test "lists all job postings for an admin", %{admin_conn: conn, prof_user: user} do
      company = company_fixture()

      Jobs.create_job_posting(user, %{
        "title" => "Test Job",
        "description" => "A job for testing.",
        "job_type" => "Full-time",
        "company_id" => company.id
      })

      conn = get(conn, ~p"/api/admin/job_postings")
      response_data = json_response(conn, 200)["data"]
      assert length(response_data) == 1
      assert hd(response_data)["title"] == "Test Job"
    end

    test "returns 403 for non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/job_postings")
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "show" do
    test "shows a specific job posting for an admin", %{admin_conn: conn, prof_user: user} do
      company = company_fixture()

      {:ok, posting} =
        Jobs.create_job_posting(user, %{
          "title" => "Show Me",
          "description" => "Details.",
          "job_type" => "Full-time",
          "company_id" => company.id
        })

      conn = get(conn, ~p"/api/admin/job_postings/#{posting.id}")
      assert json_response(conn, 200)["data"]["title"] == "Show Me"
    end

    test "returns 404 for non-existent ID", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/job_postings/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end

  describe "create" do
    test "creates a job posting for an admin", %{admin_conn: conn, prof_user: user} do
      company = company_fixture()
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Elixir"})

      create_attrs = %{
        "user_id" => user.id,
        "company_id" => company.id,
        "title" => "New Admin Job",
        "description" => "Admin created this.",
        "job_type" => "Contract",
        "skill_ids" => [skill.id]
      }

      conn = post(conn, ~p"/api/admin/job_postings", job_posting: create_attrs)
      response_data = json_response(conn, 201)["data"]

      assert response_data["title"] == "New Admin Job"
      assert response_data["company"]["id"] == company.id
      assert hd(response_data["skills"])["name"] == "Elixir"
    end

    test "returns 422 for invalid data", %{admin_conn: conn, prof_user: user} do
      # Missing required title
      invalid_attrs = %{"user_id" => user.id, "company_name" => "Incomplete Co"}
      conn = post(conn, ~p"/api/admin/job_postings", job_posting: invalid_attrs)
      assert json_response(conn, 422)["errors"]["title"]
    end

    test "returns 403 for non-admin user", %{prof_conn: conn, prof_user: user} do
      conn =
        post(conn, ~p"/api/admin/job_postings", job_posting: %{"user_id" => user.id})

      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "update" do
    test "updates a job posting for an admin", %{admin_conn: conn, prof_user: user} do
      company = company_fixture()
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Phoenix"})

      {:ok, posting} =
        Jobs.create_job_posting(user, %{
          "title" => "Old Title",
          "description" => "Old desc.",
          "job_type" => "Full-time",
          "company_id" => company.id
        })

      update_attrs = %{"title" => "New Admin Title", "skill_ids" => [skill.id]}

      conn = put(conn, ~p"/api/admin/job_postings/#{posting.id}", job_posting: update_attrs)
      response_data = json_response(conn, 200)["data"]

      assert response_data["title"] == "New Admin Title"
      assert hd(response_data["skills"])["name"] == "Phoenix"
    end

    test "returns 404 for non-existent ID on update", %{admin_conn: conn} do
      conn =
        put(conn, ~p"/api/admin/job_postings/#{Ecto.UUID.generate()}",
          job_posting: %{
            "title" => "Wont Work"
          }
        )

      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end

  describe "delete" do
    test "deletes a job posting for an admin", %{admin_conn: conn, prof_user: user} do
      company = company_fixture()

      {:ok, posting} =
        Jobs.create_job_posting(user, %{
          "title" => "To Be Deleted",
          "description" => "Delete me.",
          "job_type" => "Full-time",
          "company_id" => company.id
        })

      conn = delete(conn, ~p"/api/admin/job_postings/#{posting.id}")
      assert response(conn, 204)

      assert_raise Ecto.NoResultsError, fn -> Jobs.get_job_posting!(posting.id) end
    end

    test "returns 404 for non-existent ID on delete", %{admin_conn: conn} do
      conn = delete(conn, ~p"/api/admin/job_postings/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end
end
