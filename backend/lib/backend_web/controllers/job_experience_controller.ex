defmodule BackendWeb.JobExperienceController do
  use BackendWeb, :controller

  alias Backend.Careers
  alias Backend.Careers.JobExperience

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"job_experience" => job_experience_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %JobExperience{} = job_experience} <-
           Careers.create_job_experience(
             Map.put(job_experience_params, "user_id", current_user.id)
           ) do
      conn
      |> put_status(:created)
      |> render(:show, job_experience: job_experience)
    end
  end
end
