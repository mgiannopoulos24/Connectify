defmodule Backend.InterestsTest do
  use Backend.DataCase, async: true

  alias Backend.Interests
  alias Backend.Interests.Interest

  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

  describe "interests (follow/unfollow) API" do
    test "follow_entity/3 with valid data creates an interest for company" do
      user = user_fixture()
      company = company_fixture(%{name: "Microsoft"})

      assert {:ok, %Interest{} = interest} =
               Interests.follow_entity(user.id, company.id, "company")

      assert interest.user_id == user.id
      assert interest.followed_id == company.id
      assert interest.type == "company"
    end

    test "follow_entity/3 rejects duplicate follow (unique constraint)" do
      user = user_fixture()
      company = company_fixture(%{name: "Acme Corp"})

      {:ok, _} = Interests.follow_entity(user.id, company.id, "company")

      assert {:error, %Ecto.Changeset{} = changeset} =
               Interests.follow_entity(user.id, company.id, "company")

      errors = errors_on(changeset)
      assert Enum.any?(Map.values(errors), fn vals -> "has already been taken" in vals end)
    end

    test "unfollow_entity/3 removes the follow and following?/3 reflects it" do
      follower = user_fixture()
      followed = user_fixture()

      {:ok, _} = Interests.follow_entity(follower.id, followed.id, "user")
      assert Interests.following?(follower.id, followed.id, "user")

      assert {1, _} = Interests.unfollow_entity(follower.id, followed.id, "user")
      refute Interests.following?(follower.id, followed.id, "user")
    end

    test "count_followers_for_entity/2 counts followers correctly" do
      company = company_fixture(%{name: "CountCo"})
      u1 = user_fixture()
      u2 = user_fixture()

      {:ok, _} = Interests.follow_entity(u1.id, company.id, "company")
      {:ok, _} = Interests.follow_entity(u2.id, company.id, "company")

      assert 2 == Interests.count_followers_for_entity(company.id, "company")
    end

    test "list_followed_companies/1 returns companies ordered by name" do
      follower = user_fixture()
      c_a = company_fixture(%{name: "Alpha"})
      c_b = company_fixture(%{name: "Beta"})

      {:ok, _} = Interests.follow_entity(follower.id, c_b.id, "company")
      {:ok, _} = Interests.follow_entity(follower.id, c_a.id, "company")

      companies = Interests.list_followed_companies(follower.id)
      assert Enum.map(companies, & &1.name) == ["Alpha", "Beta"]
    end

    test "list_followed_users/1 returns users ordered by name" do
      follower = user_fixture()
      u_a = user_fixture(%{name: "Aaron"})
      u_b = user_fixture(%{name: "Zoe"})

      {:ok, _} = Interests.follow_entity(follower.id, u_b.id, "user")
      {:ok, _} = Interests.follow_entity(follower.id, u_a.id, "user")

      users = Interests.list_followed_users(follower.id)
      assert Enum.map(users, & &1.name) == ["Aaron", "Zoe"]
    end

    test "following?/3 returns true only when a follow exists" do
      follower = user_fixture()
      followed = user_fixture()

      refute Interests.following?(follower.id, followed.id, "user")
      {:ok, _} = Interests.follow_entity(follower.id, followed.id, "user")
      assert Interests.following?(follower.id, followed.id, "user")
    end

    # Edge case tests
    test "unfollow_entity/3 on non-existent follow returns {0, _}" do
      follower = user_fixture()
      followed = user_fixture()

      assert {0, _} = Interests.unfollow_entity(follower.id, followed.id, "user")
    end

    test "count_followers_for_entity/2 returns 0 for entity with no followers" do
      company = company_fixture(%{name: "NobodyCo"})
      assert 0 == Interests.count_followers_for_entity(company.id, "company")
    end

    test "list_followed_companies/1 returns empty list when user follows none" do
      follower = user_fixture()
      assert [] == Interests.list_followed_companies(follower.id)
    end

    test "follow_entity/3 with non-existent ids returns an error changeset" do
      # Use ids that should not exist in the database
      nonexistent_user_id = -1
      nonexistent_followed_id = -999

      assert {:error, %Ecto.Changeset{}} =
               Interests.follow_entity(nonexistent_user_id, nonexistent_followed_id, "company")
    end
  end
end
