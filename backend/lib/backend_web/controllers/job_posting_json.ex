defmodule BackendWeb.JobPostingJSON do
  alias Backend.Jobs.JobApplication
  alias Backend.Jobs.JobPosting
  alias BackendWeb.SkillJSON

  def index(%{job_postings: job_postings}) do
    %{data: Enum.map(job_postings, &data/1)}
  end

  def show(%{job_posting: job_posting}) do
    %{data: data(job_posting)}
  end

  def data(%JobPosting{} = job_posting) do
    %{
      id: job_posting.id,
      title: job_posting.title,
      description: job_posting.description,
      location: job_posting.location,
      job_type: job_posting.job_type,
      inserted_at: job_posting.inserted_at,
      user: safe_user_data(job_posting.user),
      company: safe_company_data(job_posting.company),
      skills: Enum.map(job_posting.skills, &SkillJSON.data/1),
      applications:
        if Ecto.assoc_loaded?(job_posting.job_applications) do
          Enum.map(job_posting.job_applications, &application_data/1)
        else
          []
        end,
      application_status: job_posting.application_status,
      relevant_connections: job_posting.relevant_connections
    }
  end

  defp application_data(%JobApplication{} = application) do
    %{
      id: application.id,
      status: application.status,
      cover_letter: application.cover_letter,
      inserted_at: application.inserted_at,
      user: safe_user_data(application.user)
    }
  end

  defp safe_user_data(%Ecto.Association.NotLoaded{}), do: nil
  defp safe_user_data(nil), do: nil

  defp safe_user_data(user) do
    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url
    }
  end

  defp safe_company_data(%Ecto.Association.NotLoaded{}), do: nil
  defp safe_company_data(nil), do: nil

  defp safe_company_data(company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url
    }
  end
end
