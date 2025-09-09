defmodule BackendWeb.Admin.CompanyControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Companies
  alias Backend.Repo
  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    # Set the 'cookie' request header to simulate a logged-in user.
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    admin_user =
      user_fixture(%{
        role: "admin",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    professional_user =
      user_fixture(%{
        role: "professional",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    %{
      admin_user: admin_user,
      professional_user: professional_user,
      admin_conn: login_user(build_conn(), admin_user),
      prof_conn: login_user(build_conn(), professional_user)
    }
  end

  describe "index" do
    test "lists all companies for an admin", %{admin_conn: conn} do
      company = company_fixture()
      conn = get(conn, ~p"/api/admin/companies")

      assert json_response(conn, 200)["data"] == [
               %{
                 "id" => company.id,
                 "name" => company.name,
                 "logo_url" => company.logo_url,
                 "description" => company.description
               }
             ]
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/companies")

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end

    test "returns 401 unauthorized for a logged-out user" do
      conn = get(build_conn(), ~p"/api/admin/companies")

      assert json_response(conn, 401)["errors"]["detail"] ==
               "Authentication required"
    end
  end

  describe "show" do
    test "shows a specific company for an admin", %{admin_conn: conn} do
      company = company_fixture()
      conn = get(conn, ~p"/api/admin/companies/#{company}")

      assert json_response(conn, 200)["data"] == %{
               "id" => company.id,
               "name" => company.name,
               "logo_url" => company.logo_url,
               "description" => company.description
             }
    end

    test "returns 404 for a non-existent company ID", %{admin_conn: conn} do
      non_existent_id = Ecto.UUID.generate()
      conn = get(conn, ~p"/api/admin/companies/#{non_existent_id}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      company = company_fixture()
      conn = get(conn, ~p"/api/admin/companies/#{company}")

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end
  end

  describe "create" do
    @create_attrs %{name: "New Corp", description: "A brand new corporation."}

    test "creates a company for an admin with valid data", %{admin_conn: conn} do
      conn = post(conn, ~p"/api/admin/companies", company: @create_attrs)

      assert %{"id" => id} = json_response(conn, 201)["data"]
      assert hd(get_resp_header(conn, "location")) == ~p"/api/admin/companies/#{id}"

      company = Companies.get_company!(id)
      assert company.name == "New Corp"
      assert company.description == "A brand new corporation."
    end

    test "returns 422 for invalid data", %{admin_conn: conn} do
      conn = post(conn, ~p"/api/admin/companies", company: %{name: ""})
      assert json_response(conn, 422)["errors"]["name"] == ["can't be blank"]
    end

    test "returns 422 for duplicate company name", %{admin_conn: conn} do
      company_fixture(%{name: "Duplicate Co"})
      conn = post(conn, ~p"/api/admin/companies", company: %{name: "Duplicate Co"})
      assert json_response(conn, 422)["errors"]["name"]
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      conn = post(conn, ~p"/api/admin/companies", company: @create_attrs)

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end
  end

  describe "update" do
    @update_attrs %{name: "Updated Name", description: "Updated description."}

    test "updates a company for an admin with valid data", %{admin_conn: conn} do
      company = company_fixture()
      conn = put(conn, ~p"/api/admin/companies/#{company}", company: @update_attrs)

      assert %{"id" => id} = json_response(conn, 200)["data"]
      assert id == company.id

      updated_company = Repo.get!(Companies.Company, id)
      assert updated_company.name == "Updated Name"
      assert updated_company.description == "Updated description."
    end

    test "returns 422 for invalid update data", %{admin_conn: conn} do
      company = company_fixture()
      conn = put(conn, ~p"/api/admin/companies/#{company}", company: %{name: ""})
      assert json_response(conn, 422)["errors"]["name"] == ["can't be blank"]
    end

    test "returns 404 for non-existent company ID", %{admin_conn: conn} do
      non_existent_id = Ecto.UUID.generate()
      conn = put(conn, ~p"/api/admin/companies/#{non_existent_id}", company: @update_attrs)
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      company = company_fixture()
      conn = put(conn, ~p"/api/admin/companies/#{company}", company: @update_attrs)

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end
  end

  describe "delete" do
    test "deletes a company for an admin", %{admin_conn: conn} do
      company = company_fixture()
      conn = delete(conn, ~p"/api/admin/companies/#{company}")

      assert response(conn, 204)
      assert_raise Ecto.NoResultsError, fn -> Companies.get_company!(company.id) end
    end

    test "returns 404 for non-existent company ID", %{admin_conn: conn} do
      non_existent_id = Ecto.UUID.generate()
      conn = delete(conn, ~p"/api/admin/companies/#{non_existent_id}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      company = company_fixture()
      conn = delete(conn, ~p"/api/admin/companies/#{company}")

      assert json_response(conn, 403)["errors"]["detail"] ==
               "You are not authorized to access this resource."
    end
  end
end
