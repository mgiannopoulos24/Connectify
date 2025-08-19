defmodule Backend.Accounts.StaleUserJanitorTest do
  use Backend.DataCase, async: true

  alias Backend.Accounts
  alias Backend.Accounts.StaleUserJanitor
  alias Backend.Repo

  describe "StaleUserJanitor" do
    setup do
      # Start the janitor process for this test
      {:ok, janitor_pid} = GenServer.start_link(StaleUserJanitor, %{}, name: :test_janitor)

      # Allow the janitor process to use the SQL sandbox connection owned by the test process
      Ecto.Adapters.SQL.Sandbox.allow(Repo, self(), janitor_pid)

      # Ensure the process is terminated after the test
      on_exit(fn ->
        if Process.alive?(janitor_pid) do
          GenServer.stop(janitor_pid)
        end
      end)

      :ok
    end

    test "cleanup task deletes users older than 24 hours in pending_confirmation state" do
      # 1. Create a stale user (older than 24 hours)
      stale_user_attrs = %{
        email: "stale@example.com",
        name: "Stale",
        surname: "User",
        status: "pending_confirmation",
        # Set the insertion time to be 25 hours in the past (truncate to seconds for Ecto)
        inserted_at: DateTime.add(DateTime.utc_now(), -25, :hour) |> DateTime.truncate(:second)
      }

      {:ok, stale_user} = Accounts.create_user(stale_user_attrs)
      # Ensure the DB actually has the old inserted_at value (create_user may override timestamps)
      stale_user
      |> Ecto.Changeset.change(
        inserted_at: DateTime.add(DateTime.utc_now(), -25, :hour) |> DateTime.truncate(:second)
      )
      |> Repo.update!()

      assert Repo.get(Accounts.User, stale_user.id) != nil

      # 2. Manually send the :cleanup message to the janitor process
      send(:test_janitor, :cleanup)

      # Give the GenServer a moment to process the message
      Process.sleep(100)

      # 3. Assert that the stale user has been deleted
      assert Repo.get(Accounts.User, stale_user.id) == nil
    end

    test "cleanup task does NOT delete recently created pending users" do
      # 1. Create a "fresh" user (less than 24 hours old)
      fresh_user_attrs = %{
        email: "fresh@example.com",
        name: "Fresh",
        surname: "User",
        status: "pending_confirmation",
        # The default inserted_at is `DateTime.utc_now()`, so this user is fresh
        inserted_at: DateTime.utc_now() |> DateTime.truncate(:second)
      }

      {:ok, fresh_user} = Accounts.create_user(fresh_user_attrs)
      assert Repo.get(Accounts.User, fresh_user.id) != nil

      # 2. Trigger the cleanup
      send(:test_janitor, :cleanup)
      Process.sleep(100)

      # 3. Assert that the fresh user still exists
      assert Repo.get(Accounts.User, fresh_user.id) != nil
    end

    test "cleanup task does NOT delete confirmed users, even if they are old" do
      # 1. Create an old but confirmed user
      confirmed_user_attrs = %{
        email: "confirmed@example.com",
        name: "Confirmed",
        surname: "User",
        # Any status other than 'pending_confirmation'
        status: "offline",
        inserted_at: DateTime.add(DateTime.utc_now(), -48, :hour) |> DateTime.truncate(:second)
      }

      {:ok, confirmed_user} = Accounts.create_user(confirmed_user_attrs)
      # Ensure the DB actually has the old inserted_at value
      confirmed_user
      |> Ecto.Changeset.change(
        inserted_at: DateTime.add(DateTime.utc_now(), -48, :hour) |> DateTime.truncate(:second)
      )
      |> Repo.update!()

      assert Repo.get(Accounts.User, confirmed_user.id) != nil

      # 2. Trigger the cleanup
      send(:test_janitor, :cleanup)
      Process.sleep(100)

      # 3. Assert that the confirmed user still exists
      assert Repo.get(Accounts.User, confirmed_user.id) != nil
    end
  end
end
