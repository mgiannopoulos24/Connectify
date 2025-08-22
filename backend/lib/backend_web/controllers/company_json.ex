defmodule BackendWeb.CompanyJSON do
  alias Backend.Companies.Company
  alias Backend.Jobs.JobPosting
  alias Backend.Interests

  def search(%{companies: companies}) do
    %{data: Enum.map(companies, &search_data/1)}
  end

  def show(%{company: company}) do
    %{data: detail_data(company)}
  end

  defp detail_data(%Company{} = company) do
    followers_count = Interests.count_followers_for_entity(company.id, "company")

    base_data = %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      description: company.description,
      followers_count: followers_count
    }

    if Ecto.assoc_loaded?(company.job_postings) do
      Map.put(
        base_data,
        :job_postings,
        Enum.map(company.job_postings, &job_posting_data/1)
      )
    else
      base_data
    end
  end

  defp search_data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name,
      logo_url: company.logo_url
    }
  end

  defp job_posting_data(%JobPosting{} = job_posting) do
    %{
      id: job_posting.id,
      title: job_posting.title,
      location: job_posting.location,
      job_type: job_posting.job_type
    }
  end
end
