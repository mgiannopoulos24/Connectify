defmodule BackendWeb.Admin.SkillJSONTest do
  use Backend.DataCase, async: true

  alias Backend.Skills
  alias BackendWeb.Admin.SkillJSON

  describe "index/1" do
    test "renders a list of skills" do
      {:ok, skill1} = Skills.create_master_skill(%{"name" => "Elixir"})
      {:ok, skill2} = Skills.create_master_skill(%{"name" => "Phoenix"})

      result = SkillJSON.index(%{skills: [skill1, skill2]})

      assert result == %{
               data: [
                 %{"id" => skill1.id, "name" => "Elixir"},
                 %{"id" => skill2.id, "name" => "Phoenix"}
               ]
             }
    end

    test "renders an empty list when no skills are provided" do
      result = SkillJSON.index(%{skills: []})
      assert result == %{data: []}
    end
  end

  describe "show/1" do
    test "renders a single skill" do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "LiveView"})
      result = SkillJSON.show(%{skill: skill})

      assert result == %{
               data: %{
                 "id" => skill.id,
                 "name" => "LiveView"
               }
             }
    end
  end

  describe "data/1" do
    test "renders a skill with special characters in the name" do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Node.js"})
      result = SkillJSON.data(skill)

      assert result == %{
               "id" => skill.id,
               "name" => "Node.js"
             }
    end
  end
end
