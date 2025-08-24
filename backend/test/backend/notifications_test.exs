defmodule Backend.NotificationsTest do
  use Backend.DataCase, async: true

  alias Backend.Notifications
  alias Backend.Notifications.Notification
  alias Backend.Repo

  import Backend.AccountsFixtures

  describe "list_user_notifications/1 and create_notification/1" do
    test "create_notification/1 inserts and broadcasts the notification with preloaded notifier" do
      user = user_fixture()
      notifier = user_fixture()

      :ok = Phoenix.PubSub.subscribe(Backend.PubSub, "user_notifications:#{user.id}")

      attrs = %{
        "user_id" => user.id,
        "notifier_id" => notifier.id,
        "type" => "test_notification",
        "resource_id" => Ecto.UUID.generate(),
        "resource_type" => "something"
      }

      assert {:ok, %Notification{} = notif} = Notifications.create_notification(attrs)

      assert_receive {:new_notification, %Notification{} = received}, 1_000
      assert received.id == notif.id
      assert not is_nil(received.notifier)
      assert received.notifier.id == notifier.id
    end

    test "create_notification/1 returns error changeset when attrs are invalid" do
      assert {:error, %Ecto.Changeset{}} = Notifications.create_notification(%{})
    end

    test "list_user_notifications/1 returns only the user's notifications ordered desc by inserted_at" do
      user = user_fixture()
      other = user_fixture()

      {:ok, n1} =
        Notifications.create_notification(%{
          "user_id" => user.id,
          "notifier_id" => other.id,
          "type" => "t1",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "x"
        })

      :timer.sleep(1)

      {:ok, n2} =
        Notifications.create_notification(%{
          "user_id" => user.id,
          "notifier_id" => other.id,
          "type" => "t2",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "y"
        })

      {:ok, _} =
        Notifications.create_notification(%{
          "user_id" => other.id,
          "notifier_id" => user.id,
          "type" => "other",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "z"
        })

      results = Notifications.list_user_notifications(user.id)

      assert Enum.all?(results, fn r -> r.user_id == user.id end)

      if length(results) >= 2 do
        first = Enum.at(results, 0)
        second = Enum.at(results, 1)
        assert DateTime.compare(first.inserted_at, second.inserted_at) in [:gt, :eq]
      end
    end
  end

  describe "mark_notifications_as_read/2" do
    test "marks only the given user's notification ids as read and returns update count" do
      user = user_fixture()
      other = user_fixture()

      {:ok, n1} =
        Notifications.create_notification(%{
          "user_id" => user.id,
          "notifier_id" => other.id,
          "type" => "t1",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "x"
        })

      {:ok, n2} =
        Notifications.create_notification(%{
          "user_id" => other.id,
          "notifier_id" => user.id,
          "type" => "t2",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "y"
        })

      {count, _} = Notifications.mark_notifications_as_read(user.id, [n1.id, n2.id])
      assert count == 1

      reloaded = Repo.get(Notification, n1.id)
      assert not is_nil(reloaded.read_at)

      other_reloaded = Repo.get(Notification, n2.id)
      assert is_nil(other_reloaded.read_at)
    end

    test "mark_notifications_as_read/2 with no matching ids returns {0, _}" do
      user = user_fixture()
      {count, _} = Notifications.mark_notifications_as_read(user.id, [Ecto.UUID.generate()])
      assert count == 0
    end

    test "mark_notifications_as_read/2 with some matching ids marks as read and returns update count" do
      user = user_fixture()
      other = user_fixture()

      {:ok, n1} =
        Notifications.create_notification(%{
          "user_id" => user.id,
          "notifier_id" => other.id,
          "type" => "t1",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "x"
        })

      {:ok, n2} =
        Notifications.create_notification(%{
          "user_id" => other.id,
          "notifier_id" => user.id,
          "type" => "t2",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "y"
        })

      {:ok, n3} =
        Notifications.create_notification(%{
          "user_id" => user.id,
          "notifier_id" => other.id,
          "type" => "t3",
          "resource_id" => Ecto.UUID.generate(),
          "resource_type" => "z"
        })

      {count, _} = Notifications.mark_notifications_as_read(user.id, [n1.id, n2.id, n3.id])
      assert count == 2

      reloaded_n1 = Repo.get(Notification, n1.id)
      assert not is_nil(reloaded_n1.read_at)

      reloaded_n2 = Repo.get(Notification, n2.id)
      assert is_nil(reloaded_n2.read_at)

      reloaded_n3 = Repo.get(Notification, n3.id)
      assert not is_nil(reloaded_n3.read_at)
    end
  end
end
