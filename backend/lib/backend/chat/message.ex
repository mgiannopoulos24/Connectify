defmodule Backend.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset
  alias Backend.Accounts.User
  alias Backend.Chat.ChatRoom
  alias Backend.Posts.Post
  alias Backend.Chat.MessageReaction

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "messages" do
    field :content, :string
    field :image_url, :string
    belongs_to :user, User
    belongs_to :chat_room, ChatRoom
    belongs_to :post, Post
    has_many :reactions, MessageReaction, on_delete: :delete_all

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :image_url, :user_id, :chat_room_id, :post_id])
    |> validate_required([:user_id, :chat_room_id])
    |> validate_content_or_image_or_post()
  end

  defp validate_content_or_image_or_post(changeset) do
    content = get_field(changeset, :content)
    image_url = get_field(changeset, :image_url)
    post_id = get_field(changeset, :post_id)

    if (is_nil(content) || content == "") && is_nil(image_url) && is_nil(post_id) do
      add_error(changeset, :base, "Message must have content, an image, or a shared post.")
    else
      changeset
    end
  end
end