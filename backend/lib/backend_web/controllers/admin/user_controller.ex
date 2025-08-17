defmodule BackendWeb.Admin.UserController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias BackendWeb.Admin.UserXML
  alias BackendWeb.UserJSON
  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, UserJSON, :index, users: users)
  end

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user_for_admin!(id)
    render(conn, UserJSON, :show, user: user)
  end

  def update_role(conn, %{"id" => id, "user" => %{"role" => role}}) do
    user = Accounts.get_user!(id)

    with {:ok, updated_user} <- Accounts.update_user_role(user, role) do
      render(conn, UserJSON, :show, user: updated_user)
    end
  end

  def export(conn, params) do
    # "user_ids" might be missing (for all users) or a list of IDs.
    user_ids = Map.get(params, "user_ids")
    format = Map.get(params, "format", "json")

    users = Accounts.get_users_for_export(user_ids)

    case format do
      "json" ->
        render(conn, UserJSON, :index, users: users)

      "xml" ->
        conn
        |> put_resp_content_type("application/xml")
        |> send_resp(200, UserXML.export(%{users: users}))

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{errors: %{detail: "Invalid format specified. Use 'json' or 'xml'."}})
    end
  end
end
