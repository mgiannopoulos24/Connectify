defmodule BackendWeb.PostJSON do
  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  alias Backend.Accounts.User

  def index(%{posts: posts}) do
    %{data: Enum.map(posts, &data/1)}
  end

  def show(%{post: post}) do
    %{data: data(post)}
  end

  def data(%Post{} = post) do
    %{
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