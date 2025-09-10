defmodule Backend.Skills do
  @moduledoc """
  The Skills context.
  """
  import Ecto.Query, warn: false

  alias Backend.Accounts.User
  alias Backend.Repo
  alias Backend.Skills.Skill

  def list_master_skills do
    from(s in Skill, order_by: [asc: s.name])
    |> Repo.all()
  end

  def search_skills(search_term) when is_binary(search_term) do
    Skill
    |> where([s], ilike(s.name, ^"#{search_term}%"))
    |> limit(10)
    |> Repo.all()
  end

  def get_skill!(id), do: Repo.get!(Skill, id)

  def create_master_skill(attrs \\ %{}) do
    %Skill{}
    |> Skill.changeset(attrs)
    |> Repo.insert()
  end

  def add_skill_for_user(user, attrs) do
    skill_name = attrs["name"]
    user = Repo.preload(user, :skills)
    existing_skill_names = Enum.map(user.skills, & &1.name)

    if skill_name in existing_skill_names do
      skill = Enum.find(user.skills, &(&1.name == skill_name))
      {:ok, skill}
    else
      master_skill =
        case Repo.get_by(Skill, name: skill_name) do
          nil ->
            {:ok, skill} = create_master_skill(%{"name" => skill_name})
            skill

          existing ->
            existing
        end

      user
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:skills, [master_skill | user.skills])
      |> Repo.update()
      |> case do
        {:ok, _user} -> {:ok, master_skill}
        {:error, changeset} -> {:error, changeset}
      end
    end
  end

  def update_skill(%Skill{} = skill, attrs) do
    skill
    |> Skill.changeset(attrs)
    |> Repo.update()
  end

  def delete_skill_from_user(%User{} = user, %Skill{} = skill) do
    user
    |> Repo.preload(:skills)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:skills, Enum.reject(user.skills, &(&1.id == skill.id)))
    |> Repo.update()
  end

  def delete_master_skill(%Skill{} = skill) do
    Repo.delete(skill)
  end
end
