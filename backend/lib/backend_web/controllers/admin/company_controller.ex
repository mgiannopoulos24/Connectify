defmodule BackendWeb.Admin.CompanyController do
  use BackendWeb, :controller

  alias Backend.Companies
  alias Backend.Companies.Company
  alias Backend.Repo
  alias BackendWeb.Admin.CompanyJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    companies = Companies.list_companies()

    conn
    |> put_view(CompanyJSON)
    |> render("index.json", companies: companies)
  end

  def create(conn, %{"company" => company_params}) do
    with {:ok, %Company{} = company} <- Companies.create_company(company_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/admin/companies/#{company}")
      |> put_view(CompanyJSON)
      |> render("show.json", company: company)
    end
  end

  def show(conn, %{"id" => id}) do
    case Repo.get(Company, id) do
      %Company{} = company ->
        company = Repo.preload(company, :job_postings)

        conn
        |> put_view(CompanyJSON)
        |> render("show.json", company: company)

      nil ->
        {:error, :not_found}
    end
  end

  def update(conn, %{"id" => id, "company" => company_params}) do
    case Repo.get(Company, id) do
      %Company{} = company ->
        with {:ok, %Company{} = company} <- Companies.update_company(company, company_params) do
          conn
          |> put_view(CompanyJSON)
          |> render("show.json", company: company)
        end

      nil ->
        {:error, :not_found}
    end
  end

  def delete(conn, %{"id" => id}) do
    case Repo.get(Company, id) do
      %Company{} = company ->
        with {:ok, %Company{}} <- Companies.delete_company(company) do
          send_resp(conn, :no_content, "")
        end

      nil ->
        {:error, :not_found}
    end
  end
end
