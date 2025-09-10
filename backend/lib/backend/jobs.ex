defmodule Backend.Jobs do
  @moduledoc """
  The Jobs context.
  """
  import Ecto.Query, warn: false

  alias Backend.Careers.JobExperience
  alias Backend.Companies
  alias Backend.Connections
  alias Backend.Jobs.JobApplication
  alias Backend.Jobs.JobPosting
  alias Backend.Notifications
  alias Backend.Recommendations
  alias Backend.Repo
  alias Backend.Skills.Skill
  alias Ecto.Multi

  defp get_application_for_user_and_job(user_id, job_posting_id) do
    from(ja in JobApplication,
      where: ja.user_id == ^user_id and ja.job_posting_id == ^job_posting_id
    )
    |> Repo.one()
  end

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

    # Get collaborative filtering recommendations
    recommended_post_ids =
      Recommendations.get_job_recommendations(user)
      |> Enum.map(& &1.id)
      |> MapSet.new()

    base_query =
      from(jp in JobPosting,
        order_by: [desc: :inserted_at],
        preload: [:user, :company, :skills]
      )

    all_postings = Repo.all(base_query)

    user_connections = Connections.list_user_connections(user.id)

    connection_ids =
      user_connections
      |> Enum.map(fn conn ->
        if conn.user_id == user.id, do: conn.connected_user_id, else: conn.user_id
      end)
      |> MapSet.new()

    connections_map =
      user_connections
      |> Enum.map(fn conn ->
        other_user = if conn.user_id == user.id, do: conn.connected_user, else: conn.user
        {other_user.id, other_user}
      end)
      |> Map.new()

    company_ids = Enum.map(all_postings, & &1.company_id)

    employees_by_company =
      from(je in JobExperience, where: je.company_id in ^company_ids)
      |> select([je], {je.company_id, je.user_id})
      |> Repo.all()
      |> Enum.group_by(fn {cid, _uid} -> cid end, fn {_cid, uid} -> uid end)
      |> Map.new(fn {cid, uids} -> {cid, MapSet.new(uids)} end)

    all_postings_with_details =
      Enum.map(all_postings, fn post ->
        status = Map.get(user_applications, post.id)

        company_employees = Map.get(employees_by_company, post.company_id, MapSet.new())
        relevant_connection_ids = MapSet.intersection(connection_ids, company_employees)

        relevant_connections_data =
          Enum.map(relevant_connection_ids, fn conn_id ->
            conn_user = connections_map[conn_id]

            %{
              id: conn_user.id,
              name: conn_user.name,
              surname: conn_user.surname,
              photo_url: conn_user.photo_url
            }
          end)

        # compute matching skills count and attach it
        post_skill_ids = MapSet.new(Enum.map(post.skills, & &1.id))
        user_skill_ids_set = MapSet.new(user_skill_ids)

        matching_skills_count =
          MapSet.intersection(post_skill_ids, user_skill_ids_set) |> MapSet.size()

        post
        |> Map.put(:application_status, status)
        |> Map.put(:relevant_connections, relevant_connections_data)
        |> Map.put(:matching_skills_count, matching_skills_count)
      end)

    # Sort by recommendation, then skill relevance, and then by date
    Enum.sort_by(all_postings_with_details, fn post ->
      recommendation_score = if MapSet.member?(recommended_post_ids, post.id), do: -1, else: 0
      post_skill_ids = MapSet.new(Enum.map(post.skills, & &1.id))
      user_skill_ids_set = MapSet.new(user_skill_ids)
      skill_score = -(MapSet.intersection(post_skill_ids, user_skill_ids_set) |> MapSet.size())
      {recommendation_score, skill_score, -DateTime.to_unix(post.inserted_at)}
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
    job_posting_with_assocs = Repo.preload(job_posting, [:user, :skills])
    handle_job_posting_transaction(job_posting_with_assocs.user, job_posting_with_assocs, attrs)
  end

  defp handle_job_posting_transaction(user, job_posting_struct, attrs) do
    multi =
      Multi.new()
      |> Multi.run(:company, fn _, _ -> resolve_company_for_multi(attrs, job_posting_struct) end)
      |> Multi.run(:skills, fn _, _ -> resolve_skills_for_multi(attrs) end)

    job_changeset_fun = fn multi_results ->
      build_job_posting_changeset(user, job_posting_struct, attrs, multi_results)
    end

    multi =
      if job_posting_struct.id do
        Multi.update(multi, :job_posting, job_changeset_fun)
      else
        Multi.insert(multi, :job_posting, job_changeset_fun)
      end

    multi
    |> Repo.transaction()
    |> handle_transaction_result()
  end

  defp resolve_company_for_multi(attrs, job_posting_struct) do
    company_id = attrs["company_id"]
    company_name = attrs["company_name"]

    cond do
      !is_nil(company_id) and company_id != "" ->
        {:ok, Companies.get_company!(company_id)}

      !is_nil(company_name) and company_name != "" ->
        Companies.get_or_create_company_by_name(company_name)

      job_posting_struct.id ->
        {:ok, nil}

      true ->
        {:error, "company_id or company_name must be provided"}
    end
  end

  defp resolve_skills_for_multi(attrs) do
    skill_ids = attrs["skill_ids"]

    if is_nil(skill_ids) do
      {:ok, nil}
    else
      {:ok, Repo.all(from(s in Skill, where: s.id in ^skill_ids))}
    end
  end

  defp build_job_posting_changeset(user, job_posting_struct, attrs, multi_results) do
    %{company: company, skills: skills} = multi_results

    job_attrs =
      attrs
      |> Map.drop(["company_name", "skill_ids"])
      |> Map.put("user_id", user.id)

    job_attrs =
      if company do
        Map.put(job_attrs, "company_id", company.id)
      else
        job_attrs
      end

    changeset = JobPosting.changeset(job_posting_struct, job_attrs)

    if skills do
      Ecto.Changeset.put_assoc(changeset, :skills, skills)
    else
      changeset
    end
  end

  defp handle_transaction_result({:ok, %{job_posting: job_posting}}) do
    {:ok, get_job_posting!(job_posting.id)}
  end

  defp handle_transaction_result({:error, :job_posting, changeset, _}) do
    {:error, changeset}
  end

  defp handle_transaction_result({:error, :company, error_msg, _}) do
    changeset =
      %JobPosting{}
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.add_error(:company, to_string(error_msg))

    {:error, changeset}
  end

  defp handle_transaction_result({:error, _, reason, _}) do
    {:error, reason}
  end

  def delete_job_posting(%JobPosting{} = job_posting) do
    Repo.delete(job_posting)
  end

  def apply_for_job(user, job_posting, attrs \\ %{}) do
    if user.id == job_posting.user_id do
      {:error, :cannot_apply_to_own_job}
    else
      # We use the full attrs map, not the 'params' map from the previous version.
      # This ensures any new cover_letter is passed through.
      new_application_attrs =
        attrs
        |> Map.put("user_id", user.id)
        |> Map.put("job_posting_id", job_posting.id)

      case get_application_for_user_and_job(user.id, job_posting.id) do
        # Case 1: No previous application exists. Create a new one.
        nil ->
          with {:ok, application} <-
                 %JobApplication{}
                 |> JobApplication.changeset(new_application_attrs)
                 |> Repo.insert() do
            Notifications.create_notification(%{
              user_id: job_posting.user_id,
              notifier_id: user.id,
              type: "new_application",
              resource_id: job_posting.id,
              resource_type: "job_posting"
            })

            {:ok, application}
          end

        # Case 2: An application exists and was rejected. Allow re-application by updating it.
        %JobApplication{status: "rejected"} = existing_application ->
          # Reset status to "submitted" and update the cover letter if provided.
          update_attrs = Map.put(attrs, "status", "submitted")

          with {:ok, updated_application} <-
                 existing_application
                 |> JobApplication.changeset(update_attrs)
                 |> Repo.update() do
            # Send a notification as if it's a new application
            Notifications.create_notification(%{
              user_id: job_posting.user_id,
              notifier_id: user.id,
              type: "new_application",
              resource_id: job_posting.id,
              resource_type: "job_posting"
            })

            {:ok, updated_application}
          end

        # Case 3: An application exists and is pending or accepted. Deny.
        _existing_application ->
          {:error, :already_applied}
      end
    end
  end

  def list_applications_for_posting(job_posting_id) do
    JobApplication
    |> where(job_posting_id: ^job_posting_id)
    |> preload(:user)
    |> Repo.all()
  end

  def list_all_job_applications do
    JobApplication
    |> order_by(desc: :inserted_at)
    |> preload(user: [], job_posting: [:company])
    |> Repo.all()
  end

  def get_job_application!(id) do
    Repo.get!(JobApplication, id)
  end

  def review_application(%JobApplication{} = application, status) do
    application = Repo.preload(application, [:user, job_posting: [:user]])

    notification_type =
      case status do
        "accepted" -> "application_accepted"
        "rejected" -> "application_rejected"
        _ -> nil
      end

    with {:ok, updated_app} <-
           application |> JobApplication.changeset(%{status: status}) |> Repo.update() do
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
