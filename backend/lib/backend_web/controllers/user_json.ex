defmodule BackendWeb.UserJSON do
  alias Backend.Accounts.User
  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Skills.Skill
  alias Backend.Interests
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

  @doc """
  Renders a list of users for search autocomplete results.
  """
  def search_results(%{users: users}) do
    %{data: for(user <- users, do: search_result_data(user))}
  end

  defp search_result_data(user_map) do
    # The search query in the Accounts context already returns a map
    # with the exact fields needed for the autocomplete dropdown.
    user_map
  end

  # --- FIX APPLIED HERE: Changed defp to def ---
  def data(%User{} = user) do
    followed_companies = Interests.list_followed_companies(user.id)
    followed_users = Interests.list_followed_users(user.id)
    followers_count = Interests.count_followers_for_entity(user.id, "user")

    data = %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      role: user.role,
      location: user.location,
      followers_count: followers_count,
      onboarding_completed: user.onboarding_completed,
      email_confirmed_at: user.email_confirmed_at,
      status: user.status,
      last_seen_at: user.last_seen_at,
      # Add the new visibility field to the response
      profile_visibility: user.profile_visibility,
      job_experiences: Enum.map(user.job_experiences, &job_experience_data/1),
      educations: Enum.map(user.educations, &education_data/1),
      skills: Enum.map(user.skills, &skill_data/1),
      sent_connections: Enum.map(user.sent_connections, &connection_info_data/1),
      received_connections: Enum.map(user.received_connections, &connection_info_data/1),
      followed_companies: Enum.map(followed_companies, &followed_company_data/1),
      followed_users: Enum.map(followed_users, &followed_user_data/1)
    }

    data_with_posts =
      if Ecto.assoc_loaded?(user.posts) do
        Map.put(data, :posts, Enum.map(user.posts, &PostJSON.data/1))
      else
        data
      end

    if Ecto.assoc_loaded?(user.job_postings) do
      Map.put(
        data_with_posts,
        :job_postings,
        Enum.map(user.job_postings, &BackendWeb.JobPostingJSON.data/1)
      )
    else
      data_with_posts
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

  defp followed_company_data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url
    }
  end

  defp followed_user_data(%User{} = user) do
    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url
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
