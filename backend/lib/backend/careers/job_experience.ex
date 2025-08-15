defmodule Backend.Careers.JobExperience do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Companies.Company

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "job_experiences" do
    field :job_title, :string
    field :employment_type, :string

    belongs_to :user, User
    belongs_to :company, Company

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(job_experience, attrs) do
    job_experience
    |> cast(attrs, [:job_title, :employment_type, :user_id, :company_id])
    |> validate_required([:job_title, :employment_type, :user_id])
  end
end
