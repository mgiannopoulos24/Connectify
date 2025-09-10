defmodule BackendWeb.StatusChannel do
  @moduledoc """
  The StatusChannel manages real-time user status updates using Phoenix Channels.
  It allows users to join the status channel, update their status, and tracks presence.
  """
  use BackendWeb, :channel
  alias Backend.Accounts
  alias BackendWeb.Presence
  require Logger

  def join("status", _payload, socket) do
    current_user_id = socket.assigns.current_user_id
    Logger.info("StatusChannel: User #{current_user_id} joined.")
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_in("status:update", %{"status" => status}, socket) do
    current_user_id = socket.assigns.current_user_id
    user = Accounts.get_user!(current_user_id)

    {:ok, _user} = Accounts.update_user_status(user, status)
    Presence.track(socket, current_user_id, %{status: status})

    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    current_user_id = socket.assigns.current_user_id
    user = Accounts.get_user!(current_user_id)

    # Track the user in Presence
    {:ok, _} =
      Presence.track(socket, current_user_id, %{
        status: user.status
      })

    # Push the current presence state to the client
    push(socket, "presence_state", Presence.list(socket))

    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    if user_id = socket.assigns.current_user_id do
      if user = Accounts.get_user(user_id) do
        Accounts.update_user_status(user, "offline")
      end
    end

    :ok
  end
end
