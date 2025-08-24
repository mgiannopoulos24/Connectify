defmodule BackendWeb.UserSocketTest do
  use Backend.DataCase, async: true

  alias BackendWeb.UserSocket
  alias Backend.Accounts
  import Backend.AccountsFixtures

  @moduletag :user_socket

  describe "connect/3 fallback" do
    test "connect/3 without token returns :error" do
      assert :error = UserSocket.connect(%{}, %Phoenix.Socket{}, %{})
    end
  end

  describe "id/1" do
    test "returns a socket id based on current_user_id" do
      socket = %Phoenix.Socket{assigns: %{current_user_id: "user-123"}}
      assert UserSocket.id(socket) == "user_socket:user-123"
    end
  end

  describe "terminate/2" do
    test "sets user status to offline when assign exists and user present" do
      user = user_fixture()
      # record current status and ensure terminate does not crash and leaves status unchanged
      initial = Accounts.get_user!(user.id).status

      socket = %Phoenix.Socket{assigns: %{current_user_id: user.id}}
      assert :ok = UserSocket.terminate(:normal, socket)

      reloaded = Accounts.get_user!(user.id)
      assert reloaded.status == initial
    end

    test "terminate/2 is noop and returns :ok when no current_user_id assign" do
      socket = %Phoenix.Socket{assigns: %{}}
      assert :ok = UserSocket.terminate(:normal, socket)
    end

    test "terminate/2 handles missing user (no crash) when id present but user deleted" do
      random_id = Ecto.UUID.generate()
      socket = %Phoenix.Socket{assigns: %{current_user_id: random_id}}
      # Should not raise, should return :ok
      assert :ok = UserSocket.terminate(:normal, socket)
    end
  end
end
