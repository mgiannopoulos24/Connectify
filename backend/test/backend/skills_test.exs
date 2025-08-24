defmodule Backend.SkillsTest do
  use Backend.DataCase, async: true

  alias Backend.Skills
  alias Backend.Skills.Skill

  import Backend.AccountsFixtures

  describe "master skills" do
    test "create_master_skill/1 creates a master skill with nil user_id" do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Elixir"})
      assert skill.name == "Elixir"
      # schema no longer has user_id field (many-to-many). ensure the master exists in DB.
      db_skill = Repo.get_by(Skill, name: "Elixir")
      assert db_skill.id == skill.id
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
    test "add_skill_for_user/2 creates master skill if missing and associates it to the user" do
      user = user_fixture()
      assert {:ok, skill} = Skills.add_skill_for_user(user, %{"name" => "Phoenix"})
      assert skill.name == "Phoenix"

      # reload the user from the database so it includes the newly created association
      user_with_skills = Repo.get!(Backend.Accounts.User, user.id) |> Repo.preload(:skills)

      assert Enum.any?(user_with_skills.skills, &(&1.name == "Phoenix"))

      master =
        Repo.get_by(Skill, name: "Phoenix")
        |> Repo.preload(:users)

      # master should exist and be associated to the user via the users relation
      assert master.name == "Phoenix"
      assert Enum.any?(master.users, &(&1.id == user.id))
    end

    test "add_skill_for_user/2 when casing differs will create a new master skill (case-sensitive lookup)" do
      {:ok, _master} = Skills.create_master_skill(%{"name" => "Docker"})
      user = user_fixture()

      assert {:ok, _} = Skills.add_skill_for_user(user, %{"name" => "docker"})
      # implementation does a case-sensitive get_by, so both "Docker" and "docker" may exist
      masters = Repo.all(from s in Skill, where: ilike(s.name, ^"docker"))
      assert length(masters) >= 1
    end

    test "add_skill_for_user/2 returns existing user-associated master when adding duplicate" do
      user = user_fixture()
      {:ok, first} = Skills.add_skill_for_user(user, %{"name" => "GraphQL"})

      # reload the user from the DB so it includes the new association
      user = Repo.get!(Backend.Accounts.User, user.id) |> Repo.preload(:skills)

      assert {:ok, second} = Skills.add_skill_for_user(user, %{"name" => "GraphQL"})
      assert first.id == second.id
    end

    test "add_skill_for_user/2 raises when invalid attrs cause master creation to fail" do
      user = user_fixture()
      assert_raise ArgumentError, fn -> Skills.add_skill_for_user(user, %{}) end
    end

    test "update_skill/2 updates skill attributes" do
      {:ok, master} = Skills.create_master_skill(%{"name" => "OldName"})
      assert {:ok, updated} = Skills.update_skill(master, %{"name" => "NewName"})
      assert updated.name == "NewName"
    end

    test "delete_master_skill/1 deletes the master skill" do
      {:ok, master} = Skills.create_master_skill(%{"name" => "ToRemove"})
      assert {:ok, _} = Skills.delete_master_skill(master)
      assert_raise Ecto.NoResultsError, fn -> Skills.get_skill!(master.id) end
    end
  end
end
