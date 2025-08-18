defmodule Backend.CompaniesTest do
  use Backend.DataCase, async: true

  alias Backend.Companies

  describe "companies" do
    test "create_company/1 with valid data creates company" do
      assert {:ok, company} = Companies.create_company(%{name: "Acme Inc"})
      assert company.name == "Acme Inc"
    end

    test "create_company/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Companies.create_company(%{})
    end

    test "list_companies/0 returns companies ordered by name" do
      {:ok, c1} = Companies.create_company(%{name: "Zoo Corp"})
      {:ok, c2} = Companies.create_company(%{name: "Alpha LLC"})

      names = Enum.map(Companies.list_companies(), & &1.name)
      assert names == Enum.sort(names)
      assert Enum.take(names, 2) == [c2.name, c1.name]
    end

    test "get_company!/1 returns the company and raises when not found" do
      {:ok, company} = Companies.create_company(%{name: "FindMe"})
      assert Companies.get_company!(company.id).id == company.id

      assert_raise Ecto.NoResultsError, fn ->
        Companies.get_company!(Ecto.UUID.generate())
      end
    end

    test "update_company/2 with valid data updates the company" do
      {:ok, company} = Companies.create_company(%{name: "OldName"})
      assert {:ok, updated} = Companies.update_company(company, %{name: "NewName"})
      assert updated.name == "NewName"
    end

    test "delete_company/1 deletes the company" do
      {:ok, company} = Companies.create_company(%{name: "ToDelete"})
      assert {:ok, _} = Companies.delete_company(company)
      assert_raise Ecto.NoResultsError, fn -> Companies.get_company!(company.id) end
    end

    test "search_companies/1 returns prefix matches and is limited to 10" do
      prefix = "Pref"
      # create 12 companies with same prefix
      1..12 |> Enum.each(fn i ->
        Companies.create_company(%{name: "#{prefix}#{i}"})
      end)

      results = Companies.search_companies(prefix)
      assert length(results) == 10
      assert Enum.all?(results, fn c -> String.starts_with?(c.name, prefix) end)
    end

    test "search_companies/1 is case-insensitive" do
      {:ok, _} = Companies.create_company(%{name: "CaseCo"})
      results = Companies.search_companies("ca")
      assert Enum.any?(results, fn c -> c.name == "CaseCo" end)
    end

    test "get_or_create_company_by_name/1 returns existing exact-match company" do
      {:ok, company} = Companies.create_company(%{name: "ExactCo"})
      assert {:ok, found} = Companies.get_or_create_company_by_name("ExactCo")
      assert found.id == company.id
    end

    test "get_or_create_company_by_name/1 is case-insensitive and creates when missing" do
      {:ok, company} = Companies.create_company(%{name: "MyCo"})
      assert {:ok, found} = Companies.get_or_create_company_by_name(String.upcase(company.name))
      assert found.id == company.id

      # new name -> created
      new_name = "BrandNewCo"
      assert {:ok, created} = Companies.get_or_create_company_by_name(new_name)
      assert created.name == new_name
    end
  end
end