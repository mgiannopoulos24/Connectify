defmodule BackendWeb.AdminController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias BackendWeb.UserJSON

  def index(conn, _params) do
    users = Accounts.list_users()
    # FIX: Replace the render call with a direct json response.
    # This is more robust for APIs and avoids potential view rendering issues.
    json(conn, UserJSON.index(%{users: users}))
  end
end
