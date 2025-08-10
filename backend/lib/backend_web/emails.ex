defmodule BackendWeb.Emails do
  import Swoosh.Email

  alias Backend.Accounts.User

  def confirmation_email(%User{} = user, token) do
    # In a real app, you would use a config for the base URL.
    confirmation_url = "https://localhost:5173/confirm-email/#{token}"

    new()
    |> to({user.name, user.email})
    |> from({"Connectify", "noreply@connectify.com"})
    |> subject("Confirm your Connectify Account")
    |> html_body("""
    <h1>Welcome to Connectify, #{user.name}!</h1>
    <p>Please confirm your email address by clicking the link below:</p>
    <a href="#{confirmation_url}">Confirm my email</a>
    <p>If you did not sign up for Connectify, please ignore this email.</p>
    """)
    |> text_body("""
    Welcome to Connectify, #{user.name}!
    Please confirm your email address by visiting this URL: #{confirmation_url}
    If you did not sign up for Connectify, please ignore this email.
    """)
  end
end
