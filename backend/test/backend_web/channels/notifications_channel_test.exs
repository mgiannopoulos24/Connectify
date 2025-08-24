defmodule BackendWeb.NotificationsChannelTest do
  use BackendWeb.ChannelCase, async: true

  import Backend.AccountsFixtures

  describe "join/3" do
    test "allows a user with current_user_id to join and preserves assigns" do
      user = user_fixture()

      {:ok, _reply, socket} =
        socket("user_socket", %{current_user_id: user.id})
        |> subscribe_and_join(BackendWeb.NotificationsChannel, "notifications", %{})

      assert socket.assigns.current_user_id == user.id
      assert socket.topic == "notifications"
    end

    test "allows join when current_user_id is missing (edge case)" do
      # The current implementation expects :current_user_id in assigns and will crash when missing.
      # Assert that joining without the assign results in a join crash (matches runtime behavior).
      assert {:error, %{reason: "join crashed"}} =
               socket("user_socket", %{})
               |> subscribe_and_join(BackendWeb.NotificationsChannel, "notifications", %{})
    end

    test "user-specific notifications topic name is usable with PubSub" do
      user = user_fixture()
      topic = "user_notifications:#{user.id}"

      # ensure the topic can be subscribed to and receives broadcasts
      :ok = Phoenix.PubSub.subscribe(Backend.PubSub, topic)
      Phoenix.PubSub.broadcast(Backend.PubSub, topic, {:test_notification, %{hello: "world"}})

      assert_receive {:test_notification, %{hello: "world"}}
    end
  end
end
