defmodule Backend.Careers do
  @moduledoc """
  The Careers context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience

  def create_job_experience(attrs \\ %{}) do
    %JobExperience{}
    |> JobExperience.changeset(attrs)
    |> Repo.insert()
  end

  def create_education(attrs \\ %{}) do
    %Education{}
    |> Education.changeset(attrs)
    |> Repo.insert()
  end
end
