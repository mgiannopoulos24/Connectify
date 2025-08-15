defmodule BackendWeb.Admin.CompanyJSON do
  alias Backend.Companies.Company

  def index(%{companies: companies}) do
    %{data: Enum.map(companies, &data/1)}
  end

  def show(%{company: company}) do
    %{data: data(company)}
  end

  defp data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      description: company.description
    }
  end
end
