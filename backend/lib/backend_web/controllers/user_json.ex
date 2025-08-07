defmodule BackendWeb.UserJSON do
  alias Backend.Accounts.User

  @doc """
  Renders a list of users.
  """
  def index(%{users: users}) do
    %{data: for(user <- users, do: data(user))}
  end

  @doc """
  Renders a single user.
  """
  def show(%{user: user}) do
    %{data: data(user)}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      role: user.role
    }
  end
end