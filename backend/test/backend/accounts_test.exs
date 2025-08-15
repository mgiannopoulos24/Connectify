defmodule Backend.AccountsTest do
  use Backend.DataCase

  alias Backend.Accounts
  alias Backend.Accounts.User

  import Backend.AccountsFixtures

  describe "users" do
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
      listed_users = Accounts.list_users()

      assert length(listed_users) == 1
      assert hd(listed_users).id == user.id
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      reloaded_user = Accounts.get_user!(user.id)

      assert reloaded_user.id == user.id
      assert reloaded_user.email == user.email
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
      user_before_update = Accounts.get_user!(user.id)

      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)

      user_after_update = Accounts.get_user!(user.id)

      assert user_before_update == user_after_update
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

  # --- ΝΕΑ ΕΝΟΤΗΤΑ ΓΙΑ EDGE CASES ---
  describe "users edge cases" do
    test "cannot create user with a duplicate email" do
      existing_user = user_fixture()

      attrs = %{
        name: "Another Name",
        surname: "Another Surname",
        password: "password123",
        # Χρήση του ίδιου email
        email: existing_user.email
      }

      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.create_user(attrs)
      assert "has already been taken" in errors_on(changeset).email
    end

    test "cannot update user's email to an already existing email" do
      user1 = user_fixture()
      user2 = user_fixture()

      update_attrs = %{email: user1.email}

      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.update_user(user2, update_attrs)
      assert "has already been taken" in errors_on(changeset).email
    end

    test "authenticate_user/2 fails for correct email but wrong password" do
      user = user_fixture(%{password: "correct_password"})
      assert :error = Accounts.authenticate_user(user.email, "wrong_password")
    end

    test "authenticate_user/2 is case-sensitive for email" do
      user = user_fixture(%{email: "my.email@example.com", password: "password123"})

      # Η Repo.get_by είναι case-sensitive από προεπιλογή, οπότε αυτό πρέπει να αποτύχει
      assert :error = Accounts.authenticate_user("My.Email@example.com", "password123")
      # Επιβεβαίωση ότι με το σωστό email λειτουργεί
      assert {:ok, _user} = Accounts.authenticate_user("my.email@example.com", "password123")
    end

    test "confirm_user_email/1 fails for an invalid token" do
      assert {:error, :not_found} = Accounts.confirm_user_email("this-is-a-bad-token")
    end

    test "confirm_user_email/1 fails if token is used twice" do
      # H user_fixture καλεί την create_user, η οποία στέλνει το email
      # και αποθηκεύει το token στη βάση. Πρέπει να το ανακτήσουμε.
      user_from_fixture = user_fixture()
      user_from_db = Accounts.get_user!(user_from_fixture.id)
      token = user_from_db.email_confirmation_token

      # Πρώτη, επιτυχημένη προσπάθεια
      assert {:ok, %User{email_confirmed_at: confirmed_at}} = Accounts.confirm_user_email(token)
      assert not is_nil(confirmed_at)

      # Δεύτερη, αποτυχημένη προσπάθεια (το token έχει γίνει nil)
      assert {:error, :not_found} = Accounts.confirm_user_email(token)
    end

    test "update_user_role/2 returns an error for an invalid role" do
      user = user_fixture()

      assert {:error, %Ecto.Changeset{} = changeset} =
               Accounts.update_user_role(user, "not_a_real_role")

      assert errors_on(changeset).role == ["is invalid"]
    end
  end
end
