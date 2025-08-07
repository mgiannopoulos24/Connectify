defmodule Backend.AccountsTest do
  use Backend.DataCase

  alias Backend.Accounts

  describe "users" do
    alias Backend.Accounts.User

    import Backend.AccountsFixtures

    @invalid_attrs %{
      name: nil,
      email: nil,
      surname: nil,
      password_hash: nil,
      phone_number: nil,
      photo_url: nil,
      role: nil
    }

    test "list_users/0 returns all users" do
      user = user_fixture()

      # The `user_fixture` returns a struct with the virtual password field populated.
      # When we fetch the user from the DB, that virtual field will be nil.
      # To make the comparison work, we must create a struct that matches what the DB returns.
      user_for_comparison = %{user | password: nil}

      assert Accounts.list_users() == [user_for_comparison]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()

      # On the right side of the comparison, we use the `user` variable
      # but overwrite the virtual password field to be nil, making it
      # identical to what get_user! will return from the database.
      assert Accounts.get_user!(user.id) == %{user | password: nil}
    end

    test "create_user/1 with valid data creates a user" do

      valid_attrs = %{
        name: "some name",
        email: "some@email.com",
        surname: "some surname",
        password: "password123",
        phone_number: "some phone_number",
        photo_url: "some photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.create_user(valid_attrs)
      assert user.name == "some name"
      assert user.email == "some@email.com"
      assert user.surname == "some surname"
      assert user.password_hash != nil
      assert user.phone_number == "some phone_number"
      assert user.photo_url == "some photo_url"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()

      update_attrs = %{
        name: "some updated name",
        email: "some.updated@email.com",
        surname: "some updated surname",
        phone_number: "some updated phone_number",
        photo_url: "some updated photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.update_user(user, update_attrs)
      assert user.name == "some updated name"
      assert user.email == "some.updated@email.com"
      assert user.surname == "some updated surname"
      assert user.phone_number == "some updated phone_number"
      assert user.photo_url == "some updated photo_url"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)

      # Create a struct for comparison that matches what the DB will return
      # by setting the virtual password field to nil.
      user_from_db = Accounts.get_user!(user.id)
      user_from_fixture_with_nil_password = %{user | password: nil}

      # Now this assertion should pass, but it's better to be more explicit.
      # Let's compare the reloaded user from the DB with the original one
      # after we've nulled out the virtual password.
      reloaded_user = Accounts.get_user!(user.id)
      assert %{user | password: nil} == reloaded_user
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end
end