defmodule Backend.Interests do
  @moduledoc """
  The Interests context, repurposed for following users and companies.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Interests.Interest
  alias Backend.Accounts.User
  alias Backend.Companies.Company

  @doc """
  Follows an entity (user or company).
  """
  def follow_entity(follower_user_id, followed_id, type) do
    %Interest{}
    |> Interest.changeset(%{
      user_id: follower_user_id,
      followed_id: followed_id,
      type: type
    })
    |> Repo.insert()
  end

  @doc """
  Unfollows an entity.
  """
  def unfollow_entity(follower_user_id, followed_id, type) do
    from(i in Interest,
      where:
        i.user_id == ^follower_user_id and
          i.followed_id == ^followed_id and
          i.type == ^type
    )
    |> Repo.delete_all()
  end

  @doc """
  Retrieves a list of companies that a user follows.
  """
  def list_followed_companies(user_id) do
    from(i in Interest,
      where: i.user_id == ^user_id and i.type == "company",
      join: c in Company,
      on: c.id == i.followed_id,
      select: c,
      order_by: [asc: c.name]
    )
    |> Repo.all()
  end

  @doc """
  Retrieves a list of users that a user follows.
  """
  def list_followed_users(user_id) do
    from(i in Interest,
      where: i.user_id == ^user_id and i.type == "user",
      join: u in User,
      on: u.id == i.followed_id,
      select: u,
      order_by: [asc: u.name]
    )
    |> Repo.all()
  end

  @doc """
  Checks if a user is following a specific entity.
  """
  def following?(follower_user_id, followed_id, type) do
    from(i in Interest,
      where:
        i.user_id == ^follower_user_id and
          i.followed_id == ^followed_id and
          i.type == ^type
    )
    |> Repo.exists?()
  end
end
