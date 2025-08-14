defmodule BackendWeb.Admin.UserController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias BackendWeb.UserJSON
  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, UserJSON, :index, users: users)
  end

  def update_role(conn, %{"id" => id, "user" => %{"role" => role}}) do
    user = Accounts.get_user!(id)

    with {:ok, updated_user} <- Accounts.update_user_role(user, role) do
      render(conn, UserJSON, :show, user: updated_user)
    end
  end
end
