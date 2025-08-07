defmodule BackendWeb.SessionController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Auth
  alias BackendWeb.ErrorJSON

  def create(conn, %{"email" => email, "password" => password}) do
    case Accounts.authenticate_user(email, password) do
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
            |> render(ErrorJSON, :"500", %{detail: "Could not sign token: #{reason}"})
        end

      :error ->
        conn
        |> put_status(:unauthorized)
        |> render(ErrorJSON, :"401")
    end
  end
end
