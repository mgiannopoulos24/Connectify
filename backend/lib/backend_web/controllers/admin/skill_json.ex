defmodule BackendWeb.Admin.SkillJSON do
alias Backend.Skills.Skill
def index(%{skills: skills}) do
%{data: Enum.map(skills, &data/1)}
end
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