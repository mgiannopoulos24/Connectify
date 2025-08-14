defmodule BackendWeb.Plugs.EnsureAdminPlug do
  @moduledoc """
  This plug ensures that the current user has the 'admin' role.
  If not, it halts the connection with a 403 Forbidden error.
  It assumes that `BackendWeb.Plugs.AuthPlug` has already run.
  """
  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  def init(opts), do: opts

  def call(conn, _opts) do
    # We pattern match on the connection to ensure we have a current_user who is an admin.
    with %{assigns: %{current_user: %{role: "admin"}}} <- conn do
      # If the pattern matches, the user is an admin. We let the connection continue.
      conn
    else
      # If it doesn't match (no user, or user is not an admin), we halt.
      _ ->
        conn
        |> put_status(:forbidden)
        |> json(%{errors: %{detail: "You are not authorized to access this resource."}})
        |> halt()
    end
  end
end
