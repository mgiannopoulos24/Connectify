defmodule Backend.Careers.JobExperience do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "job_experiences" do
    field :job_title, :string
    field :employment_type, :string
    field :company_name, :string

    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(job_experience, attrs) do
    job_experience
    |> cast(attrs, [:job_title, :employment_type, :company_name, :user_id])
    |> validate_required([:job_title, :employment_type, :company_name, :user_id])
  end
end
