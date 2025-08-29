defmodule BackendWeb.MessageJSON do
  alias Backend.Chat.Message
  alias Backend.Posts.Post
  alias Backend.Chat.MessageReaction

  def index(%{messages: messages}) do
    %{data: Enum.map(messages, &data/1)}
  end

  def show(%{message: message}) do
    %{data: data(message)}
  end

  def data(%Message{} = message) do
    %{
      "id" => message.id,
      "content" => message.content,
      "image_url" => message.image_url,
      "file_url" => message.file_url,
      "file_name" => message.file_name,
      "gif_url" => message.gif_url,
      "inserted_at" => message.inserted_at,
      "user" => %{
        "id" => message.user.id,
        "name" => message.user.name,
        "surname" => message.user.surname,
        "photo_url" => message.user.photo_url
      },
      "post" =>
        if Ecto.assoc_loaded?(message.post) and message.post do
          post_preview_data(message.post)
        else
          nil
        end,
      "reactions" =>
        if Ecto.assoc_loaded?(message.reactions) do
          Enum.map(message.reactions, &reaction_data/1)
        else
          []
        end
    }
  end

  defp reaction_data(%MessageReaction{} = reaction) do
    user_data =
      if Ecto.assoc_loaded?(reaction.user) and reaction.user do
        %{
          "id" => reaction.user.id,
          "name" => reaction.user.name,
          "surname" => reaction.user.surname
        }
      else
        nil
      end

    %{
      "id" => reaction.id,
      "type" => reaction.type,
      "user" => user_data
    }
  end

  @doc """
  Renders a lightweight preview of a post for sharing in messages.
  """
  defp post_preview_data(%Post{} = post) do
    # Safely get author data.
    user_data =
      if Ecto.assoc_loaded?(post.user) and post.user do
        %{
          "id" => post.user.id,
          "name" => post.user.name,
          "surname" => post.user.surname,
          "photo_url" => post.user.photo_url
        }
      else
        nil
      end

    %{
      "id" => post.id,
      # Truncate content to 150 characters for a preview.
      "content" => String.slice(post.content || "", 0, 150),
      "image_url" => post.image_url,
      "video_url" => post.video_url,
      "link_url" => post.link_url,
      "user" => user_data
    }
  end
end
