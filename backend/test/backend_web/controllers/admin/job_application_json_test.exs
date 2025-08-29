defmodule BackendWeb.Admin.JobApplicationJSONTest do
  use Backend.DataCase, async: true

  alias Backend.Jobs
  alias Backend.Repo
  alias BackendWeb.Admin.JobApplicationJSON

  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

  setup do
    # --- Create a complete set of related data for testing ---
    recruiter = user_fixture(%{name: "Recruiter"})
    applicant = user_fixture(%{name: "Applicant"})
    company = company_fixture(%{name: "JSON Test Co"})

    {:ok, posting} =
      Jobs.create_job_posting(recruiter, %{
        "title" => "Test Role",
        "description" => "A role for testing.",
        "job_type" => "Full-time",
        "company_id" => company.id
      })

    {:ok, application} =
      Jobs.apply_for_job(applicant, posting, %{"cover_letter" => "My Cover Letter"})

    # Preload the application as the controller would
    application =
      Repo.get!(Jobs.JobApplication, application.id)
      |> Repo.preload(user: [], job_posting: [:company])

    %{application: application, applicant: applicant, posting: posting, company: company}
  end

  describe "index/1" do
    test "renders a list of job applications", %{application: app} do
      result = JobApplicationJSON.index(%{applications: [app]})

      assert %{data: [rendered_app]} = result
      assert rendered_app["id"] == app.id
      assert rendered_app["status"] == "submitted"
      assert rendered_app["user"]["name"] == "Applicant"
      assert rendered_app["job_posting"]["title"] == "Test Role"
      assert rendered_app["job_posting"]["company"]["name"] == "JSON Test Co"
    end

    test "renders an empty list when no applications are provided" do
      result = JobApplicationJSON.index(%{applications: []})
      assert result == %{data: []}
    end
  end

  describe "show/1" do
    test "renders a single job application", %{application: app} do
      result = JobApplicationJSON.show(%{application: app})

      assert %{data: rendered_app} = result
      assert rendered_app["id"] == app.id
      assert rendered_app["status"] == "submitted"
    end
  end

  describe "data/1 (edge cases)" do
    test "renders correctly when cover_letter is nil", %{application: app} do
      # Create a new application without a cover letter
      {:ok, app_no_letter} =
        Jobs.apply_for_job(user_fixture(), Jobs.get_job_posting!(app.job_posting.id))

      app_no_letter =
        Repo.get!(Jobs.JobApplication, app_no_letter.id)
        |> Repo.preload(user: [], job_posting: [:company])

      rendered = JobApplicationJSON.data(app_no_letter)

      assert rendered["cover_letter"] == nil
    end

    test "handles not-loaded associations gracefully", %{application: app} do
      # Fetch the application from the DB without any preloads
      unloaded_app = Repo.get!(Jobs.JobApplication, app.id)

      rendered = JobApplicationJSON.data(unloaded_app)

      assert rendered["user"] == nil
      assert rendered["job_posting"] == nil
    end
  end
end
