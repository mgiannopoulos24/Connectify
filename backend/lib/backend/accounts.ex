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
        posts: [user: [], comments: [:user], reactions: [:user]],
        job_postings: [:company, :skills, job_applications: :user]
      ])
    else
      nil
    end
  end

  @doc """
  Searches for users by name or surname for autocomplete.
  Limits results to 10 and excludes the current user.
  """
  def search_users(search_term, current_user_id) when is_binary(search_term) do
    pattern = "%#{search_term}%"

    from(u in User,
      where:
        (ilike(u.name, ^pattern) or ilike(u.surname, ^pattern) or
           ilike(fragment("? || ' ' || ?", u.name, u.surname), ^pattern)) and
          u.id != ^current_user_id,
      limit: 10,
      select: %{id: u.id, name: u.name, surname: u.surname, photo_url: u.photo_url}
    )
    |> Repo.all()
  end

  @doc """
  Gets a single user's profile, filtering fields based on visibility rules.
  Raises `Ecto.NoResultsError` if the User does not exist.
  """
  def get_user_profile!(profile_user_id, current_user) do
    # A user can always see their own full profile.
    if profile_user_id == current_user.id do
      get_user!(profile_user_id)
    else
      # Fetch the full user profile from the database.
      profile_user = get_user!(profile_user_id)

      # Check if the users are connected.
      are_connected = are_users_connected?(current_user.id, profile_user.id, profile_user)

      # If the profile is public or they are connected, return the full profile.
      if profile_user.profile_visibility == "public" or are_connected do
        profile_user
      else
        # Otherwise, return the filtered public version of the profile.
        filter_for_public_view(profile_user)
      end
    end
  end

  @doc """
  Checks if two users have an accepted connection.
  """
  def are_users_connected?(user1_id, user2_id, preloaded_profile_user \\ nil) do
    # Optimization: use preloaded associations if available to avoid a DB query.
    connections =
      if preloaded_profile_user do
        preloaded_profile_user.sent_connections ++ preloaded_profile_user.received_connections
      else
        from(c in Backend.Connections.Connection,
          where:
            ((c.user_id == ^user1_id and c.connected_user_id == ^user2_id) or
               (c.user_id == ^user2_id and c.connected_user_id == ^user1_id)) and
              c.status == "accepted"
        )
        |> Repo.all()
      end

    Enum.any?(connections, &(&1.status == "accepted"))
  end

  defp filter_for_public_view(user) do
    # Create a new User struct, nullifying private fields.
    # This preserves the struct type for consistent handling in JSON views.
    %User{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url,
      location: user.location,
      role: user.role,
      onboarding_completed: user.onboarding_completed,
      # Null out sensitive or connections-only data
      email: nil,
      phone_number: nil,
      email_confirmed_at: nil,
      # Hide real-time status
      status: "offline",
      last_seen_at: nil,
      job_experiences: [],
      educations: [],
      skills: [],
      interests: [],
      sent_connections: [],
      received_connections: [],
      posts: [],
      job_postings: [],
      job_applications: [],
      inserted_at: user.inserted_at,
      updated_at: user.updated_at
    }
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
  Returns a list of users with all their related data for export.
  If user_ids are provided, it fetches only those users.
  If user_ids is nil or empty, it fetches all users.
  """
  def get_users_for_export(user_ids \\ nil) do
    query =
      case user_ids do
        nil ->
          User

        [] ->
          User

        id when is_binary(id) ->
          from(u in User, where: u.id in ^[id])

        ids when is_list(ids) ->
          from(u in User, where: u.id in ^ids)
      end

    query
    |> Repo.all()
    |> Enum.map(&preload_for_admin/1)
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
        {:error, %Ecto.Changeset{} = changeset} ->
          Repo.rollback(changeset)

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
  Updates a user's security settings (email and/or password).
  Requires the current password to authorize any changes.
  """
  def update_security_settings(%User{} = user, attrs) do
    current_password = attrs["current_password"]

    # 1. First, verify the current password provided by the user.
    if current_password && Argon2.verify_pass(current_password, user.password_hash) do
      # 2. If correct, proceed with validating and applying the new settings.
      user
      |> User.security_changeset(attrs)
      |> Repo.update()
    else
      # 3. If the password is nil or incorrect, return an error changeset.
      changeset =
        Ecto.Changeset.change(user)
        |> Ecto.Changeset.add_error(:current_password, "is incorrect")

      {:error, changeset}
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
  Deletes pending users that are older than a day.
  This is intended to be called by a periodic cleanup task.
  """
  def delete_stale_pending_users do
    # Use NaiveDateTime to match the schema timestamps and calculate 24 hours ago.
    cutoff_datetime =
      NaiveDateTime.utc_now()
      |> NaiveDateTime.add(-24 * 60 * 60, :second)
      |> NaiveDateTime.truncate(:second)

    {count, _} =
      from(u in User,
        where:
          u.status == "pending_confirmation" and
            is_nil(u.email_confirmed_at) and
            u.inserted_at < ^cutoff_datetime
      )
      |> Repo.delete_all()

    {:ok, count}
  end

  @doc """
  Cancels a pending registration using a token, deleting the user record.
  """
  def cancel_registration(token) do
    case Repo.get_by(User, email_confirmation_token: token) do
      nil ->
        {:error, :not_found}

      user ->
        if user.status == "pending_confirmation" do
          # It's a pending registration, so we can delete it.
          Repo.delete(user)
        else
          # The user is already confirmed or in some other state. Cannot cancel.
          {:error, :cannot_cancel}
        end
    end
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
    # Prevent promoting unconfirmed users to "active".
    if new_status == "active" and is_nil(user.email_confirmed_at) do
      changeset =
        Ecto.Changeset.change(user)
        |> Ecto.Changeset.add_error(:status, "cannot set active before email confirmation")

      {:error, changeset}
    else
      user
      |> User.changeset(%{
        "status" => new_status,
        "last_seen_at" => NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
      })
      |> Repo.update()
    end
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
        if user.status == "pending_confirmation" do
          user
          |> Ecto.Changeset.change(%{
            email_confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second),
            email_confirmation_token: nil,
            status: "offline"
          })
          |> Repo.update()
        else
          {:error, :already_confirmed}
        end
    end
  end
end