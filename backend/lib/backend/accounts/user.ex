defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Skills.Skill
  alias Backend.Interests.Interest
  alias Backend.Connections.Connection
  alias Backend.Chat.ChatRoom

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :email, :string
    field :name, :string
    field :surname, :string
    field :password_hash, :string
    field :phone_number, :string
    field :photo_url, :string
    field :role, :string, default: "professional"
    field :location, :string
    field :onboarding_completed, :boolean, default: false
    field :email_confirmation_token, :string
    field :email_confirmed_at, :naive_datetime

    field :password, :string,
      virtual: true,
      redact: true

    has_many :job_experiences, JobExperience
    has_many :educations, Education
    has_many :skills, Skill
    has_many :interests, Interest

    has_many :sent_connections, Connection, foreign_key: :user_id
    has_many :received_connections, Connection, foreign_key: :connected_user_id

    has_many :chat_rooms_as_user1, ChatRoom, foreign_key: :user1_id
    has_many :chat_rooms_as_user2, ChatRoom, foreign_key: :user2_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [
      :name,
      :surname,
      :email,
      :password,
      :phone_number,
      :photo_url,
      :role,
      :location,
      :onboarding_completed,
      :email_confirmation_token,
      :email_confirmed_at
    ])
    |> validate_required([:name, :surname, :email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:password, min: 8)
    |> unique_constraint(:email)
    |> put_password_hash()
  end

  defp put_password_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Argon2.hash_pwd_salt(password))

      _ ->
        changeset
    end
  end
end