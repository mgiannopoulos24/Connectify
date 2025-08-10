defmodule Backend.Interests do
  @moduledoc """
  The Interests context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Interests.Interest

  def create_interest(attrs \\ %{}) do
    %Interest{}
    |> Interest.changeset(attrs)
    |> Repo.insert()
  end
end
