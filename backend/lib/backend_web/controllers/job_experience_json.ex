defmodule BackendWeb.JobExperienceJSON do
  alias Backend.Careers.JobExperience
  alias Backend.Companies.Company

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
      company: company_data(job_experience.company)
    }
  end

  defp company_data(nil), do: nil
  defp company_data(%Ecto.Association.NotLoaded{}), do: nil

  defp company_data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url
    }
  end
end
