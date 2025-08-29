defmodule Backend.Notifications do
  @moduledoc """
  The Notifications context.
  """
  import Ecto.Query, warn: false

  alias Backend.Notifications.Notification
  alias Backend.Repo

  def list_user_notifications(user_id) do
    Notification
    |> where(user_id: ^user_id)
    |> order_by(desc: :inserted_at)
    |> preload(:notifier)
    |> Repo.all()
  end

  def create_notification(attrs) do
    with {:ok, notification} <- %Notification{} |> Notification.changeset(attrs) |> Repo.insert() do
      # After creating the notification, broadcast it to the user's channel.
      # We preload the notifier to send a complete payload.
      notification_with_notifier = Repo.preload(notification, :notifier)

      Backend.PubSub
      |> Phoenix.PubSub.broadcast(
        "user_notifications:#{notification.user_id}",
        {:new_notification, notification_with_notifier}
      )

      {:ok, notification}
    end
  end

  def mark_notifications_as_read(user_id, notification_ids) when is_list(notification_ids) do
    from(n in Notification, where: n.user_id == ^user_id and n.id in ^notification_ids)
    |> Repo.update_all(set: [read_at: DateTime.utc_now()])
  end
end
