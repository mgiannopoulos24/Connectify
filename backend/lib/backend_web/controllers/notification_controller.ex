defmodule BackendWeb.NotificationController do
  use BackendWeb, :controller

  alias Backend.Notifications
  alias BackendWeb.NotificationJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    notifications = Notifications.list_user_notifications(current_user.id)
    render(conn, NotificationJSON, :index, notifications: notifications)
  end

  def mark_as_read(conn, %{"ids" => ids}) do
    current_user = conn.assigns.current_user
    Notifications.mark_notifications_as_read(current_user.id, ids)
    send_resp(conn, :no_content, "")
  end
end
