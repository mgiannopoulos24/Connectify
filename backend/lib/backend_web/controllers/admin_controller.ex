defmodule BackendWeb.AdminController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias BackendWeb.UserJSON

  def index(conn, _params) do
    users = Accounts.list_users()
    # Use the UserJSON module to render the users in the response.
    json(conn, UserJSON.index(%{users: users}))
  end
end
