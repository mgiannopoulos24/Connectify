defmodule BackendWeb.PostJSON do
  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Accounts.User

  def index(%{posts: posts, current_user: current_user}) do
    %{data: Enum.map(posts, &data(&1, current_user))}
  end

  def index(%{posts: posts}) do
    %{data: Enum.map(posts, &data(&1, nil))}
  end

  def reactions_index(%{reactions: reactions}) do
    %{data: Enum.map(reactions, &reaction_with_user_data/1)}
  end

  def show(%{post: post, current_user: current_user}) do
    %{data: data(post, current_user)}
  end

  def show(%{post: post}) do
    %{data: data(post, nil)}
  end

  def data(%Post{} = post, current_user \\ nil) do
    comments_tree = build_comment_tree(post.comments)

    base_data = %{
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      link_url: post.link_url,
      video_url: post.video_url,
      inserted_at: post.inserted_at,
      user: user_data(post.user),
      reactions_count: Enum.count(post.reactions),
      comments_count: Enum.count(post.comments),
      reaction_counts: reaction_counts(post.reactions),
      reactions: Enum.map(post.reactions, &reaction_data/1),
      comments: Enum.map(comments_tree, &comment_data(&1, current_user))
    }

    detailed_data = %{
      latest_comment: latest_comment_data(post.comments, current_user),
      top_reactions: top_reaction_types(post.reactions),
      last_connection_reaction: last_connection_reaction_data(post.reactions, current_user)
    }

    Map.merge(base_data, detailed_data)
  end

  defp build_comment_tree(comments) do
    grouped = Enum.group_by(comments, & &1.parent_comment_id, & &1)
    add_replies_to_list(Map.get(grouped, nil, []), grouped)
  end

  defp add_replies_to_list(comments, grouped_comments) do
    Enum.map(comments, fn comment ->
      replies = Map.get(grouped_comments, comment.id, [])
      hydrated_replies = add_replies_to_list(replies, grouped_comments)
      Map.put(comment, :replies, hydrated_replies)
    end)
  end

  defp latest_comment_data(comments, current_user) do
    comments
    |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
    |> List.first()
    |> case do
      nil -> nil
      comment -> comment_data(comment, current_user)
    end
  end

  defp top_reaction_types(reactions) do
    reactions
    |> Enum.group_by(& &1.type)
    |> Enum.map(fn {type, rs} -> {type, Enum.count(rs)} end)
    |> Enum.sort_by(fn {_type, count} -> count end, :desc)
    |> Enum.take(3)
    |> Enum.map(fn {type, _count} -> type end)
  end

  defp last_connection_reaction_data(_reactions, nil), do: nil

  defp last_connection_reaction_data(reactions, current_user) do
    connection_ids =
      (current_user.sent_connections ++ current_user.received_connections)
      |> Enum.filter(&(&1.status == "accepted"))
      |> Enum.map(fn conn ->
        if conn.user_id == current_user.id,
          do: conn.connected_user_id,
          else: conn.user_id
      end)
      |> MapSet.new()

    reactions
    |> Enum.filter(fn reaction -> MapSet.member?(connection_ids, reaction.user_id) end)
    |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
    |> List.first()
    |> case do
      nil -> nil
      reaction -> reaction_data(reaction)
    end
  end

  defp user_data(nil), do: nil
  defp user_data(%Ecto.Association.NotLoaded{}), do: nil

  defp user_data(%User{} = user) do
    job_title =
      case user.job_experiences do
        %Ecto.Association.NotLoaded{} -> nil
        nil -> nil
        [] -> nil
        [first | _] when is_map(first) -> Map.get(first, :job_title)
        first when is_map(first) -> Map.get(first, :job_title)
        _ -> nil
      end

    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url,
      job_title: job_title
    }
  end

  defp reaction_data(%Reaction{user: user} = reaction) when not is_nil(user) do
    %{
      type: reaction.type,
      user: user_data(user)
    }
  end

  defp reaction_data(%Reaction{} = reaction), do: %{id: reaction.id, type: reaction.type}

  defp reaction_with_user_data(%Reaction{} = reaction) do
    %{
      type: reaction.type,
      user: user_data(reaction.user)
    }
  end

  # --- MODIFIED: This function now renders reaction data instead of like data ---
  def comment_data(comment, current_user \\ nil) do
    replies_to_render =
      case Map.get(comment, :replies) do
        %Ecto.Association.NotLoaded{} ->
          []

        nil ->
          []

        replies_list when is_list(replies_list) ->
          Enum.map(replies_list, &comment_data(&1, current_user))
      end

    reactions_list =
      case comment.reactions do
        %Ecto.Association.NotLoaded{} -> []
        nil -> []
        reactions -> reactions
      end

    current_user_reaction =
      if current_user do
        Enum.find(reactions_list, &(&1.user_id == current_user.id))
      else
        nil
      end

    %{
      id: comment.id,
      content: comment.content,
      inserted_at: comment.inserted_at,
      user: user_data(comment.user),
      replies: replies_to_render,
      reactions_count: Enum.count(reactions_list),
      reaction_counts: reaction_counts(reactions_list),
      current_user_reaction: if(current_user_reaction, do: current_user_reaction.type, else: nil)
    }
  end

  defp reaction_counts(reactions) do
    reactions
    |> Enum.group_by(& &1.type)
    |> Enum.map(fn {type, rs} -> {type, Enum.count(rs)} end)
    |> Map.new()
  end
end
