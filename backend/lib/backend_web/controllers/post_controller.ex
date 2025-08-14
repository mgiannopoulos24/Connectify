defmodule BackendWeb.PostController do
  use BackendWeb, :controller

  alias Backend.Posts
  alias Backend.Posts.Post
  alias BackendWeb.PostJSON

  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    posts = Posts.list_posts()
    render(conn, PostJSON, :index, posts: posts)
  end

  def create(conn, %{"post" => post_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %Post{} = post} <- Posts.create_post(current_user, post_params) do
      preloaded_post = Backend.Repo.preload(post, user: [], comments: [:user], reactions: [:user])

      conn
      |> put_status(:created)
      |> render(PostJSON, :show, post: preloaded_post)
    end
  end

  def show(conn, %{"id" => id}) do
    post = Posts.get_post!(id)
    render(conn, PostJSON, :show, post: post)
  end

  def update(conn, %{"id" => id, "post" => post_params}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    if post.user_id == current_user.id do
      with {:ok, %Post{} = post} <- Posts.update_post(post, post_params) do
        preloaded_post =
          Backend.Repo.preload(post, user: [], comments: [:user], reactions: [:user])

        render(conn, PostJSON, :show, post: preloaded_post)
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

    with {:ok, _reaction} <- Posts.react_to_post(current_user, post, type) do
      updated_post = Posts.get_post!(id)
      render(conn, PostJSON, :show, post: updated_post)
    end
  end

  def remove_reaction(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    case Posts.remove_reaction(current_user, post) do
      {:ok, _} ->
        updated_post = Posts.get_post!(id)
        render(conn, PostJSON, :show, post: updated_post)

      {:error, reason} ->
        # Handle potential errors, though delete_all is unlikely to fail here
        conn
        |> put_status(:internal_server_error)
        |> json(%{errors: %{detail: "Failed to remove reaction: #{inspect(reason)}"}})
    end
  end

  def create_comment(conn, %{"id" => id, "comment" => comment_params}) do
    current_user = conn.assigns.current_user
    post = Posts.get_post!(id)

    with {:ok, comment} <- Posts.create_comment(current_user, post, comment_params) do
      preloaded_comment = Backend.Repo.preload(comment, [:user])

      conn
      |> put_status(:created)
      |> json(%{data: BackendWeb.PostJSON.comment_data(preloaded_comment)})
    end
  end
end
