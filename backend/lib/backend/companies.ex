defmodule Backend.Companies do
  @modledoc """
  The Companies context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Companies.Company

  @doc """
  Returns a list of all companies.
  """
  def list_companies do
    Company
    |> order_by([c], asc: c.name)
    |> Repo.all()
  end

  @doc """
  Searches for companies by name for autocomplete functionality.
  Limits results to 10 for performance.
  """
  def search_companies(search_term) when is_binary(search_term) do
    Company
    |> where([c], ilike(c.name, ^"#{search_term}%"))
    |> limit(10)
    |> Repo.all()
  end

  @doc """
  Gets a single company.

  Raises `Ecto.NoResultsError` if the Company does not exist.
  """
  def get_company!(id), do: Repo.get!(Company, id) |> Repo.preload(:job_postings)

  @doc """
  Creates a company.
  """
  def create_company(attrs \\ %{}) do
    %Company{}
    |> Company.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a company.
  """
  def update_company(%Company{} = company, attrs) do
    company
    |> Company.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a company.
  """
  def delete_company(%Company{} = company) do
    Repo.delete(company)
  end

  @doc """
  Finds a company by its name or creates a new one if it doesn't exist.
  """
  def get_or_create_company_by_name(name) do
    # Find by case-insensitive name and return the one with the exact casing if it exists,
    # or the first one found, or create a new one.
    case Repo.get_by(Company, name: name) do
      nil ->
        case Repo.one(from c in Company, where: ilike(c.name, ^name)) do
          nil -> create_company(%{name: name})
          company -> {:ok, company}
        end

      company ->
        {:ok, company}
    end
  end
end
