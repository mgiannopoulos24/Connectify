defmodule Backend.Posts.Post do
  use Ecto.Schema
  import Ecto.Changeset

  alias Backend.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "posts" do
    field :content, :string
    field :image_url, :string
    field :link_url, :string
    field :video_url, :string
    # --- NEW: Virtual fields for timeline scoring ---
    field :score, :float, virtual: true
    field :views_count, :integer, virtual: true

    belongs_to :user, User
    has_many :reactions, Backend.Posts.Reaction, on_delete: :delete_all
    has_many :comments, Backend.Posts.Comment, on_delete: :delete_all
    # --- NEW: Association for views ---
    has_many :views, Backend.Posts.PostView, on_delete: :delete_all

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:content, :image_url, :link_url, :video_url, :user_id])
    |> validate_required([:user_id])
    |> validate_link_url()
    |> validate_at_least_one_field()
  end

  defp validate_link_url(changeset) do
    case get_field(changeset, :link_url) do
      nil ->
        changeset

      link_url ->
        if URI.parse(link_url).scheme in ["http", "https"] do
          changeset
        else
          add_error(changeset, :link_url, "must be a valid URL")
        end
    end
  end

  defp validate_at_least_one_field(changeset) do
    content = get_field(changeset, :content)
    image_url = get_field(changeset, :image_url)
    link_url = get_field(changeset, :link_url)
    video_url = get_field(changeset, :video_url)

    if (is_nil(content) || content == "") && is_nil(image_url) && is_nil(link_url) &&
         is_nil(video_url) do
      add_error(changeset, :base, "Post must have content, an image, a video, or a link.")
    else
      changeset
    end
  end
end