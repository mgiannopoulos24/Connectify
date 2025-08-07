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
      assert Accounts.list_users() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      valid_attrs = %{
        name: "some name",
        email: "some email",
        surname: "some surname",
        password_hash: "some password_hash",
        phone_number: "some phone_number",
        photo_url: "some photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.create_user(valid_attrs)
      assert user.name == "some name"
      assert user.email == "some email"
      assert user.surname == "some surname"
      assert user.password_hash == "some password_hash"
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
        email: "some updated email",
        surname: "some updated surname",
        password_hash: "some updated password_hash",
        phone_number: "some updated phone_number",
        photo_url: "some updated photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.update_user(user, update_attrs)
      assert user.name == "some updated name"
      assert user.email == "some updated email"
      assert user.surname == "some updated surname"
      assert user.password_hash == "some updated password_hash"
      assert user.phone_number == "some updated phone_number"
      assert user.photo_url == "some updated photo_url"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)
      assert user == Accounts.get_user!(user.id)
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
