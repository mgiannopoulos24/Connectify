defmodule BackendWeb.MessageJSON do
  alias Backend.Chat.Message

  def index(%{messages: messages}) do
    %{data: Enum.map(messages, &data/1)}
  end

  def show(%{message: message}) do
    %{data: data(message)}
  end

  def data(%Message{} = message) do
    %{
      id: message.id,
      content: message.content,
      inserted_at: message.inserted_at,
      user: %{
        id: message.user.id,
        name: message.user.name,
        surname: message.user.surname,
        photo_url: message.user.photo_url
      }
    }
  end
end