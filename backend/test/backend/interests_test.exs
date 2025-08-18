defmodule Backend.InterestsTest do
  use Backend.DataCase, async: true

  alias Backend.Interests
  alias Backend.Interests.Interest

  import Backend.AccountsFixtures

  describe "interests" do
    test "create_interest/1 with valid data creates an interest" do
      user = user_fixture()

      assert {:ok, %Interest{} = interest} =
               Interests.create_interest(%{
                 "name" => "Microsoft",
                 "type" => "company",
                 "user_id" => user.id
               })

      assert interest.name == "Microsoft"
      assert interest.type == "company"
      assert interest.user_id == user.id
    end

    test "create_interest/1 with missing name returns error changeset" do
      user = user_fixture()

      assert {:error, %Ecto.Changeset{} = changeset} =
               Interests.create_interest(%{"type" => "company", "user_id" => user.id})

      assert "can't be blank" in errors_on(changeset).name
    end

    test "create_interest/1 rejects duplicate name (unique constraint)" do
      user = user_fixture()

      {:ok, _} =
        Interests.create_interest(%{
          "name" => "Microsoft",
          "type" => "company",
          "user_id" => user.id
        })

      assert {:error, %Ecto.Changeset{} = changeset} =
               Interests.create_interest(%{
                 "name" => "Microsoft",
                 "type" => "company",
                 "user_id" => user.id
               })

      errors = errors_on(changeset)
      # composite unique constraint may attach the error to any of the indexed fields;
      # assert that at least one field contains the "has already been taken" message
      assert Enum.any?(Map.values(errors), fn vals -> "has already been taken" in vals end)
    end

    test "create_interest/1 accepts atom keys" do
      user = user_fixture()

      assert {:ok, %Interest{} = interest} =
               Interests.create_interest(%{name: "Apple", type: "company", user_id: user.id})

      assert interest.name == "Apple"
    end

    test "create_interest/1 ignores unexpected attrs" do
      user = user_fixture()

      {:ok, interest} =
        Interests.create_interest(%{
          "name" => "CENSUS",
          "unexpected" => "value",
          "type" => "company",
          "user_id" => user.id
        })

      refute Map.has_key?(interest, :unexpected)
      assert interest.name == "CENSUS"
    end

    test "interests support type 'people' and 'company'" do
      user = user_fixture()

      assert {:ok, %Interest{}} =
               Interests.create_interest(%{
                 "name" => "Alice",
                 "type" => "people",
                 "user_id" => user.id
               })

      assert {:ok, %Interest{}} =
               Interests.create_interest(%{
                 "name" => "Acme Corp",
                 "type" => "company",
                 "user_id" => user.id
               })
    end

    # --- added tests for people ---
    test "people interest preserves name case and can be retrieved" do
      user = user_fixture()

      {:ok, interest} =
        Interests.create_interest(%{
          "name" => "AlIce Johnson",
          "type" => "people",
          "user_id" => user.id
        })

      assert interest.name == "AlIce Johnson"
      assert interest.type == "people"
    end

    test "same person name allowed for different users" do
      u1 = user_fixture()
      u2 = user_fixture()

      {:ok, _} =
        Interests.create_interest(%{"name" => "Jordan", "type" => "people", "user_id" => u1.id})

      # different user — should succeed
      assert {:ok, %Interest{}} =
               Interests.create_interest(%{
                 "name" => "Jordan",
                 "type" => "people",
                 "user_id" => u2.id
               })
    end

    test "duplicate people interest for same user and type is rejected" do
      user = user_fixture()

      {:ok, _} =
        Interests.create_interest(%{"name" => "Taylor", "type" => "people", "user_id" => user.id})

      assert {:error, %Ecto.Changeset{} = changeset} =
               Interests.create_interest(%{
                 "name" => "Taylor",
                 "type" => "people",
                 "user_id" => user.id
               })

      errors = errors_on(changeset)
      assert Enum.any?(Map.values(errors), fn vals -> "has already been taken" in vals end)
    end
  end
end
