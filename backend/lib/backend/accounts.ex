defmodule Backend.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Mailer
  alias BackendWeb.Emails
  require Logger

  alias Backend.Accounts.User

  defp preload_profile(user) do
    if user do
      Repo.preload(user, [
        :educations,
        :skills,
        :interests,
        :sent_connections,
        :received_connections,
        job_experiences: :company
      ])
    else
      nil
    end
  end

  defp preload_for_admin(user) do
    if user do
      user
      |> Repo.preload([
        :educations,
        :skills,
        :interests,
        :sent_connections,
        :received_connections,
        job_experiences: :company,
        posts: [user: [], comments: [:user], reactions: [:user]]
      ])
    else
      nil
    end
  end

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    User
    |> Repo.all()
    |> Enum.map(&preload_profile/1)
  end

  @doc """
  Gets a single user by id, returns nil if not found.
  """
  def get_user(id) do
    User
    |> Repo.get(id)
    |> preload_profile()
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id) do
    User
    |> Repo.get!(id)
    |> preload_profile()
  end

  @doc """
  Gets a single user with all related data for the admin panel.

  Raises `Ecto.NoResultsError` if the User does not exist.
  """
  def get_user_for_admin!(id) do
    User
    |> Repo.get!(id)
    |> preload_for_admin()
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    Repo.transaction(fn ->
      with {:ok, %User{} = user} <- insert_user(attrs),
           {:ok, _} <- deliver_confirmation_instructions(user) do
        user
      else
        error ->
          Repo.rollback(error)
      end
    end)
    |> case do
      {:ok, user} -> {:ok, preload_profile(user)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp insert_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end


  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, updated_user} -> {:ok, preload_profile(updated_user)}
      error -> error
    end
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  @doc """
  Updates a user's role. Intended for admin use.
  """
  def update_user_role(%User{} = user, new_role) do
    user
    |> User.role_changeset(%{"role" => new_role})
    |> Repo.update()
    |> case do
      {:ok, updated_user} -> {:ok, preload_profile(updated_user)}
      error -> error
    end
  end

  @doc """
  Updates a user's status and last_seen_at timestamp.
  """
  def update_user_status(%User{} = user, new_status) do
    user
    |> User.changeset(%{
      "status" => new_status,
      "last_seen_at" => NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    })
    |> Repo.update()
  end

  @doc """
  Authenticates a user by identifier (currently email) and password.

  ## Examples

      iex> authenticate_user("foo@example.com", "valid_password")
      {:ok, %User{}}

      iex> authenticate_user("foo@example.com", "invalid_password")
      :error
  """
  def authenticate_user(identifier, password) do
    with %User{} = user <- get_user_by_email(identifier),
         true <- Argon2.verify_pass(password, user.password_hash) do
      {:ok, preload_profile(user)}
    else
      _ -> :error
    end
  end

  @doc """
  Gets a single user by email.
  """
  def get_user_by_email(email) do
    User
    |> Repo.get_by(email: email)
    |> preload_profile()
  end

  @doc """
  Generates a confirmation token and sends the confirmation email.
  This is typically called after a user is created.
  """
  def deliver_confirmation_instructions(%User{} = user) do
    token = Integer.to_string(:rand.uniform(899_999) + 100_000)
    changeset = Ecto.Changeset.change(user, email_confirmation_token: token)

    with {:ok, updated_user} <- Repo.update(changeset) do
      case Mailer.deliver(Emails.confirmation_email(updated_user, token)) do
        :ok ->
          {:ok, updated_user}

        {:ok, _email_data} ->
          {:ok, updated_user}

        {:error, reason} ->
          Logger.error("Failed to deliver confirmation email: #{inspect(reason)}")
          {:error, :email_delivery_failed}
      end
    else
      {:error, _changeset} = error ->
        error
    end
  end

  @doc """
  Confirms a user's email address using a token.
  """
  def confirm_user_email(token) do
    case Repo.get_by(User, email_confirmation_token: token) do
      nil ->
        {:error, :not_found}

      user ->
        user
        |> Ecto.Changeset.change(%{
          email_confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second),
          email_confirmation_token: nil
        })
        |> Repo.update()
    end
  end
end