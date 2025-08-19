defmodule Backend.Skills do
  @moduledoc """
  The Skills context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Skills.Skill

  @doc """
  Returns a list of all master skills (not assigned to a specific user).
  """
  def list_master_skills do
    from(s in Skill, where: is_nil(s.user_id), order_by: [asc: s.name])
    |> Repo.all()
  end

  @doc """
  Searches for master skills by name for autocomplete functionality.
  Limits results to 10 for performance.
  """
  def search_skills(search_term) when is_binary(search_term) do
    Skill
    |> where([s], is_nil(s.user_id) and ilike(s.name, ^"#{search_term}%"))
    |> limit(10)
    |> Repo.all()
  end

  def get_skill!(id), do: Repo.get!(Skill, id)

  @doc """
  Creates a master skill, intended for admin use.
  It ensures the user_id is nil.
  """
  def create_master_skill(attrs \\ %{}) do
    %Skill{}
    |> Skill.changeset(Map.put(attrs, "user_id", nil))
    |> Repo.insert()
  end

  @doc """
  Adds a skill to a specific user.
  If the skill doesn't exist in the master list, it creates it there first.
  """
  def add_skill_for_user(user, attrs) do
    skill_name = attrs["name"]

    # Use a transaction to ensure both operations succeed or fail together
    Ecto.Multi.new()
    |> Ecto.Multi.run(:ensure_master, fn repo, _ ->
      # Find or create the master skill with a case-insensitive check
      case repo.one(from s in Skill, where: ilike(s.name, ^skill_name) and is_nil(s.user_id)) do
        nil -> create_master_skill(%{"name" => skill_name})
        master_skill -> {:ok, master_skill}
      end
    end)
    |> Ecto.Multi.insert(:user_skill, fn _ ->
      # Now, create the user's specific skill record.
      # The unique constraint will prevent duplicates for the same user.
      %Skill{}
      |> Skill.changeset(Map.put(attrs, "user_id", user.id))
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{user_skill: user_skill}} ->
        {:ok, user_skill}

      # This case handles when the user tries to add a skill they already have.
      # We treat it as a success and return the existing skill.
      {:error, :user_skill, %Ecto.Changeset{errors: [user_skill_unique_index: _]} = _changeset, _} ->
        {:ok, Repo.get_by!(Skill, name: skill_name, user_id: user.id)}

      {:error, :user_skill, changeset, _} ->
        {:error, changeset}

      {:error, _, reason, _} ->
        {:error, reason}
    end
  end

  def update_skill(%Skill{} = skill, attrs) do
    skill
    |> Skill.changeset(attrs)
    |> Repo.update()
  end

  def delete_skill(%Skill{} = skill) do
    Repo.delete(skill)
  end
end
