defmodule BackendWeb.CompanyController do
  use BackendWeb, :controller

  alias Backend.Companies
  alias BackendWeb.CompanyJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, %{"search" => search_term}) do
    companies = Companies.search_companies(search_term)
    render(conn, CompanyJSON, :search, companies: companies)
  end
end
