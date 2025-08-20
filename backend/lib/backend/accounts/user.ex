defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Skills.Skill
  alias Backend.Interests.Interest
  alias Backend.Connections.Connection
  alias Backend.Chat.ChatRoom
  alias Backend.Posts.Post
  alias Backend.Notifications.Notification

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  # Defines allowed roles
  @roles ["professional", "admin"]
  @statuses ["pending_confirmation", "active", "idle", "offline"]
  @visibilities ["public", "connections_only"]

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
    field :status, :string, default: "pending_confirmation"
    field :last_seen_at, :naive_datetime
    field :profile_visibility, :string, default: "public"

    field :current_password, :string, virtual: true, redact: true

    field :password, :string,
      virtual: true,
      redact: true

    field :password_confirmation, :string, virtual: true, redact: true

    has_many :job_experiences, JobExperience, on_delete: :delete_all
    has_many :educations, Education, on_delete: :delete_all
    has_many :skills, Skill, on_delete: :delete_all
    has_many :interests, Interest, on_delete: :delete_all
    has_many :posts, Post, on_delete: :delete_all
    has_many :notifications, Notification, on_delete: :delete_all

    has_many :sent_connections, Connection, foreign_key: :user_id
    has_many :received_connections, Connection, foreign_key: :connected_user_id

    has_many :chat_rooms_as_user1, ChatRoom, foreign_key: :user1_id
    has_many :chat_rooms_as_user2, ChatRoom, foreign_key: :user2_id

    has_many :job_postings, Backend.Jobs.JobPosting, on_delete: :delete_all
    has_many :job_applications, Backend.Jobs.JobApplication, on_delete: :delete_all

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
      :email_confirmed_at,
      :status,
      :last_seen_at,
      :profile_visibility
    ])
    |> validate_required([:name, :surname, :email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:password, min: 8)
    |> unique_constraint(:email)
    |> validate_inclusion(:status, @statuses)
    |> validate_inclusion(:profile_visibility, @visibilities)
    |> put_password_hash()
  end

  @doc """
  A changeset for updating a user's security settings (email and password).
  It handles validation for email uniqueness and password confirmation.
  """
  def security_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :password, :password_confirmation])
    |> validate_email_if_changed()
    |> validate_password_if_changed(attrs)
  end

  defp validate_email_if_changed(changeset) do
    if get_change(changeset, :email) do
      changeset
      |> validate_required([:email])
      |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/,
        message: "must have the @ sign and no spaces"
      )
      |> unique_constraint(:email)
    else
      changeset
    end
  end

  defp validate_password_if_changed(changeset, attrs) do
    # Only validate password fields if a new password is being provided.
    case Map.get(attrs, "password") do
      nil ->
        changeset

      "" ->
        changeset

      _password ->
        changeset
        |> validate_required([:password, :password_confirmation])
        |> validate_length(:password, min: 8, message: "should be at least 8 character(s)")
        |> validate_confirmation(:password, message: "does not match password")
        |> put_password_hash()
    end
  end

  def role_changeset(user, attrs) do
    user
    |> cast(attrs, [:role])
    |> validate_required([:role])
    |> validate_inclusion(:role, @roles)
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
