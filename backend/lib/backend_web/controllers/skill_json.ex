defmodule BackendWeb.SkillJSON do
  alias Backend.Skills.Skill

  @doc """
  Renders a single skill.
  """
  def show(%{skill: skill}) do
    %{data: data(skill)}
  end

  defp data(%Skill{} = skill) do
    %{
      id: skill.id,
      name: skill.name
    }
  end
end
