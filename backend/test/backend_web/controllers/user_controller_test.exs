defmodule BackendWeb.UserControllerTest do
  use BackendWeb.ConnCase, async: true

  import Backend.AccountsFixtures
  alias Backend.Accounts
  alias Backend.Accounts.User
  alias Backend.Auth

  # Use a distinct email for creation tests to avoid conflicts
  @create_attrs %{
    name: "some name",
    surname: "some surname",
    email: "create@example.com",
    phone_number: "1234567890",
    photo_url: "http://example.com/photo.jpg",
    password: "password1234"
  }
  @update_attrs %{
    name: "some updated name",
    surname: "some updated surname",
    email: "update@example.com",
    phone_number: "0987654321",
    photo_url: "http://example.com/photo_updated.jpg"
  }
  @invalid_attrs %{
    name: nil,
    surname: nil,
    email: "not-an-email",
    password: "short"
  }

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "create user (POST /api/register)" do
    test "returns 201 Created and user data when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/register", %{"user" => @create_attrs})

      # Assert status code is Created
      assert conn.status == 201

      # Assert the JSON response body has the correct user data. [4]
      json_body = json_response(conn, 201)
      assert %{"data" => %{"id" => id, "email" => "create@example.com", "name" => "some name"}} =
               json_body

      # Assert the Location header is set correctly
      assert get_resp_header(conn, "location") == ["/api/users/#{id}"]

      # Assert the auth_token cookie is set and is http_only
      assert get_resp_header(conn, "set-cookie") != []
      [cookie | _] = get_resp_header(conn, "set-cookie")
      assert cookie =~ "auth_token="
      assert cookie =~ "HttpOnly"
      assert cookie =~ "Path=/"
      assert cookie =~ "SameSite=Lax"
    end

    test "returns 422 Unprocessable Entity when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/register", %{"user" => @invalid_attrs})

      # Assert status code is Unprocessable Entity
      assert conn.status == 422

      # Assert the JSON response body contains the validation errors
      json_body = json_response(conn, 422)
      assert %{"errors" => %{
        "email" => ["must have the @ sign and no spaces"],
        "name" => ["can't be blank"],
        "surname" => ["can't be blank"],
        "password" => ["should be at least 8 character(s)"]
      }} = json_body
    end
  end

  # Setup block for tests that require an authenticated user. [1, 6]
  describe "authenticated user actions" do
    setup [:create_and_log_in_user]

    test "index lists all users", %{conn: conn} do
      conn = get(conn, ~p"/api/users")
      assert json_response(conn, 200)["data"] != []
    end

    test "show returns the specified user", %{conn: conn, user: user} do
      conn = get(conn, ~p"/api/users/#{user}")
      json_body = json_response(conn, 200)
      assert %{"data" => %{"id" => id, "email" => email}} = json_body
      assert id == user.id
      assert email == user.email
    end

    test "update returns 200 and updated user when data is valid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/api/users/#{user}", %{"user" => @update_attrs})
      assert conn.status == 200
      json_body = json_response(conn, 200)
      assert %{"data" => %{"id" => id, "email" => "update@example.com"}} = json_body
      assert id == user.id
    end

    test "update returns 422 when data is invalid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/api/users/#{user}", %{"user" => @invalid_attrs})
      assert json_response(conn, 422)
      assert conn.status == 422
    end
    
    test "update returns 401 Unauthorized for a different user", %{conn: conn} do
      another_user = user_fixture()
      conn = put(conn, ~p"/api/users/#{another_user}", %{"user" => @update_attrs})
      assert json_response(conn, 401)
      assert conn.status == 401
    end

    test "delete returns 204 No Content for the current user", %{conn: conn, user: user} do
      conn = delete(conn, ~p"/api/users/#{user}")
      assert response(conn, 204) == ""

      # Verify the user is actually deleted
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end
    
    test "delete returns 401 Unauthorized for a different user", %{conn: conn} do
      another_user = user_fixture()
      conn = delete(conn, ~p"/api/users/#{another_user}")
      assert json_response(conn, 401)
      assert conn.status == 401
    end
  end

  # Helper function to create a user and add their auth token to the conn
  defp create_and_log_in_user(context) do
    user = user_fixture()
    {:ok, token, _claims} = Auth.sign_token(user)
    conn = Plug.Conn.put_req_cookie(context.conn, "auth_token", token)
    %{conn: conn, user: user}
  end
end