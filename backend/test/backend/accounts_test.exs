defmodule Backend.AccountsTest do
  use Backend.DataCase

  alias Backend.Accounts
  alias Backend.Accounts.User
  alias Backend.Connections.Connection
  alias Backend.Repo

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

  describe "users edge cases" do
    test "cannot create user with a duplicate email" do
      existing_user = user_fixture()

      attrs = %{
        name: "Another Name",
        surname: "Another Surname",
        password: "password123",
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
      _user = user_fixture(%{email: "my.email@example.com", password: "password123"})

      assert :error = Accounts.authenticate_user("My.Email@example.com", "password123")
      assert {:ok, _user} = Accounts.authenticate_user("my.email@example.com", "password123")
    end

    test "confirm_user_email/1 fails for an invalid token" do
      assert {:error, :not_found} = Accounts.confirm_user_email("this-is-a-bad-token")
    end

    test "confirm_user_email/1 fails if token is used twice" do
      user_from_fixture = user_fixture()
      user_from_db = Accounts.get_user!(user_from_fixture.id)
      token = user_from_db.email_confirmation_token

      assert {:ok, %User{email_confirmed_at: confirmed_at}} = Accounts.confirm_user_email(token)
      assert not is_nil(confirmed_at)

      assert {:error, :not_found} = Accounts.confirm_user_email(token)
    end

    test "update_user_role/2 returns an error for an invalid role" do
      user = user_fixture()

      assert {:error, %Ecto.Changeset{} = changeset} =
               Accounts.update_user_role(user, "not_a_real_role")

      assert errors_on(changeset).role == ["is invalid"]
    end

    test "get_users_for_export/1 with nil returns all users" do
      u1 = user_fixture()
      u2 = user_fixture()
      exported = Accounts.get_users_for_export(nil)
      assert Enum.sort(Enum.map(exported, & &1.id)) == Enum.sort([u1.id, u2.id])
    end

    test "get_users_for_export/1 with a list of ids returns only those users" do
      u1 = user_fixture()
      _u2 = user_fixture()
      exported = Accounts.get_users_for_export([u1.id])
      assert Enum.map(exported, & &1.id) == [u1.id]
    end

    test "get_users_for_export/1 accepts a single id as string" do
      u = user_fixture()
      # u.id is already a string (UUID) in recent schemas — pass it directly
      exported = Accounts.get_users_for_export(u.id)
      assert Enum.map(exported, & &1.id) == [u.id]
    end

    test "update_user_status/2 updates status and last_seen_at for a valid status" do
      user = user_fixture()

      # Ensure the user's email is confirmed so we can set status to "active"
      confirmed_user =
        Ecto.Changeset.change(user,
          email_confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
        )
        |> Repo.update!()

      assert {:ok, updated} = Accounts.update_user_status(confirmed_user, "active")
      assert updated.status == "active"
      assert not is_nil(updated.last_seen_at)
    end

    test "update_user_status/2 returns an error changeset for invalid status" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.update_user_status(user, "online")
      assert errors_on(changeset).status == ["is invalid"]
    end

    test "search_users/2 finds users by name and excludes the current user" do
      u_alice = user_fixture(%{name: "Alice", surname: "Johnson", email: "alice@example.com"})
      u_bob = user_fixture(%{name: "Bob", surname: "Smith", email: "bob@example.com"})

      results = Accounts.search_users("Alice", u_bob.id)
      assert Enum.any?(results, &(&1.id == u_alice.id))
      refute Enum.any?(results, &(&1.id == u_bob.id))

      results2 = Accounts.search_users("Alice Johnson", u_bob.id)
      assert Enum.any?(results2, &(&1.id == u_alice.id))
    end

    test "get_user_profile!/2 respects profile_visibility and connections" do
      u1 =
        %User{
          name: "Private",
          surname: "User",
          email: "private@example.com",
          profile_visibility: "connections_only",
          status: "active",
          photo_url: "p.jpg"
        }
        |> Repo.insert!()

      u2 = user_fixture(%{name: "Viewer", email: "viewer@example.com"})

      profile = Accounts.get_user_profile!(u1.id, u2)
      assert profile.email == nil
      assert profile.status == "offline"
      assert profile.photo_url == "p.jpg"

      %Connection{
        user_id: u1.id,
        connected_user_id: u2.id,
        status: "accepted"
      }
      |> Repo.insert!()

      profile_connected = Accounts.get_user_profile!(u1.id, u2)
      assert profile_connected.email == "private@example.com"
      assert profile_connected.status == "active"
    end

    test "delete_stale_pending_users/0 deletes only pending users older than 24h and returns count" do
      old_dt =
        DateTime.add(DateTime.utc_now(), -25 * 3600, :second)
        |> DateTime.truncate(:second)

      recent_dt =
        DateTime.utc_now()
        |> DateTime.truncate(:second)

      old_user =
        %User{
          name: "Old",
          surname: "Pending",
          email: "old_pending@example.com",
          status: "pending_confirmation",
          email_confirmation_token: "oldtoken",
          inserted_at: old_dt,
          updated_at: old_dt
        }
        |> Repo.insert!()

      recent_user =
        %User{
          name: "Recent",
          surname: "Pending",
          email: "recent_pending@example.com",
          status: "pending_confirmation",
          email_confirmation_token: "recenttoken",
          inserted_at: recent_dt,
          updated_at: recent_dt
        }
        |> Repo.insert!()

      assert {:ok, count} = Accounts.delete_stale_pending_users()
      assert count >= 1
      refute Repo.get(User, old_user.id)
      assert Repo.get(User, recent_user.id)
    end

    test "cancel_registration/1 deletes pending registration and rejects non-pending" do
      _pending_user =
        %User{
          name: "ToCancel",
          surname: "User",
          email: "tocancel@example.com",
          status: "pending_confirmation",
          email_confirmation_token: "canceltoken"
        }
        |> Repo.insert!()

      assert {:ok, %User{}} = Accounts.cancel_registration("canceltoken")
      refute Repo.get_by(User, email_confirmation_token: "canceltoken")

      _confirmed_user =
        %User{
          name: "Confirmed",
          surname: "User",
          email: "confirmed@example.com",
          status: "active",
          email_confirmation_token: "cannotcancel"
        }
        |> Repo.insert!()

      assert {:error, :cannot_cancel} = Accounts.cancel_registration("cannotcancel")
      assert Repo.get_by(User, email_confirmation_token: "cannotcancel")
    end
  end
end
