defmodule BackendWeb.Plugs.AuthPlug do
  @moduledoc """
  A plug to verify JWT cookies and assign the current user to the connection.
  """
  import Plug.Conn

  alias Backend.Accounts
  alias Backend.Auth

  def init(opts), do: opts

  def call(conn, _opts) do
    # 1. Fetch cookies and get the JWT from the cookie
    conn = fetch_cookies(conn)

    case Map.get(conn.req_cookies, "auth_token") do
      nil ->
        # No token, continue
        conn

      token when is_binary(token) ->
        # 2. Verify the token and get the user ID
        case Auth.verify_token(token) do
          {:ok, user_id} ->
            # 3. Fetch the user and assign it to the connection
            try do
              user = Accounts.get_user!(user_id)
              assign(conn, :current_user, user)
            rescue
              Ecto.NoResultsError ->
                # User ID in token is valid but user doesn't exist
                conn
            end

          :error ->
            # Invalid or expired token
            conn
        end

      _ ->
        conn
    end
  end
end
