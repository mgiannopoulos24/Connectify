defmodule BackendWeb.CompanyJSONTest do
  use Backend.DataCase, async: true

  alias Backend.Companies
  alias Backend.Interests
  alias Backend.Jobs
  alias Backend.Repo
  alias BackendWeb.CompanyJSON

  import Backend.AccountsFixtures
  import Backend.CompaniesFixtures

  describe "search/1" do
    test "renders a list of companies for search results" do
      company1 = company_fixture(%{name: "Search Co 1"})
      company2 = company_fixture(%{name: "Search Co 2", logo_url: "logo.png"})

      result = CompanyJSON.search(%{companies: [company1, company2]})

      assert result == %{
               data: [
                 %{
                   "id" => company1.id,
                   "name" => company1.name,
                   "logo_url" => company1.logo_url
                 },
                 %{
                   "id" => company2.id,
                   "name" => company2.name,
                   "logo_url" => "logo.png"
                 }
               ]
             }
    end

    test "renders an empty list when no companies are provided" do
      result = CompanyJSON.search(%{companies: []})
      assert result == %{data: []}
    end
  end

  describe "show/1" do
    test "renders full details for a company with followers and job postings" do
      # Setup
      user = user_fixture()
      company = company_fixture(%{name: "Detail Co"})
      Interests.follow_entity(user.id, company.id, "company")

      {:ok, posting} =
        Jobs.create_job_posting(user, %{
          "title" => "Developer",
          "description" => "Build things.",
          "job_type" => "Full-time",
          "company_id" => company.id
        })

      # Preload the association as the controller would
      company = Companies.get_company!(company.id)

      # Render
      result = CompanyJSON.show(%{company: company})

      # Assert
      assert result == %{
               data: %{
                 "id" => company.id,
                 "name" => "Detail Co",
                 "logo_url" => company.logo_url,
                 "description" => company.description,
                 "followers_count" => 1,
                 "job_postings" => [
                   %{
                     "id" => posting.id,
                     "title" => "Developer",
                     "location" => nil,
                     "job_type" => "Full-time"
                   }
                 ]
               }
             }
    end

    test "renders correctly when job_postings association is not loaded" do
      company = company_fixture()
      # Ensure association is not loaded by fetching directly
      company_not_preloaded = Repo.get!(Companies.Company, company.id)

      result = CompanyJSON.show(%{company: company_not_preloaded})

      # The "job_postings" key should be absent
      refute Map.has_key?(result.data, "job_postings")
      assert result.data["followers_count"] == 0
    end

    test "renders correctly when optional fields are nil" do
      company = company_fixture(%{logo_url: nil, description: nil})
      # Preload empty job postings
      company = Companies.get_company!(company.id)

      result = CompanyJSON.show(%{company: company})

      assert result.data["logo_url"] == nil
      assert result.data["description"] == nil
      assert result.data["job_postings"] == []
    end
  end
end
