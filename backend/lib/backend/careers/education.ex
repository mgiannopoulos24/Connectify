defmodule Backend.Careers.Education do
  @moduledoc """
  The Education schema represents an educational qualification or experience
  associated with a user in the careers context.
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "educations" do
    field :school_name, :string
    field :degree, :string
    field :field_of_study, :string
    field :start_date, :date
    field :end_date, :date

    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(education, attrs) do
    education
    |> cast(attrs, [:school_name, :degree, :field_of_study, :start_date, :end_date, :user_id])
    |> validate_required([:school_name, :degree, :field_of_study, :user_id])
  end
end
