defmodule BackendWeb.Emails do
  import Swoosh.Email

  alias Backend.Accounts.User

  def confirmation_email(%User{} = user, token) do
    new()
    |> to({user.name, user.email})
    |> from({"Connectify", "noreply@connectify.com"})
    |> subject("Confirm your Connectify Account")
    |> html_body("""
    <h1>Welcome to Connectify, #{user.name}!</h1>
    <p>Please use the following verification code to confirm your email address:</p>
    <h2>#{token}</h2>
    <p>If you did not sign up for Connectify, please ignore this email.</p>
    """)
    |> text_body("""
    Welcome to Connectify, #{user.name}!
    Please use the following verification code to confirm your email address: #{token}
    If you did not sign up for Connectify, please ignore this email.
    """)
  end
end