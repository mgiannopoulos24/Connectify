defmodule BackendWeb.UserJSON do
  alias Backend.Accounts.User
  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Skills.Skill
  alias Backend.Interests.Interest
  alias Backend.Connections.Connection
  alias Backend.Companies.Company
  alias BackendWeb.PostJSON

  @doc """
  Renders a list of users.
  """
  def index(%{users: users}) do
    %{data: for(user <- users, do: data(user))}
  end

  @doc """
  Renders a single user.
  """
  def show(%{user: user, token: token}) do
    %{data: data(user), token: token}
  end

  def show(%{user: user}) do
    %{data: data(user)}
  end

  # --- FIX APPLIED HERE: Changed defp to def ---
  def data(%User{} = user) do
    data = %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      role: user.role,
      location: user.location,
      onboarding_completed: user.onboarding_completed,
      email_confirmed_at: user.email_confirmed_at,
      status: user.status,
      last_seen_at: user.last_seen_at,
      job_experiences: Enum.map(user.job_experiences, &job_experience_data/1),
      educations: Enum.map(user.educations, &education_data/1),
      skills: Enum.map(user.skills, &skill_data/1),
      interests: Enum.map(user.interests, &interest_data/1),
      sent_connections: Enum.map(user.sent_connections, &connection_info_data/1),
      received_connections: Enum.map(user.received_connections, &connection_info_data/1)
    }

    if Ecto.assoc_loaded?(user.posts) do
      Map.put(data, :posts, Enum.map(user.posts, &PostJSON.data/1))
    else
      data
    end
  end

  defp job_experience_data(%JobExperience{} = job_experience) do
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

  defp education_data(%Education{} = education) do
    %{
      id: education.id,
      school_name: education.school_name,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: education.start_date,
      end_date: education.end_date
    }
  end

  defp skill_data(%Skill{} = skill) do
    %{
      id: skill.id,
      name: skill.name
    }
  end

  defp interest_data(%Interest{} = interest) do
    %{
      id: interest.id,
      name: interest.name,
      type: interest.type
    }
  end

  defp connection_info_data(%Connection{} = connection) do
    %{
      id: connection.id,
      status: connection.status,
      user_id: connection.user_id,
      connected_user_id: connection.connected_user_id
    }
  end
end
