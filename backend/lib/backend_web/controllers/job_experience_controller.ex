defmodule BackendWeb.JobExperienceController do
  use BackendWeb, :controller

  alias Backend.Careers
  alias Backend.Careers.JobExperience
  alias BackendWeb.JobExperienceJSON

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"job_experience" => job_experience_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %JobExperience{} = job_experience} <-
           Careers.create_job_experience(
             Map.put(job_experience_params, "user_id", current_user.id)
           ) do
      conn
      |> put_status(:created)
      |> render(JobExperienceJSON, :show, job_experience: job_experience)
    end
  end

  def update(conn, %{"id" => id, "job_experience" => job_experience_params}) do
    current_user = conn.assigns.current_user
    job_experience = Careers.get_job_experience!(id)

    if job_experience.user_id == current_user.id do
      with {:ok, %JobExperience{} = job_experience} <-
             Careers.update_job_experience(job_experience, job_experience_params) do
        render(conn, JobExperienceJSON, :show, job_experience: job_experience)
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    job_experience = Careers.get_job_experience!(id)

    if job_experience.user_id == current_user.id do
      with {:ok, _job_experience} <- Careers.delete_job_experience(job_experience) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end
end