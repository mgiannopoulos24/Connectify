defmodule BackendWeb.SkillController do
  use BackendWeb, :controller

  alias Backend.Skills
  alias Backend.Skills.Skill
  alias BackendWeb.SkillJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, %{"search" => search_term}) do
    skills = Skills.search_skills(search_term)
    render(conn, SkillJSON, :index, skills: skills)
  end

  def create(conn, %{"skill" => skill_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %Skill{} = skill} <- Skills.add_skill_for_user(current_user, skill_params) do
      conn
      |> put_status(:created)
      |> render(SkillJSON, :show, skill: skill)
    end
  end

  # The update function is not used by the profile page, but it's corrected for completeness.
  def update(conn, %{"id" => id, "skill" => skill_params}) do
    skill = Skills.get_skill!(id)

    # Note: This updates the master skill name. This should likely be an admin-only action.
    # The current frontend doesn't use this.
    with {:ok, %Skill{} = skill} <- Skills.update_skill(skill, skill_params) do
      render(SkillJSON, :show, skill: skill)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    skill = Skills.get_skill!(id)

    # --- FIX: The entire logic is replaced here ---
    # Instead of checking ownership and deleting the master skill,
    # we now just remove the association from the current user.
    with {:ok, _user} <- Skills.delete_skill_from_user(current_user, skill) do
      send_resp(conn, :no_content, "")
    end
  end
end
