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

  def update(conn, %{"id" => id, "skill" => skill_params}) do
    current_user = conn.assigns.current_user
    skill = Skills.get_skill!(id)

    if skill.user_id == current_user.id do
      with {:ok, %Skill{} = skill} <- Skills.update_skill(skill, skill_params) do
        render(SkillJSON, :show, skill: skill)
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    skill = Skills.get_skill!(id)

    if skill.user_id == current_user.id do
      with {:ok, _skill} <- Skills.delete_skill(skill) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end
end