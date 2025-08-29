defmodule BackendWeb.Admin.SkillController do
  use BackendWeb, :controller

  alias Backend.Skills
  alias Backend.Skills.Skill
  alias Backend.Repo
  alias BackendWeb.Admin.SkillJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    skills = Skills.list_master_skills()
    render(conn, SkillJSON, :index, skills: skills)
  end

  def create(conn, %{"skill" => skill_params}) do
    with {:ok, %Skill{} = skill} <- Skills.create_master_skill(skill_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/admin/skills/#{skill}")
      |> render(SkillJSON, :show, skill: skill)
    end
  end

  def show(conn, %{"id" => id}) do
    with %Skill{} = skill <- Repo.get(Skill, id) do
      render(conn, SkillJSON, :show, skill: skill)
    else
      nil -> {:error, :not_found}
    end
  end

  def update(conn, %{"id" => id, "skill" => skill_params}) do
    with %Skill{} = skill <- Repo.get(Skill, id) do
      with {:ok, %Skill{} = updated_skill} <- Skills.update_skill(skill, skill_params) do
        render(conn, SkillJSON, :show, skill: updated_skill)
      end
    else
      nil -> {:error, :not_found}
    end
  end

  def delete(conn, %{"id" => id}) do
    with %Skill{} = skill <- Repo.get(Skill, id) do
      with {:ok, %Skill{}} <- Skills.delete_master_skill(skill) do
        send_resp(conn, :no_content, "")
      end
    else
      nil -> {:error, :not_found}
    end
  end
end
