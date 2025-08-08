defmodule BackendWeb.AdminController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias BackendWeb.UserJSON

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, UserJSON, :index, users: users)
  end
end