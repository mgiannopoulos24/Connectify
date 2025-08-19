defmodule BackendWeb.CompanyController do
  use BackendWeb, :controller

  alias Backend.Companies
  alias BackendWeb.CompanyJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, %{"search" => search_term}) do
    companies = Companies.search_companies(search_term)

    conn
    |> put_view(CompanyJSON)
    |> render("search.json", companies: companies)
  end
end
