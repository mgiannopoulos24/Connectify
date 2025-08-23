defmodule Backend.Skills.Skill do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "skills" do
    field :name, :string

    # --- FIX: Replaced belongs_to with many_to_many ---
    many_to_many :users, User, join_through: "users_skills", on_delete: :delete_all
    many_to_many :job_postings, Backend.Jobs.JobPosting, join_through: "job_postings_skills"

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(skill, attrs) do
    skill
    # --- FIX: user_id is removed ---
    |> cast(attrs, [:name])
    |> validate_required([:name])
    # --- FIX: Constraint is now just on the name ---
    |> unique_constraint(:name, name: :skills_name_index)
  end
end