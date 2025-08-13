defmodule Backend.Careers do
  @moduledoc """
  The Careers context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience

  def get_job_experience!(id), do: Repo.get!(JobExperience, id)

  def create_job_experience(attrs \\ %{}) do
    %JobExperience{}
    |> JobExperience.changeset(attrs)
    |> Repo.insert()
  end

  def update_job_experience(%JobExperience{} = job_experience, attrs) do
    job_experience
    |> JobExperience.changeset(attrs)
    |> Repo.update()
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
