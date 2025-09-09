defmodule Backend.CompaniesFixtures do
  @moduledoc false

  @doc """
  Generate a company fixture.

  Uses Backend.Companies.create_company/1 if available.
  """
  def company_fixture(attrs \\ %{}) do
    attrs =
      Enum.into(attrs, %{
        name: "company_#{System.unique_integer([:positive])}",
        description: "A test company"
      })

    case Backend.Companies.create_company(attrs) do
      {:ok, company} ->
        company

      {:error, %Ecto.Changeset{} = changeset} ->
        raise "Could not create company fixture: #{inspect(changeset.errors)}"

      other ->
        raise "Backend.Companies.create_company/1 returned unexpected value: #{inspect(other)}"
    end
  end
end