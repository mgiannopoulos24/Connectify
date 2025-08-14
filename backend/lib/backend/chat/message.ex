defmodule Backend.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset
  alias Backend.Accounts.User
  alias Backend.Chat.ChatRoom
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "messages" do
    field :content, :string
    field :image_url, :string
    belongs_to :user, User
    belongs_to :chat_room, ChatRoom

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :image_url, :user_id, :chat_room_id])
    |> validate_required([:user_id, :chat_room_id])
    |> validate_content_or_image()
  end

  defp validate_content_or_image(changeset) do
    content = get_field(changeset, :content)
    image_url = get_field(changeset, :image_url)

    if (is_nil(content) || content == "") && is_nil(image_url) do
      add_error(changeset, :content, "message must have either content or an image")
    else
      changeset
    end
  end
end
