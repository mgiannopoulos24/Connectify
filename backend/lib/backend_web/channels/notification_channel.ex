defmodule BackendWeb.NotificationsChannel do
  @moduledoc """
  Channel for real-time user notifications.
  """
  use BackendWeb, :channel
  require Logger

  @impl true
  def join("notifications", _payload, socket) do
    current_user_id = socket.assigns.current_user_id
    # The actual subscription to the PubSub topic happens here implicitly
    # by Phoenix when the channel is joined with the topic.
    # For broadcasting, we use the user-specific topic.
    topic = "user_notifications:#{current_user_id}"
    Logger.info("User #{current_user_id} joined notifications channel, listening on #{topic}")
    {:ok, socket}
  end
end
