defmodule Backend.Posts do
  @moduledoc """
  The Posts context.
  """
  import Ecto.Query, warn: false
  alias Backend.Repo

  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  alias Backend.Posts.CommentReaction
  alias Backend.Posts.PostView
  alias Backend.Notifications
  alias Backend.Connections
  alias Backend.Recommendations

  defp preload_all_for_post(query) do
    preload(query, [
      :user,
      reactions: [:user],
      comments: [:user, :reactions, replies: [:user, :reactions]]
    ])
  end

  def list_posts(user, sort_by \\ "relevant") do
    recommended_post_ids =
      Recommendations.get_post_recommendations(user)
      |> Enum.map(& &1.id)
      |> MapSet.new()

    connection_ids =
      Connections.list_user_connections(user.id)
      |> Enum.map(fn conn ->
        if conn.user_id == user.id, do: conn.connected_user_id, else: conn.user_id
      end)
      |> MapSet.new()

    all_posts =
      from(p in Post,
        left_join: pv in assoc(p, :views),
        group_by: p.id,
        order_by: [desc: p.inserted_at],
        preload: [:user, reactions: [:user], comments: [:user]],
        select_merge: %{views_count: count(pv.id)}
      )
      |> Repo.all()

    sorted_posts =
      all_posts
      |> Enum.map(fn post ->
        score = calculate_post_score(post, user, recommended_post_ids, connection_ids)
        Map.put(post, :score, score)
      end)
      |> Enum.sort_by(fn post ->
        case sort_by do
          "recent" ->
            {-DateTime.to_unix(post.inserted_at), -post.score}

          _ ->
            {-post.score, -DateTime.to_unix(post.inserted_at)}
        end
      end)

    post_ids = Enum.map(sorted_posts, & &1.id)

    from(p in Post, where: p.id in ^post_ids)
    |> preload_all_for_post()
    |> Repo.all()
    |> Enum.sort_by(fn post ->
      original_post = Enum.find(sorted_posts, &(&1.id == post.id))

      case sort_by do
        "recent" ->
          {-DateTime.to_unix(post.inserted_at), -original_post.score}

        _ ->
          {-original_post.score, -DateTime.to_unix(post.inserted_at)}
      end
    end)
  end

  defp calculate_post_score(post, _user, recommended_post_ids, connection_ids) do
    w_recommendation = 5.0
    w_network = 4.0
    w_recency = 1.5
    w_popularity = 1.0

    recommendation_score =
      if MapSet.member?(recommended_post_ids, post.id), do: w_recommendation, else: 0

    network_score =
      if MapSet.member?(connection_ids, post.user_id), do: w_network, else: 0

    days_old = DateTime.diff(DateTime.utc_now(), post.inserted_at, :second) / (24 * 3600)
    recency_score = w_recency * :math.exp(-0.1 * days_old)

    popularity_score = w_popularity * :math.log(1 + (post.views_count || 0))

    recommendation_score + network_score + recency_score + popularity_score
  end

  def get_post!(id) do
    Post
    |> Repo.get!(id)
    |> Repo.preload([
      :user,
      reactions: [:user],
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
      if comment.user_id != user.id do
        Notifications.create_notification(%{
          user_id: comment.user_id,
          notifier_id: user.id,
          type: "new_comment_reaction",
          resource_id: comment.post_id,
          resource_type: "post"
        })
      end

      {:ok, comment}
    end
  end

  def remove_reaction_from_comment(user, comment) do
    from(cr in CommentReaction, where: cr.user_id == ^user.id and cr.comment_id == ^comment.id)
    |> Repo.delete_all()

    {:ok, comment}
  end

  def track_post_view(user, post) do
    %PostView{}
    |> PostView.changeset(%{user_id: user.id, post_id: post.id})
    |> Repo.insert(on_conflict: :nothing)
  end
end
