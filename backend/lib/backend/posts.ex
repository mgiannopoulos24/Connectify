defmodule Backend.Posts do
  @moduledoc """
  The Posts context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  # --- MODIFIED: Replaced CommentLike with CommentReaction ---
  alias Backend.Posts.CommentReaction
  alias Backend.Notifications
  alias Backend.Connections

  defp preload_all_for_post(query) do
    preload(query, [
      :user,
      reactions: [:user],
      # --- MODIFIED: Preload reactions instead of likes for comments and replies ---
      comments: [:user, :reactions, replies: [:user, :reactions]]
    ])
  end

  def list_posts(user) do
    connection_ids =
      Connections.list_user_connections(user.id)
      |> Enum.map(fn conn ->
        if conn.user_id == user.id, do: conn.connected_user_id, else: conn.user_id
      end)

    author_ids = [user.id | connection_ids]

    from(p in Post,
      left_join: r in assoc(p, :reactions),
      left_join: c in assoc(p, :comments),
      where:
        p.user_id in ^author_ids or r.user_id in ^connection_ids or c.user_id in ^connection_ids,
      distinct: true,
      order_by: [desc: p.inserted_at]
    )
    |> preload_all_for_post()
    |> Repo.all()
  end

  def get_post!(id) do
    Post
    |> Repo.get!(id)
    |> Repo.preload([
      :user,
      reactions: [:user],
      # --- MODIFIED: Preload reactions instead of likes for comments and replies ---
      comments: [:user, :reactions, replies: [:user, :reactions]]
    ])
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

  def react_to_post(user, post, type) do
    with {:ok, _reaction} <-
           %Reaction{}
           |> Reaction.changeset(%{user_id: user.id, post_id: post.id, type: type})
           |> Repo.insert(
             on_conflict: [set: [type: type, updated_at: DateTime.utc_now()]],
             conflict_target: [:user_id, :post_id]
           ) do
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

  def list_reactions_for_post(post_id) do
    from(r in Reaction,
      where: r.post_id == ^post_id,
      preload: [:user],
      order_by: [desc: r.inserted_at]
    )
    |> Repo.all()
  end

  def remove_reaction(user, post) do
    Repo.delete_all(from(r in Reaction, where: r.user_id == ^user.id and r.post_id == ^post.id))
  end

  def create_comment(user, post, attrs \\ %{}) do
    attrs =
      attrs
      |> Map.put("user_id", user.id)
      |> Map.put("post_id", post.id)

    with {:ok, comment} <- %Comment{} |> Comment.changeset(attrs) |> Repo.insert() do
      comment = Repo.preload(comment, :parent_comment)

      if post.user_id != user.id do
        type = if is_nil(comment.parent_comment_id), do: "new_comment", else: "new_reply"

        Notifications.create_notification(%{
          user_id: post.user_id,
          notifier_id: user.id,
          type: type,
          resource_id: post.id,
          resource_type: "post"
        })
      end

      if parent_comment = comment.parent_comment do
        if parent_comment.user_id != post.user_id && parent_comment.user_id != user.id do
          Notifications.create_notification(%{
            user_id: parent_comment.user_id,
            notifier_id: user.id,
            type: "new_reply",
            resource_id: post.id,
            resource_type: "post"
          })
        end
      end

      {:ok, comment}
    end
  end

  # --- NEW FUNCTIONS START HERE ---

  @doc "Reacts to a comment for a given user."
  def react_to_comment(user, comment, type) do
    with {:ok, _reaction} <-
           %CommentReaction{}
           |> CommentReaction.changeset(%{
             user_id: user.id,
             comment_id: comment.id,
             type: type
           })
           |> Repo.insert(
             on_conflict: [set: [type: type, updated_at: DateTime.utc_now()]],
             conflict_target: [:user_id, :comment_id]
           ) do
      # Notify the comment's author, unless they are reacting to their own comment.
      if comment.user_id != user.id do
        Notifications.create_notification(%{
          user_id: comment.user_id,
          notifier_id: user.id,
          type: "new_comment_reaction",
          # Link back to the post
          resource_id: comment.post_id,
          resource_type: "post"
        })
      end

      {:ok, comment}
    end
  end

  @doc "Removes a reaction from a comment for a given user."
  def remove_reaction_from_comment(user, comment) do
    from(cr in CommentReaction, where: cr.user_id == ^user.id and cr.comment_id == ^comment.id)
    |> Repo.delete_all()

    {:ok, comment}
  end
end
