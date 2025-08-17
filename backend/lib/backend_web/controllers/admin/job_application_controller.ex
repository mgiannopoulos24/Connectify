defmodule BackendWeb.Admin.JobApplicationController do
  use BackendWeb, :controller

  alias Backend.Jobs
  alias BackendWeb.Admin.JobApplicationJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    applications = Jobs.list_all_job_applications()
    render(conn, JobApplicationJSON, :index, applications: applications)
  end
end
