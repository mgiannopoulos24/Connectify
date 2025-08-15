defmodule BackendWeb.NotificationJSON do
  alias Backend.Notifications.Notification
  alias Backend.Accounts.User

  def index(%{notifications: notifications}) do
    %{data: Enum.map(notifications, &data/1)}
  end

  def data(%Notification{} = notification) do
    %{
      id: notification.id,
      type: notification.type,
      read_at: notification.read_at,
      resource_id: notification.resource_id,
      resource_type: notification.resource_type,
      inserted_at: notification.inserted_at,
      notifier: notifier_data(notification.notifier)
    }
  end

  defp notifier_data(%Ecto.Association.NotLoaded{}), do: nil
  defp notifier_data(nil), do: nil

  defp notifier_data(%User{} = notifier) do
    %{
      id: notifier.id,
      name: notifier.name,
      surname: notifier.surname,
      photo_url: notifier.photo_url
    }
  end
end
