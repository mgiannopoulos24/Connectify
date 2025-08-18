defmodule BackendWeb.PostJSON do
  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  alias Backend.Accounts.User

  def index(%{posts: posts, current_user: current_user}) do
    %{data: Enum.map(posts, &data(&1, current_user))}
  end

  def index(%{posts: posts}) do
    %{data: Enum.map(posts, &data(&1, nil))}
  end

  def show(%{post: post}) do
    %{data: data(post)}
  end

  def data(%Post{} = post), do: data(post, nil)

  def data(%Post{} = post, current_user \\ nil) do
    base_data = %{
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      link_url: post.link_url,
      inserted_at: post.inserted_at,
      user: user_data(post.user),
      reactions_count: Enum.count(post.reactions),
      comments_count: Enum.count(post.comments),
      reaction_counts: reaction_counts(post.reactions),
      reactions: Enum.map(post.reactions, &reaction_data/1),
      comments: Enum.map(post.comments, &comment_data/1)
    }

    detailed_data = %{
      latest_comment: latest_comment_data(post.comments),
      top_reactions: top_reaction_types(post.reactions),
      last_connection_reaction: last_connection_reaction_data(post.reactions, current_user)
    }

    Map.merge(base_data, detailed_data)
  end

  defp latest_comment_data(comments) do
    comments
    |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
    |> List.first()
    |> case do
      nil -> nil
      comment -> comment_data(comment)
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
    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo_url: user.photo_url
    }
  end

  defp reaction_data(%Reaction{user: user} = reaction) when not is_nil(user) do
    %{
      type: reaction.type,
      user: user_data(user)
    }
  end

  defp reaction_data(%Reaction{} = reaction), do: %{id: reaction.id, type: reaction.type}

  def comment_data(%Comment{} = comment) do
    %{
      id: comment.id,
      content: comment.content,
      inserted_at: comment.inserted_at,
      user: user_data(comment.user)
    }
  end

  defp reaction_counts(reactions) do
    reactions
    |> Enum.group_by(& &1.type)
    |> Enum.map(fn {type, rs} -> {type, Enum.count(rs)} end)
    |> Map.new()
  end
end