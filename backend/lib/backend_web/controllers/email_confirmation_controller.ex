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

      {:error, :already_confirmed} ->
        conn
        |> put_status(:conflict)
        |> json(%{errors: %{detail: "This account has already been confirmed."}})
    end
  end

  def cancel(conn, %{"token" => token}) do
    case Accounts.cancel_registration(token) do
      {:ok, _user} ->
        send_resp(conn, :no_content, "")

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{errors: %{detail: "Invalid or expired cancellation token."}})

      {:error, :cannot_cancel} ->
        conn
        |> put_status(:conflict)
        |> json(%{errors: %{detail: "This registration cannot be cancelled."}})
    end
  end
end
