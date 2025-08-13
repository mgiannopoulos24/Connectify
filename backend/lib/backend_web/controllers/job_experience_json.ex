defmodule BackendWeb.JobExperienceJSON do
  alias Backend.Careers.JobExperience

  @doc """
  Renders a single job experience.
  """
  def show(%{job_experience: job_experience}) do
    %{data: data(job_experience)}
  end

  defp data(%JobExperience{} = job_experience) do
    %{
      id: job_experience.id,
      job_title: job_experience.job_title,
      employment_type: job_experience.employment_type,
      company_name: job_experience.company_name
    }
  end
end
