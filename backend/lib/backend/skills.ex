defmodule Backend.Skills do
  @moduledoc """
  The Skills context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Skills.Skill

  def create_skill(attrs \\ %{}) do
    %Skill{}
    |> Skill.changeset(attrs)
    |> Repo.insert()
  end
end