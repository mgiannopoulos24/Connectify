defmodule BackendWeb.SkillJSON do
  alias Backend.Skills.Skill

  @doc """
  Renders a list of skills.
  """
  def index(%{skills: skills}) do
    %{data: Enum.map(skills, &data/1)}
  end

  @doc """
  Renders a single skill.
  """
  def show(%{skill: skill}) do
    %{data: data(skill)}
  end

  # --- FIX: Changed defp to def to make the function public ---
  def data(%Skill{} = skill) do
    %{
      id: skill.id,
      name: skill.name
    }
  end
end
