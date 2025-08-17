defmodule BackendWeb.Admin.JobApplicationController do
  use BackendWeb, :controller

  alias Backend.Jobs
  alias BackendWeb.Admin.JobApplicationJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    applications = Jobs.list_all_job_applications()
    render(conn, JobApplicationJSON, :index, applications: applications)
  end

  def review(conn, %{"id" => id, "application" => %{"status" => status}}) do
    application = Jobs.get_job_application!(id)

    with {:ok, _} <- Jobs.review_application(application, status) do
      send_resp(conn, :ok, "")
    end
  end
end
