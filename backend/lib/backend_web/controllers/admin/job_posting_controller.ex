defmodule BackendWeb.Admin.JobPostingController do
  use BackendWeb, :controller

  alias Backend.Jobs
  alias Backend.Jobs.JobPosting
  alias Backend.Repo
  alias BackendWeb.JobPostingJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    job_postings = Jobs.list_all_job_postings()
    render(conn, JobPostingJSON, :index, job_postings: job_postings)
  end

  def show(conn, %{"id" => id}) do
    case Repo.get(JobPosting, id) do
      nil ->
        {:error, :not_found}

      job_posting ->
        preloaded_posting =
          Repo.preload(job_posting, [:user, :company, :skills, job_applications: :user])

        render(conn, JobPostingJSON, :show, job_posting: preloaded_posting)
    end
  end

  def create(conn, %{"job_posting" => job_posting_params}) do
    with {:ok, %JobPosting{} = job_posting} <- Jobs.create_job_posting(job_posting_params) do
      conn
      |> put_status(:created)
      |> render(JobPostingJSON, :show, job_posting: Jobs.get_job_posting!(job_posting.id))
    end
  end

  def update(conn, %{"id" => id, "job_posting" => job_posting_params}) do
    with %JobPosting{} = job_posting <- Repo.get(JobPosting, id) do
      with {:ok, %JobPosting{} = updated_posting} <-
             Jobs.update_job_posting(job_posting, job_posting_params) do
        render(conn, JobPostingJSON, :show,
          job_posting: Jobs.get_job_posting!(updated_posting.id)
        )
      end
    else
      nil -> {:error, :not_found}
    end
  end

  def delete(conn, %{"id" => id}) do
    with %JobPosting{} = job_posting <- Repo.get(JobPosting, id) do
      with {:ok, _} <- Jobs.delete_job_posting(job_posting) do
        send_resp(conn, :no_content, "")
      end
    else
      nil -> {:error, :not_found}
    end
  end
end
