defmodule BackendWeb.CompanyJSON do
  alias Backend.Companies.Company

  def search(%{companies: companies}) do
    %{data: Enum.map(companies, &data/1)}
  end

  defp data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url
    }
  end
end
