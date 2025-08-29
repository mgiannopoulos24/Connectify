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
    # --- FIX: Use the new safe function and handle the nil case ---
    case Accounts.get_user_for_admin(id) do
      nil ->
        {:error, :not_found}

      user ->
        render(conn, UserJSON, :show, user: user)
    end
  end

  def update_role(conn, %{"id" => id, "user" => %{"role" => role}}) do
    # --- FIX: Use the existing safe get_user function and handle the nil case ---
    with %Backend.Accounts.User{} = user <- Accounts.get_user(id) do
      with {:ok, updated_user} <- Accounts.update_user_role(user, role) do
        render(conn, UserJSON, :show, user: updated_user)
      end
    else
      nil ->
        {:error, :not_found}
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
