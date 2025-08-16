defmodule Backend.Companies.Company do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "companies" do
    field :name, :string
    field :logo_url, :string
    field :description, :string

    has_many :job_experiences, Backend.Careers.JobExperience

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(company, attrs) do
    company
    |> cast(attrs, [:name, :logo_url, :description])
    |> validate_required([:name])
    |> unique_constraint(:name, name: :companies_name_case_insensitive_index)
  end
end
