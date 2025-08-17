defmodule BackendWeb.Admin.JobApplicationJSON do
  alias Backend.Jobs.JobApplication
  # --- REMOVED UserJSON and JobPostingJSON aliases as we create local helpers ---

  def index(%{applications: applications}) do
    %{data: Enum.map(applications, &data/1)}
  end

  def show(%{application: application}) do
    %{data: data(application)}
  end

  defp data(%JobApplication{} = application) do
    %{
      id: application.id,
      status: application.status,
      cover_letter: application.cover_letter,
      inserted_at: application.inserted_at,
      # --- FIX: Call a local, lightweight function instead of the heavy UserJSON.data/1 ---
      user: user_data(application.user),
      job_posting: job_posting_data(application.job_posting)
    }
  end

  # --- NEW: Lightweight rendering function for user summary ---
  defp user_data(%Ecto.Association.NotLoaded{}), do: nil
  defp user_data(nil), do: nil

  defp user_data(user) do
    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url
    }
  end

  # --- NEW: Lightweight rendering function for job posting summary ---
  defp job_posting_data(%Ecto.Association.NotLoaded{}), do: nil
  defp job_posting_data(nil), do: nil

  defp job_posting_data(job_posting) do
    %{
      id: job_posting.id,
      title: job_posting.title,
      company: company_data(job_posting.company)
    }
  end

  # --- NEW: Lightweight rendering function for company summary ---
  defp company_data(%Ecto.Association.NotLoaded{}), do: nil
  defp company_data(nil), do: nil

  defp company_data(company) do
    %{
      id: company.id,
      name: company.name
    }
  end
end
