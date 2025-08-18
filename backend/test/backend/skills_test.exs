defmodule Backend.SkillsTest do
  use Backend.DataCase, async: true

  alias Backend.Skills
  alias Backend.Skills.Skill

  import Backend.AccountsFixtures

  describe "master skills" do
    test "create_master_skill/1 creates a master skill with nil user_id" do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Elixir"})
      assert skill.name == "Elixir"
      assert skill.user_id == nil
    end

    test "list_master_skills/0 returns only master skills ordered by name" do
      {:ok, _} = Skills.create_master_skill(%{"name" => "Zeta"})
      {:ok, _} = Skills.create_master_skill(%{"name" => "Alpha"})

      names = Enum.map(Skills.list_master_skills(), & &1.name)
      assert names == Enum.sort(names)
      assert Enum.take(names, 2) == ["Alpha", "Zeta"]
    end

    test "search_skills/1 is case-insensitive and limited to 10 results" do
      for i <- 1..12 do
        Skills.create_master_skill(%{"name" => "Pref#{i}"})
      end

      results = Skills.search_skills("preF")
      assert length(results) == 10

      assert Enum.all?(results, fn s -> String.downcase(s.name) |> String.starts_with?("pref") end)
    end
  end

  describe "user skills" do
    test "add_skill_for_user/2 creates master skill if missing and user skill" do
      user = user_fixture()
      assert {:ok, user_skill} = Skills.add_skill_for_user(user, %{"name" => "Phoenix"})
      assert user_skill.user_id == user.id
      # master skill exists (user_id is NULL in DB) — use an explicit query with is_nil/1
      master =
        Repo.one!(from(s in Skill, where: s.name == ^"Phoenix" and is_nil(s.user_id)))

      assert master.name == "Phoenix"
    end

    test "add_skill_for_user/2 reuses existing master skill (case-insensitive)" do
      {:ok, _master} = Skills.create_master_skill(%{"name" => "Docker"})
      user = user_fixture()

      assert {:ok, _} = Skills.add_skill_for_user(user, %{"name" => "docker"})
      # only one master skill exists
      masters = Repo.all(from s in Skill, where: is_nil(s.user_id) and ilike(s.name, ^"docker"))
      assert length(masters) == 1
    end

    test "add_skill_for_user/2 returns existing user skill when adding duplicate" do
      user = user_fixture()
      {:ok, first} = Skills.add_skill_for_user(user, %{"name" => "GraphQL"})

      result = Skills.add_skill_for_user(user, %{"name" => "GraphQL"})

      case result do
        {:ok, second} ->
          # If the function returns ok, it should return the same record
          assert first.id == second.id

        {:error, %Ecto.Changeset{} = _changeset} ->
          # Some implementations return an error changeset on duplicate;
          # ensure the existing record is present in the DB
          existing = Repo.get_by(Skill, name: "GraphQL", user_id: user.id)
          assert existing.id == first.id

        other ->
          flunk("unexpected return from add_skill_for_user/2: #{inspect(other)}")
      end
    end

    test "add_skill_for_user/2 returns error changeset for invalid attrs" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Skills.add_skill_for_user(user, %{})
    end

    test "update_skill/2 updates skill attributes" do
      {:ok, master} = Skills.create_master_skill(%{"name" => "OldName"})
      assert {:ok, updated} = Skills.update_skill(master, %{"name" => "NewName"})
      assert updated.name == "NewName"
    end

    test "delete_skill/1 deletes the skill" do
      {:ok, master} = Skills.create_master_skill(%{"name" => "ToRemove"})
      assert {:ok, _} = Skills.delete_skill(master)
      assert_raise Ecto.NoResultsError, fn -> Skills.get_skill!(master.id) end
    end
  end
end
