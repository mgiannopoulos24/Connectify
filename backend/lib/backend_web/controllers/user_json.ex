defmodule BackendWeb.UserJSON do
  alias Backend.Accounts.User
  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Skills.Skill

  @doc """
  Renders a list of users.
  """
  def index(%{users: users}) do
    %{data: for(user <- users, do: data(user))}
  end

  @doc """
  Renders a single user.
  """
  def show(%{user: user}) do
    %{data: data(user)}
  end

  defp data(%User{} = user) do
    %{
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
      job_experiences: Enum.map(user.job_experiences, &job_experience_data/1),
      educations: Enum.map(user.educations, &education_data/1),
      skills: Enum.map(user.skills, &skill_data/1)
    }
  end

  defp job_experience_data(%JobExperience{} = job_experience) do
    %{
      id: job_experience.id,
      job_title: job_experience.job_title,
      employment_type: job_experience.employment_type,
      company_name: job_experience.company_name
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
end