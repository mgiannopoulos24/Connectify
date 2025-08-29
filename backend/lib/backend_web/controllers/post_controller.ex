defmodule BackendWeb.PostController do
  use BackendWeb, :controller

  alias Backend.Posts
  alias Backend.Posts.Post
  alias Backend.Posts.Comment
  alias Backend.Repo
  alias BackendWeb.PostJSON
  alias Backend.Chat
  alias BackendWeb.MessageJSON
  require Logger

  action_fallback BackendWeb.FallbackController

  @image_upload_dir "priv/static/uploads/post_images"
  @video_upload_dir "priv/static/uploads/post_videos"

  def index(conn, params) do
    current_user = conn.assigns.current_user
    sort_by = Map.get(params, "sort_by", "relevant")
    posts = Posts.list_posts(current_user, sort_by)
    render(conn, PostJSON, :index, posts: posts, current_user: current_user)
  end

  def create(conn, %{"post" => post_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %Post{} = post} <- Posts.create_post(current_user, post_params) do
      preloaded_post = Posts.get_post!(post.id)

      conn
      |> put_status(:created)
      |> render(PostJSON, :show, post: preloaded_post, current_user: current_user)
    end
  end

  def upload_image(conn, %{"image" => %Plug.Upload{} = image}) do
    case handle_upload(image, @image_upload_dir, "post_images") do
      {:ok, url} ->
        conn |> put_status(:created) |> json(%{data: %{image_url: url}})

      {:error, detail} ->
        conn |> put_status(:internal_server_error) |> json(%{errors: %{detail: detail}})
    end
  end

  def upload_video(conn, %{"video" => %Plug.Upload{} = video}) do
    case handle_upload(video, @video_upload_dir, "post_videos") do
      {:ok, url} ->
        conn |> put_status(:created) |> json(%{data: %{url: url}})

      {:error, detail} ->
        conn |> put_status(:internal_server_error) |> json(%{errors: %{detail: detail}})
    end
  end

  defp handle_upload(file, dir, url_segment) do
    File.mkdir_p!(dir)

    extension = Path.extname(file.filename)
    unique_filename = "#{Ecto.UUID.generate()}#{extension}"
    upload_path = Path.join(dir, unique_filename)

    case File.cp(file.path, upload_path) do
      :ok ->
        file_url = ~p"/uploads/#{url_segment}/#{unique_filename}"
        {:ok, file_url}

      {:error, reason} ->
        Logger.error("Failed to upload file: #{inspect(reason)}")
        {:error, "Failed to save file."}
    end
  end

  def upload_image(conn, _params), do: unprovided_file_error(conn, "Image")
  def upload_video(conn, _params), do: unprovided_file_error(conn, "Video")

  defp unprovided_file_error(conn, file_type) do
    conn
    |> put_status(:bad_request)
    |> json(%{errors: %{detail: "#{file_type} not provided."}})
  end

  def show(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)
    render(conn, PostJSON, :show, post: post, current_user: current_user)
  end

  def view(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    with {:ok, _} <- Posts.track_post_view(current_user, post) do
      send_resp(conn, :no_content, "")
    end
  end

  def update(conn, %{"id" => id, "post" => post_params}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    if post.user_id == current_user.id do
      with {:ok, %Post{} = post} <- Posts.update_post(post, post_params) do
        preloaded_post = Posts.get_post!(post.id)
        render(conn, PostJSON, :show, post: preloaded_post, current_user: current_user)
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    if post.user_id == current_user.id do
      with {:ok, _post} <- Posts.delete_post(post) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def react(conn, %{"id" => id, "type" => type}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    with {:ok, _post} <- Posts.react_to_post(current_user, post, type) do
      updated_post = Posts.get_post!(id)
      render(conn, PostJSON, :show, post: updated_post, current_user: current_user)
    end
  end

  def reactions(conn, %{"id" => id}) do
    reactions = Posts.list_reactions_for_post(id)
    json(conn, PostJSON.reactions_index(%{reactions: reactions}))
  end

  def remove_reaction(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    case Posts.remove_reaction(current_user, post) do
      {:ok, _} ->
        updated_post = Posts.get_post!(id)
        render(conn, PostJSON, :show, post: updated_post, current_user: current_user)

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{errors: %{detail: "Failed to remove reaction: #{inspect(reason)}"}})
    end
  end

  def create_comment(conn, %{"id" => id, "comment" => comment_params}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    with {:ok, comment} <- Posts.create_comment(current_user, post, comment_params) do
      preloaded_comment = Repo.preload(comment, [:user, :reactions, :replies])

      conn
      |> put_status(:created)
      |> json(%{data: PostJSON.comment_data(preloaded_comment, current_user)})
    end
  end

  def react_to_comment(conn, %{"post_id" => post_id, "comment_id" => comment_id, "type" => type}) do
    current_user = conn.assigns.current_user
    comment = Repo.get!(Comment, comment_id)

    with {:ok, _} <- Posts.react_to_comment(current_user, comment, type) do
      updated_post = Posts.get_post!(post_id)
      render(conn, PostJSON, :show, post: updated_post, current_user: current_user)
    end
  end

  def remove_reaction_from_comment(conn, %{"post_id" => post_id, "comment_id" => comment_id}) do
    current_user = conn.assigns.current_user
    comment = Repo.get!(Comment, comment_id)

    with {:ok, _} <- Posts.remove_reaction_from_comment(current_user, comment) do
      updated_post = Posts.get_post!(post_id)
      render(conn, PostJSON, :show, post: updated_post, current_user: current_user)
    end
  end

  def send_post(conn, %{"id" => post_id, "recipient_id" => recipient_id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(post_id)

    with {:ok, message} <- Chat.send_post_as_message(current_user, recipient_id, post) do
      Phoenix.PubSub.broadcast(
        Backend.PubSub,
        "chat:#{message.chat_room_id}",
        {"new_msg", %{message: MessageJSON.data(message)}}
      )

      conn
      |> put_status(:created)
      |> render(MessageJSON, :show, message: message)
    else
      {:error, :not_connected} ->
        conn
        |> put_status(:forbidden)
        |> json(%{errors: %{detail: "You can only send posts to your connections."}})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(BackendWeb.ChangesetJSON, :error, changeset: changeset)
    end
  end
end
