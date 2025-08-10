defmodule BackendWeb.EmailConfirmationController do
  use BackendWeb, :controller

  alias Backend.Accounts

  def create(conn, %{"token" => token}) do
    case Accounts.confirm_user_email(token) do
      {:ok, _user} ->
        send_resp(conn, :ok, "Email confirmed successfully.")

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{errors: %{detail: "Invalid or expired confirmation token."}})
    end
  end
end
