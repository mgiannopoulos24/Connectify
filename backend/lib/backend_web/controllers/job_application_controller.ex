defmodule BackendWeb.JobApplicationController do
  use BackendWeb, :controller

  alias Backend.Jobs
  alias Backend.Repo

  action_fallback BackendWeb.FallbackController

  def review(conn, %{"id" => id, "application" => %{"status" => status}}) do
    current_user = conn.assigns.current_user
    # We need the job_posting to check ownership
    application =
      Jobs.get_job_application!(id)
      |> Repo.preload(:job_posting)

    if application.job_posting.user_id == current_user.id do
      with {:ok, _} <- Jobs.review_application(application, status) do
        send_resp(conn, :ok, "")
      end
    else
      conn
      |> put_status(:forbidden)
      |> render(BackendWeb.ErrorJSON, "403.json",
        detail: "You are not the owner of this job posting."
      )
    end
  end
end
