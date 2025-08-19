defmodule BackendWeb.SessionController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Auth
  alias BackendWeb.UserJSON

  def create(conn, %{"identifier" => identifier, "password" => password}) do
    case Accounts.authenticate_user(identifier, password) do
      {:ok, user} ->
        with {:ok, token, _claims} <- Auth.sign_token(user) do
          conn
          # We will still set the secure cookie for regular HTTP requests
          |> put_resp_cookie("auth_token", token,
            http_only: true,
            secure: true,
            same_site: "Lax",
            max_age: Auth.token_lifespan()
          )
          # Also return the user and the token in the JSON body
          |> put_view(UserJSON)
          |> render("show.json", user: user, token: token)
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
