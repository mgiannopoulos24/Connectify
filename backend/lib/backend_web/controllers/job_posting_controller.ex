defmodule BackendWeb.JobPostingController do
  use BackendWeb, :controller
  alias Backend.Jobs
  alias Backend.Jobs.JobPosting
  alias BackendWeb.JobPostingJSON
  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    job_postings = Jobs.list_job_postings_for_user_feed(current_user)

    conn
    |> put_view(JobPostingJSON)
    |> render("index.json", job_postings: job_postings)
  end

  def show(conn, %{"id" => id}) do
    job_posting = Jobs.get_job_posting!(id)

    conn
    |> put_view(JobPostingJSON)
    |> render("show.json", job_posting: job_posting)
  end

  def create(conn, %{"job_posting" => job_posting_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %JobPosting{} = job_posting} <-
           Jobs.create_job_posting(current_user, job_posting_params) do
      conn
      |> put_status(:created)
      |> put_view(JobPostingJSON)
      |> render("show.json", job_posting: Jobs.get_job_posting!(job_posting.id))
    end
  end

  def update(conn, %{"id" => id, "job_posting" => job_posting_params}) do
    current_user = conn.assigns.current_user
    job_posting = Jobs.get_job_posting!(id)

    if job_posting.user_id == current_user.id do
      with {:ok, %JobPosting{} = job_posting} <-
             Jobs.update_job_posting(job_posting, job_posting_params) do
        conn
        |> put_view(JobPostingJSON)
        |> render("show.json", job_posting: Jobs.get_job_posting!(job_posting.id))
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    job_posting = Jobs.get_job_posting!(id)

    if job_posting.user_id == current_user.id do
      with {:ok, _} <- Jobs.delete_job_posting(job_posting) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def apply(conn, %{"id" => id, "application" => application_params}) do
    current_user = conn.assigns.current_user
    job_posting = Jobs.get_job_posting!(id)

    with {:ok, _application} <- Jobs.apply_for_job(current_user, job_posting, application_params) do
      send_resp(conn, :created, "")
    else
      {:error, :cannot_apply_to_own_job} ->
        conn
        |> put_status(:forbidden)
        |> json(%{errors: %{detail: "You cannot apply to your own job posting."}})

      {:error, :already_applied} ->
        conn
        |> put_status(:conflict)
        |> json(%{
          errors: %{detail: "You have an active application for this job already."}
        })

      {:error,
       %Ecto.Changeset{errors: [user_job_posting_unique_application_index: _]} = changeset} ->
        conn
        |> put_status(:conflict)
        |> put_view(json: BackendWeb.ChangesetJSON)
        |> render("error", changeset: changeset)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> put_view(json: BackendWeb.ChangesetJSON)
        |> render("error", changeset: changeset)
    end
  end

  def applications(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    job_posting = Jobs.get_job_posting!(id)

    if job_posting.user_id == current_user.id do
      conn
      |> put_view(JobPostingJSON)
      |> render("show.json", job_posting: job_posting)
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end
end
