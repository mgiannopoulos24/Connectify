defmodule Backend.CareersFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Backend.Careers` and related contexts.
  """

  alias Backend.Careers
  alias Backend.Companies

  @doc """
  Generate a company.
  """
  def company_fixture(attrs \\ %{}) do
    {:ok, company} =
      attrs
      |> Enum.into(%{
        name: "Company #{System.unique_integer([:positive])}"
      })
      |> Companies.create_company()

    company
  end

  @doc """
  Generate a job experience.
  """
  def job_experience_fixture(attrs \\ %{}) do
    # Contexts expect string keys, mirroring controller params. We convert atom keys from tests.
    string_key_attrs = Map.new(attrs, fn {k, v} -> {to_string(k), v} end)

    user_id = string_key_attrs["user_id"] || Backend.AccountsFixtures.user_fixture().id
    company_id = string_key_attrs["company_id"] || company_fixture().id

    defaults = %{
      "job_title" => "Software Engineer",
      "employment_type" => "Full-time",
      "user_id" => user_id,
      "company_id" => company_id
    }

    # Merge the provided attributes into the defaults, so the provided attributes take precedence.
    attrs_to_create = Map.merge(defaults, string_key_attrs)

    # The fixture should raise if creation fails, indicating a setup issue.
    {:ok, job_experience} = Careers.create_job_experience(attrs_to_create)

    job_experience
  end
end
