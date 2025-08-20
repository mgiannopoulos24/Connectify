defmodule BackendWeb.CompanyController do
  use BackendWeb, :controller

  alias Backend.Companies
  alias Backend.Interests
  alias BackendWeb.CompanyJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, %{"search" => search_term}) do
    companies = Companies.search_companies(search_term)

    conn
    |> put_view(CompanyJSON)
    |> render("search.json", companies: companies)
  end

  def show(conn, %{"id" => id}) do
    company = Companies.get_company!(id)
    render(conn, CompanyJSON, :show, company: company)
  end

  def follow(conn, %{"id" => company_id}) do
    current_user = conn.assigns.current_user
    # Ensure company exists before following
    _company = Companies.get_company!(company_id)

    with {:ok, _} <- Interests.follow_entity(current_user.id, company_id, "company") do
      send_resp(conn, :no_content, "")
    end
  end

  def unfollow(conn, %{"id" => company_id}) do
    current_user = conn.assigns.current_user
    # Ensure company exists for consistency, though not strictly required for delete
    _company = Companies.get_company!(company_id)

    with {:ok, _} <- Interests.unfollow_entity(current_user.id, company_id, "company") do
      send_resp(conn, :no_content, "")
    end
  end
end
