defmodule Backend.Auth do
  @moduledoc """
  Module for handling JWT generation and verification using Joken.
  """
  require Logger

  # 7 days in seconds
  @token_lifespan 7 * 24 * 60 * 60

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
      # Use Map.get so missing :id does not raise
      "sub" => Map.get(user, :id),
      "exp" => Joken.current_time() + token_lifespan()
    }

    # Generate and sign the token using the runtime signer.
    Joken.generate_and_sign(%{}, claims, get_signer())
  end

  @doc """
  Verifies a JWT and extracts the user ID.
  """
  # Return :error for non-binary inputs early to avoid Joken function clause errors
  def verify_token(token) when not is_binary(token), do: :error

  def verify_token(token) do
    with {:ok, claims} <- Joken.verify(token, get_signer()),
         exp when is_integer(exp) <- Map.get(claims, "exp") do
      if exp > Joken.current_time() do
        {:ok, Map.get(claims, "sub")}
      else
        Logger.error("JWT verification failed: expired token")
        :error
      end
    else
      {:error, reason} ->
        Logger.error("JWT verification failed: #{inspect(reason)}")
        :error

      _ ->
        Logger.error("JWT verification failed: exp claim missing or invalid")
        :error
    end
  end

  @doc """
  Returns the token lifespan in seconds. This is still useful for setting the cookie's max_age.
  """
  def token_lifespan, do: @token_lifespan
end
