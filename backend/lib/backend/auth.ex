defmodule Backend.Auth do
  @moduledoc """
  Module for handling JWT generation and verification using Joken.
  """
  require Logger

  @token_lifespan 7 * 24 * 60 * 60 # 7 days in seconds

  # This private helper function will be called at RUNTIME.
  # This resolves the warning and is the correct way to handle secrets.
  defp get_signer do
    secret = Application.get_env(:backend, :jwt_secret_key)
    Joken.Signer.create("HS256", secret)
  end

  @doc """
  Generates a signed JWT for the given user.
  """
  def sign_token(user) do
    # Create the claims, including the standard "exp" (expiration time) claim.
    claims = %{
      "sub" => user.id,
      "exp" => Joken.current_time() + token_lifespan()
    }

    # Generate and sign the token using the runtime signer.
    Joken.generate_and_sign(%{}, claims, get_signer())
  end

  @doc """
  Verifies a JWT and extracts the user ID.
  """
  def verify_token(token) do
    # Joken v2.6+ expects a Joken.Config struct for validation.
    # We will create a config on-the-fly and add our runtime signer to it.
    config =
      Joken.Config.new() # FIX: Use new() to create a default config struct.
      |> Joken.Config.add_signer(get_signer())

    # Now, we pass the token and the newly created config to verify_and_validate.
    case Joken.verify_and_validate(token, config) do
      {:ok, %{"sub" => user_id}, _claims} ->
        {:ok, user_id}

      {:error, reason} ->
        Logger.error("JWT verification failed: #{inspect(reason)}")
        :error
    end
  end

  @doc """
  Returns the token lifespan in seconds. This is still useful for setting the cookie's max_age.
  """
  def token_lifespan, do: @token_lifespan
end