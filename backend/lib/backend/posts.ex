defmodule Backend.Posts do
  @moduledoc """
  The Posts context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  alias Backend.Notifications

  @doc """
  Returns a list of all posts, with user, reactions and comments preloaded.
  """
  def list_posts do
    Post
    |> order_by(desc: :inserted_at)
    |> preload(user: [], comments: [:user], reactions: [:user])
    |> Repo.all()
  end

  def get_post!(id) do
    Post
    |> Repo.get!(id)
    |> Repo.preload(user: [], comments: [:user], reactions: [:user])
  end

  def create_post(user, attrs \\ %{}) do
    attrs = Map.put(attrs, "user_id", user.id)

    %Post{}
    |> Post.changeset(attrs)
    |> Repo.insert()
  end

  def update_post(%Post{} = post, attrs) do
    post
    |> Post.changeset(attrs)
    |> Repo.update()
  end

  def delete_post(%Post{} = post) do
    Repo.delete(post)
  end

  @doc """
  Adds or updates a reaction on a post.
  """
  def react_to_post(user, post, type) do
    with {:ok, _reaction} <-
           %Reaction{}
           |> Reaction.changeset(%{user_id: user.id, post_id: post.id, type: type})
           |> Repo.insert(
             on_conflict: [set: [type: type, updated_at: DateTime.utc_now()]],
             conflict_target: [:user_id, :post_id]
           ) do
      # Notify the post author, unless they are reacting to their own post
      if post.user_id != user.id do
        Notifications.create_notification(%{
          user_id: post.user_id,
          notifier_id: user.id,
          type: "new_reaction",
          resource_id: post.id,
          resource_type: "post"
        })
      end

      {:ok, post}
    end
  end

  @doc """
  Removes a reaction from a post.
  """
  def remove_reaction(user, post) do
    Repo.delete_all(from(r in Reaction, where: r.user_id == ^user.id and r.post_id == ^post.id))
  end

  @doc """
  Creates a comment on a post.
  """
  def create_comment(user, post, attrs \\ %{}) do
    attrs =
      attrs
      |> Map.put("user_id", user.id)
      |> Map.put("post_id", post.id)

    with {:ok, comment} <- %Comment{} |> Comment.changeset(attrs) |> Repo.insert() do
      # Notify the post author, unless they are commenting on their own post
      if post.user_id != user.id do
        Notifications.create_notification(%{
          user_id: post.user_id,
          notifier_id: user.id,
          type: "new_comment",
          resource_id: post.id,
          resource_type: "post"
        })
      end

      {:ok, comment}
    end
  end
end
