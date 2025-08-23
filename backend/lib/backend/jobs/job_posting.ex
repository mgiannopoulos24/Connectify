defmodule Backend.Jobs.JobPosting do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Companies.Company
  alias Backend.Skills.Skill
  alias Backend.Jobs.JobApplication

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @job_types [
    "Full-time",
    "Part-time",
    "Self-employed",
    "Freelance",
    "Contract",
    "Internship",
    "Apprenticeship",
    "Seasonal"
  ]

  schema "job_postings" do
    field :title, :string
    field :description, :string
    field :location, :string
    field :job_type, :string
    field :application_status, :string, virtual: true
    # --- NEW VIRTUAL FIELD ---
    field :relevant_connections, {:array, :map}, virtual: true, default: []

    belongs_to :user, User
    belongs_to :company, Company
    has_many :job_applications, JobApplication, on_delete: :delete_all

    many_to_many :skills, Skill,
      join_through: "job_postings_skills",
      on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(job_posting, attrs) do
    job_posting
    |> cast(attrs, [:title, :description, :location, :job_type, :user_id, :company_id])
    |> validate_required([:title, :description, :job_type, :user_id, :company_id])
    |> validate_inclusion(:job_type, @job_types)
    |> cast_assoc(:skills)
  end
end