defmodule BackendWeb.SessionController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Auth

  def create(conn, %{"identifier" => identifier, "password" => password}) do
    case Accounts.authenticate_user(identifier, password) do
      {:ok, user} ->
        with {:ok, token, _claims} <- Auth.sign_token(user) do
          conn
          |> put_resp_cookie("auth_token", token,
            http_only: true,
            secure: true,
            same_site: "Lax",
            max_age: Auth.token_lifespan()
          )
          |> render(BackendWeb.UserJSON, :show, user: user)
        else
          {:error, reason} ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{errors: %{detail: "Could not sign token: #{reason}"}})
        end

      :error ->
        conn
        |> put_status(:unauthorized)
        |> json(%{errors: %{detail: "Invalid credentials"}})
    end
  end

  def delete(conn, _params) do
    conn
    |> delete_resp_cookie("auth_token")
    |> send_resp(:no_content, "")
  end
end