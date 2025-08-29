defmodule BackendWeb.CompanyControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Companies
  alias Backend.Interests
  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    user =
      user_fixture(%{
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    logged_in_conn = login_user(build_conn(), user)
    %{user: user, conn: logged_in_conn}
  end

  describe "GET /api/companies (index/search)" do
    test "returns companies matching the search term", %{conn: conn} do
      unique_prefix = "UniqueSearch#{System.unique_integer()}"
      company1 = company_fixture(%{name: "#{unique_prefix} Inc."})
      _company2 = company_fixture(%{name: "Another Corp"})

      conn = get(conn, ~p"/api/companies?search=#{unique_prefix}")
      response_data = json_response(conn, 200)["data"]

      assert length(response_data) == 1
      assert hd(response_data)["id"] == company1.id
      assert hd(response_data)["name"] == "#{unique_prefix} Inc."
    end

    test "returns an empty list if no companies match", %{conn: conn} do
      company_fixture(%{name: "Existing Co"})
      conn = get(conn, ~p"/api/companies?search=NonExistent")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "GET /api/companies/:id (show)" do
    test "returns the details for a specific company", %{conn: conn} do
      company = company_fixture(%{name: "Detail Co", description: "Details here"})
      conn = get(conn, ~p"/api/companies/#{company.id}")
      response_data = json_response(conn, 200)["data"]

      assert response_data["id"] == company.id
      assert response_data["name"] == "Detail Co"
      assert response_data["description"] == "Details here"
      assert response_data["followers_count"] == 0
    end

    test "returns 404 for a non-existent company ID", %{conn: conn} do
      assert_error_sent :not_found, fn ->
        get(conn, ~p"/api/companies/#{Ecto.UUID.generate()}")
      end
    end
  end

  describe "POST /api/companies/:id/follow" do
    test "allows a logged-in user to follow a company", %{conn: conn, user: user} do
      company = company_fixture()
      conn = post(conn, ~p"/api/companies/#{company.id}/follow")

      assert response(conn, 204)
      assert Interests.following?(user.id, company.id, "company")
    end

    test "returns 404 when trying to follow a non-existent company", %{conn: conn} do
      assert_error_sent :not_found, fn ->
        post(conn, ~p"/api/companies/#{Ecto.UUID.generate()}/follow")
      end
    end

    test "returns 401 for an unauthenticated user" do
      conn = build_conn()
      company = company_fixture()
      conn = post(conn, ~p"/api/companies/#{company.id}/follow")
      assert json_response(conn, 401)["errors"]["detail"] == "Authentication required"
    end
  end

  describe "DELETE /api/companies/:id/follow" do
    test "allows a logged-in user to unfollow a company", %{conn: conn, user: user} do
      company = company_fixture()
      # First, follow the company
      Interests.follow_entity(user.id, company.id, "company")
      assert Interests.following?(user.id, company.id, "company")

      # Then, unfollow
      conn = delete(conn, ~p"/api/companies/#{company.id}/follow")

      assert response(conn, 204)
      refute Interests.following?(user.id, company.id, "company")
    end

    test "succeeds even if the user was not following the company", %{conn: conn, user: user} do
      company = company_fixture()
      refute Interests.following?(user.id, company.id, "company")

      conn = delete(conn, ~p"/api/companies/#{company.id}/follow")
      assert response(conn, 204)
    end

    test "returns 404 when trying to unfollow a non-existent company", %{conn: conn} do
      assert_error_sent :not_found, fn ->
        delete(conn, ~p"/api/companies/#{Ecto.UUID.generate()}/follow")
      end
    end
  end
end
