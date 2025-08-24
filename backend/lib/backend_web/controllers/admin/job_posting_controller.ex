defmodule BackendWeb.Admin.JobPostingController do
  use BackendWeb, :controller

  alias Backend.Jobs
  alias Backend.Jobs.JobPosting
  alias BackendWeb.JobPostingJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    job_postings = Jobs.list_all_job_postings()
    render(conn, JobPostingJSON, :index, job_postings: job_postings)
  end

  def show(conn, %{"id" => id}) do
    job_posting = Jobs.get_job_posting!(id)
    render(conn, JobPostingJSON, :show, job_posting: job_posting)
  end

  def create(conn, %{"job_posting" => job_posting_params}) do
    with {:ok, %JobPosting{} = job_posting} <- Jobs.create_job_posting(job_posting_params) do
      conn
      |> put_status(:created)
      |> render(JobPostingJSON, :show, job_posting: Jobs.get_job_posting!(job_posting.id))
    end
  end

  def update(conn, %{"id" => id, "job_posting" => job_posting_params}) do
    job_posting = Jobs.get_job_posting!(id)

    with {:ok, %JobPosting{} = job_posting} <-
           Jobs.update_job_posting(job_posting, job_posting_params) do
      render(conn, JobPostingJSON, :show, job_posting: Jobs.get_job_posting!(job_posting.id))
    end
  end

  def delete(conn, %{"id" => id}) do
    job_posting = Jobs.get_job_posting!(id)

    with {:ok, _} <- Jobs.delete_job_posting(job_posting) do
      send_resp(conn, :no_content, "")
    end
  end
end
