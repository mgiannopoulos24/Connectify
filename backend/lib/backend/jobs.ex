defmodule Backend.Jobs do
  @moduledoc """
  The Jobs context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Jobs.JobPosting
  alias Backend.Jobs.JobApplication
  alias Backend.Skills.Skill
  alias Backend.Companies
  alias Backend.Notifications
  alias Ecto.Multi

  def get_job_posting!(id) do
    JobPosting
    |> Repo.get!(id)
    |> Repo.preload([:user, :company, :skills, job_applications: :user])
  end

  def list_all_job_postings do
    JobPosting
    |> order_by(desc: :inserted_at)
    |> preload([:user, :company, :skills])
    |> Repo.all()
  end

  def list_job_postings_for_user_feed(user) do
    # Get all job applications for the current user and map them by job_posting_id
    user_applications =
      from(ja in JobApplication,
        where: ja.user_id == ^user.id,
        select: {ja.job_posting_id, ja.status}
      )
      |> Repo.all()
      |> Map.new()

    user_skill_ids = Enum.map(user.skills, & &1.id)

    base_query =
      from(jp in JobPosting,
        order_by: [desc: :inserted_at],
        preload: [:user, :company, :skills]
      )

    all_postings = Repo.all(base_query)

    # Map the application status to each posting
    all_postings_with_status =
      Enum.map(all_postings, fn post ->
        status = Map.get(user_applications, post.id)
        %{post | application_status: status}
      end)

    # Sort by skill relevance and then by date
    Enum.sort_by(all_postings_with_status, fn post ->
      post_skill_ids = MapSet.new(Enum.map(post.skills, & &1.id))
      user_skill_ids_set = MapSet.new(user_skill_ids)
      score = -(MapSet.intersection(post_skill_ids, user_skill_ids_set) |> MapSet.size())
      {score, -DateTime.to_unix(post.inserted_at)}
    end)
  end

  def create_job_posting(attrs) do
    with %{"user_id" => user_id} <- attrs,
         user when not is_nil(user) <- Repo.get(Backend.Accounts.User, user_id) do
      handle_job_posting_transaction(user, %JobPosting{}, attrs)
    else
      _ ->
        {:error,
         Ecto.Changeset.change(%JobPosting{})
         |> Ecto.Changeset.add_error(:user_id, "is missing or invalid")}
    end
  end

  def create_job_posting(user, attrs) do
    handle_job_posting_transaction(user, %JobPosting{}, attrs)
  end

  def update_job_posting(%JobPosting{} = job_posting, attrs) do
    handle_job_posting_transaction(job_posting.user, job_posting, attrs)
  end

  defp handle_job_posting_transaction(user, job_posting_struct, attrs) do
    Multi.new()
    |> Multi.run(:company, fn _repo, _changes ->
      company_id = attrs["company_id"]
      company_name = attrs["company_name"]

      cond do
        !is_nil(company_id) and company_id != "" ->
          {:ok, Companies.get_company!(company_id)}

        !is_nil(company_name) and company_name != "" ->
          Companies.get_or_create_company_by_name(company_name)

        true ->
          if job_posting_struct.id,
            do: {:ok, nil},
            else: {:error, "company_id or company_name must be provided"}
      end
    end)
    |> Multi.run(:skills, fn _repo, _changes ->
      skill_ids = attrs["skill_ids"]

      if is_nil(skill_ids),
        do: {:ok, nil},
        else: {:ok, Repo.all(from s in Skill, where: s.id in ^skill_ids)}
    end)
    |> (fn multi ->
          job_changeset_fun = fn %{company: company, skills: skills} ->
            job_attrs =
              Map.drop(attrs, ["company_name", "skill_ids"])
              |> Map.put("user_id", user.id)

            job_attrs =
              if company,
                do: Map.put(job_attrs, "company_id", company.id),
                else: job_attrs

            changeset = JobPosting.changeset(job_posting_struct, job_attrs)

            if skills,
              do: Ecto.Changeset.put_assoc(changeset, :skills, skills),
              else: changeset
          end

          if job_posting_struct.id do
            Ecto.Multi.update(multi, :job_posting, job_changeset_fun)
          else
            Ecto.Multi.insert(multi, :job_posting, job_changeset_fun)
          end
        end).()
    |> Repo.transaction()
    |> case do
      {:ok, %{job_posting: job_posting}} ->
        {:ok, get_job_posting!(job_posting.id)}

      {:error, :job_posting, changeset, _} ->
        {:error, changeset}

      {:error, :company, error_msg, _} ->
        {:error,
         Ecto.Changeset.change(%JobPosting{})
         |> Ecto.Changeset.add_error(:company, to_string(error_msg))}

      {:error, _, reason, _} ->
        {:error, reason}
    end
  end

  def delete_job_posting(%JobPosting{} = job_posting) do
    Repo.delete(job_posting)
  end

  def apply_for_job(user, job_posting, attrs \\ %{}) do
    if user.id == job_posting.user_id do
      {:error, :cannot_apply_to_own_job}
    else
      params =
        attrs
        |> Map.put("user_id", user.id)
        |> Map.put("job_posting_id", job_posting.id)

      with {:ok, application} <-
             %JobApplication{}
             |> JobApplication.changeset(params)
             |> Repo.insert() do
        # Notification logic remains, as this block is only hit if user.id != job_posting.user_id
        Notifications.create_notification(%{
          user_id: job_posting.user_id,
          notifier_id: user.id,
          type: "new_application",
          resource_id: job_posting.id,
          resource_type: "job_posting"
        })

        {:ok, application}
      end
    end
  end

  def list_applications_for_posting(job_posting_id) do
    JobApplication
    |> where(job_posting_id: ^job_posting_id)
    |> preload(:user)
    |> Repo.all()
  end

  @doc """
  Returns a list of all job applications for the admin dashboard.
  """
  def list_all_job_applications do
    JobApplication
    |> order_by(desc: :inserted_at)
    |> preload(user: [], job_posting: [:company])
    |> Repo.all()
  end

  @doc """
  Gets a single job application.
  """
  def get_job_application!(id) do
    Repo.get!(JobApplication, id)
  end

  @doc """
  Reviews a job application, updating its status and notifying the user.
  """
  def review_application(%JobApplication{} = application, status) do
    # Preload required data for notifications
    application = Repo.preload(application, [:user, job_posting: [:user]])

    notification_type =
      case status do
        "accepted" -> "application_accepted"
        "rejected" -> "application_rejected"
        # We don't send notifications for other statuses like "reviewed"
        _ -> nil
      end

    with {:ok, updated_app} <-
           application |> JobApplication.changeset(%{status: status}) |> Repo.update() do
      # Only send a notification if the status is one that requires it
      if notification_type do
        Notifications.create_notification(%{
          user_id: application.user_id,
          notifier_id: application.job_posting.user_id,
          type: notification_type,
          resource_id: application.job_posting_id,
          resource_type: "job_posting"
        })
      end

      {:ok, updated_app}
    end
  end
end
