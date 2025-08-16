defmodule Backend.Jobs do
  @modledoc """
  The Jobs context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Jobs.JobPosting
  alias Backend.Jobs.JobApplication
  alias Backend.Skills.Skill
  alias Backend.Companies
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
    user_skill_ids = Enum.map(user.skills, & &1.id)

    base_query =
      from(jp in JobPosting,
        order_by: [desc: :inserted_at],
        preload: [:user, :company, :skills]
      )

    all_postings = Repo.all(base_query)

    # The sort function now returns a tuple for multi-level sorting.
    # Primary sort: score (descending because it's negative).
    # Secondary sort: inserted_at timestamp (descending by using a negative unix timestamp).
    Enum.sort_by(all_postings, fn post ->
      post_skill_ids = MapSet.new(Enum.map(post.skills, & &1.id))
      user_skill_ids_set = MapSet.new(user_skill_ids)

      # --- FIX APPLIED HERE ---
      # Calculate the size of the intersection first, then negate the number.
      score = -(MapSet.intersection(post_skill_ids, user_skill_ids_set) |> MapSet.size())

      {score, -DateTime.to_unix(post.inserted_at)}
    end)
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
    |> Multi.insert(:job_posting, fn %{company: company, skills: skills} ->
      job_attrs = Map.drop(attrs, ["company_name", "skill_ids"])
      |> Map.put("user_id", user.id)

      job_attrs =
        if company,
          do: Map.put(job_attrs, "company_id", company.id),
          else: job_attrs

      changeset = JobPosting.changeset(job_posting_struct, job_attrs)
      if skills,
        do: Ecto.Changeset.put_assoc(changeset, :skills, skills),
        else: changeset
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{job_posting: job_posting}} ->
        {:ok, get_job_posting!(job_posting.id)}

      {:error, :job_posting, changeset, _} ->
        {:error, changeset}

      {:error, :company, error_msg, _} ->
        {:error, Ecto.Changeset.change(%JobPosting{}) |> Ecto.Changeset.add_error(:company, to_string(error_msg))}

      {:error, _, reason, _} ->
        {:error, reason}
    end
  end

  def delete_job_posting(%JobPosting{} = job_posting) do
    Repo.delete(job_posting)
  end

  def apply_for_job(user, job_posting, attrs \\ %{}) do
    attrs
    |> Map.put("user_id", user.id)
    |> Map.put("job_posting_id", job_posting.id)
    |> JobApplication.changeset(%JobApplication{})
    |> Repo.insert()
  end

  def list_applications_for_posting(job_posting_id) do
    JobApplication
    |> where(job_posting_id: ^job_posting_id)
    |> preload(:user)
    |> Repo.all()
  end
end