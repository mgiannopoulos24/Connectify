defmodule Backend.Jobs.JobApplication do
  @moduledoc """
  The JobApplication schema, representing a user's application to a job posting.
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User
  alias Backend.Jobs.JobPosting

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @statuses ["submitted", "reviewed", "accepted", "rejected"]

  schema "job_applications" do
    field :status, :string, default: "submitted"
    field :cover_letter, :string

    belongs_to :user, User
    belongs_to :job_posting, JobPosting

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(job_application, attrs) do
    job_application
    |> cast(attrs, [:status, :cover_letter, :user_id, :job_posting_id])
    |> validate_required([:user_id, :job_posting_id])
    |> validate_inclusion(:status, @statuses)
    |> unique_constraint([:user_id, :job_posting_id],
      name: :user_job_posting_unique_application_index,
      message: "You have already applied for this job"
    )
  end
end
