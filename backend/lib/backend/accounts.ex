defmodule Backend.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Mailer
  alias BackendWeb.Emails

  alias Backend.Accounts.User

  # FIX: This function now correctly operates on a user struct (or nil)
  # and uses Repo.preload to fetch the associations.
  defp preload_profile(user) do
    if user do
      Repo.preload(user, [:job_experiences, :educations, :skills])
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
    Repo.all(User)
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
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    Repo.transaction(fn ->
      with {:ok, %User{} = user} <-
             %User{}
             |> User.changeset(attrs)
             |> Repo.insert(),
           {:ok, _user} <- deliver_confirmation_instructions(user) do
        # This now correctly calls the fixed preload_profile function
        preload_profile(user)
      else
        error ->
          Repo.rollback(error)
      end
    end)
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
      {:ok, user}
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
    Repo.update(changeset)

    Emails.confirmation_email(user, token)
    |> Mailer.deliver()

    {:ok, user}
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
