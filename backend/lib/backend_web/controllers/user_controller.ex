defmodule BackendWeb.UserController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Accounts.User
  alias Backend.Auth
  alias BackendWeb.UserJSON

  def me(conn, _params) do
    case conn.assigns[:current_user] do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> render(BackendWeb.ErrorJSON, :"401")

      user ->
        render(conn, UserJSON, :show, user: user)
    end
  end

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, :index, users: users)
  end

  def new(conn, _params) do
    changeset = Accounts.change_user(%User{})
    render(conn, :new, changeset: changeset)
  end

  def create(conn, %{"user" => user_params}) do
    user_params = Map.drop(user_params, ["password_hash"])

    with {:ok, %User{} = user} <- Accounts.create_user(user_params),
         {:ok, token, _claims} <- Auth.sign_token(user) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/#{user}")
      # Set the secure cookie
      |> put_resp_cookie("auth_token", token,
        http_only: true,
        secure: true,
        same_site: "Lax",
        max_age: Auth.token_lifespan()
      )
      # Also return user and token in the body
      |> render(UserJSON, :show, user: user, token: token)
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(BackendWeb.ChangesetJSON, :error, changeset: changeset)

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{errors: %{detail: "Could not sign token: #{inspect(reason)}"}})
    end
  end

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    render(conn, :show, user: user)
  end

  def edit(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    changeset = Accounts.change_user(user)
    render(conn, :edit, user: user, changeset: changeset)
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    # We must ensure the current user is authorized to update this specific user.
    # For a simple API, we'll just check if the ID matches the current user.
    if conn.assigns[:current_user] && conn.assigns[:current_user].id == id do
      user = Accounts.get_user!(id)

      # The user_params should not include password here, unless specifically
      # intended for a password change.

      case Accounts.update_user(user, user_params) do
        {:ok, user} ->
          render(conn, :show, user: user)

        {:error, %Ecto.Changeset{} = changeset} ->
          conn
          |> put_status(:unprocessable_entity)
          |> render(BackendWeb.ChangesetJSON, :error, changeset: changeset)
      end
    else
      conn
      |> put_status(:unauthorized)
      |> render(BackendWeb.ErrorJSON, :"401")
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    {:ok, _user} = Accounts.delete_user(user)

    # Respond with 204 No Content
    send_resp(conn, :no_content, "")
  end
end
