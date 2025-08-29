defmodule BackendWeb.Admin.CompanyJSONTest do
  use Backend.DataCase, async: true

  alias Backend.Companies.Company
  alias BackendWeb.Admin.CompanyJSON
  import Backend.CompaniesFixtures

  describe "index/1" do
    test "renders a list of companies" do
      company1 = company_fixture(%{name: "Company A", description: "Desc A"})
      company2 = company_fixture(%{name: "Company B", logo_url: "logo.png"})

      result = CompanyJSON.index(%{companies: [company1, company2]})

      assert result == %{
               data: [
                 %{
                   id: company1.id,
                   name: "Company A",
                   logo_url: company1.logo_url,
                   description: "Desc A"
                 },
                 %{
                   id: company2.id,
                   name: "Company B",
                   logo_url: "logo.png",
                   description: company2.description
                 }
               ]
             }
    end

    test "renders an empty list when no companies are provided" do
      result = CompanyJSON.index(%{companies: []})
      assert result == %{data: []}
    end
  end

  describe "show/1" do
    test "renders a single company" do
      company = company_fixture(%{name: "Single Co", description: "Details here"})
      result = CompanyJSON.show(%{company: company})

      assert result == %{
               data: %{
                 id: company.id,
                 name: "Single Co",
                 logo_url: company.logo_url,
                 description: "Details here"
               }
             }
    end
  end

  describe "data/1 (edge cases)" do
    test "renders correctly when optional fields are nil" do
      company = company_fixture(%{name: "Minimal Co", logo_url: nil, description: nil})

      result = CompanyJSON.show(%{company: company})

      assert result == %{
               data: %{
                 id: company.id,
                 name: "Minimal Co",
                 logo_url: nil,
                 description: nil
               }
             }
    end

    test "renders correctly with empty strings for optional fields" do
      company =
        company_fixture(%{name: "Empty String Co", logo_url: "", description: ""})

      result = CompanyJSON.show(%{company: company})

      assert result == %{
               data: %{
                 id: company.id,
                 name: "Empty String Co",
                 logo_url: nil,
                 description: nil
               }
             }
    end
  end
end
