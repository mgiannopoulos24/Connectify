defmodule Backend.Careers do
  @moduledoc """
  The Careers context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Companies
  alias Backend.Interests

  def get_job_experience!(id), do: Repo.get!(JobExperience, id) |> Repo.preload(:company)

  def create_job_experience(attrs \\ %{}) do
    user_id = attrs["user_id"]
    result = handle_job_experience_transaction(attrs, %JobExperience{})

    # After creating the job experience, handle the auto-follow logic
    case result do
      {:ok, job_experience} ->
        # Check if this is the user's first job experience
        query = from(je in JobExperience, where: je.user_id == ^user_id, select: count(je.id))
        count = Repo.one(query)

        if count == 1 do
          # This is their first job, auto-follow the company.
          # We can ignore the result here, it's a "best effort" side-effect.
          Interests.follow_entity(user_id, job_experience.company_id, "company")
        end

        {:ok, job_experience}

      error ->
        error
    end
  end

  def update_job_experience(%JobExperience{} = job_experience, attrs) do
    handle_job_experience_transaction(attrs, job_experience)
  end

  defp handle_job_experience_transaction(attrs, job_experience_struct) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:company, fn _repo, _changes ->
      company_id = attrs["company_id"]
      company_name = attrs["company_name"]

      cond do
        !is_nil(company_id) and company_id != "" ->
          {:ok, Companies.get_company!(company_id)}

        !is_nil(company_name) and company_name != "" ->
          Companies.get_or_create_company_by_name(company_name)

        true ->
          # This allows updating a job experience without changing the company
          # For creation, a company must be provided.
          if job_experience_struct.id,
            do: {:ok, nil},
            else: {:error, "company_id or company_name must be provided"}
      end
    end)
    |> (fn multi ->
          job_changeset_fun = fn %{company: company} ->
            job_attrs = Map.drop(attrs, ["company_name"])
            # If a company was found or created, include its ID in the changeset
            # Otherwise, leave it out to allow updates without changing the company
            job_attrs =
              if company do
                Map.put(job_attrs, "company_id", company.id)
              else
                job_attrs
              end

            JobExperience.changeset(job_experience_struct, job_attrs)
          end

          if job_experience_struct.id do
            Ecto.Multi.update(multi, :job_experience, job_changeset_fun)
          else
            Ecto.Multi.insert(multi, :job_experience, job_changeset_fun)
          end
        end).()
    |> Repo.transaction()
    |> case do
      {:ok, %{job_experience: job_experience}} ->
        {:ok, Repo.preload(job_experience, :company)}

      {:error, :job_experience, changeset, _} ->
        {:error, changeset}

      {:error, :company, error_msg, _} ->
        # For user clarity, wrap the error in a changeset-like structure
        changeset = Ecto.Changeset.change(%JobExperience{}, %{})
        {:error, Ecto.Changeset.add_error(changeset, :company_name, to_string(error_msg))}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def delete_job_experience(%JobExperience{} = job_experience) do
    Repo.delete(job_experience)
  end

  def get_education!(id), do: Repo.get!(Education, id)

  def create_education(attrs \\ %{}) do
    %Education{}
    |> Education.changeset(attrs)
    |> Repo.insert()
  end

  def update_education(%Education{} = education, attrs) do
    education
    |> Education.changeset(attrs)
    |> Repo.update()
  end

  def delete_education(%Education{} = education) do
    Repo.delete(education)
  end
end
