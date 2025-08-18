defmodule Backend.AuthTest do
  use ExUnit.Case, async: true
  import ExUnit.CaptureLog

  alias Backend.Auth

  setup do
    # Preserve existing config and set a deterministic secret for tests
    app = :backend
    key = :jwt_secret_key
    original = Application.get_env(app, key)

    Application.put_env(app, key, "test-jwt-secret")

    on_exit(fn ->
      # restore original value (could be nil)
      if original == nil do
        Application.delete_env(app, key)
      else
        Application.put_env(app, key, original)
      end
    end)

    :ok
  end

  test "sign_token/1 returns token and claims and verify_token/1 accepts it" do
    user = %{id: 42}
    assert {:ok, token, claims} = Auth.sign_token(user)
    assert is_binary(token)
    assert claims["sub"] == 42
    assert {:ok, 42} = Auth.verify_token(token)
  end

  test "verify_token/1 returns :error for tampered token" do
    user = %{id: 1}
    {:ok, token, _} = Auth.sign_token(user)

    # Corrupt token by appending an extra char (invalidates signature)
    tampered = token <> "a"

    log =
      capture_log(fn ->
        assert :error = Auth.verify_token(tampered)
      end)

    assert log =~ "JWT verification failed"
  end

  test "verify_token/1 returns :error for expired token" do
    # build an expired token (exp set to now - 10)
    secret = Application.get_env(:backend, :jwt_secret_key)
    signer = Joken.Signer.create("HS256", secret)
    claims = %{"sub" => 7, "exp" => Joken.current_time() - 10}
    {:ok, token, _} = Joken.generate_and_sign(%{}, claims, signer)

    log =
      capture_log(fn ->
        assert :error = Auth.verify_token(token)
      end)

    assert log =~ "expired token"
  end

  test "verify_token/1 returns :error if token was signed with a different secret" do
    # generate token with another secret
    other_signer = Joken.Signer.create("HS256", "other-secret")

    {:ok, token, _} =
      Joken.generate_and_sign(
        %{},
        %{"sub" => 99, "exp" => Joken.current_time() + 60},
        other_signer
      )

    log =
      capture_log(fn ->
        assert :error = Auth.verify_token(token)
      end)

    assert log =~ "JWT verification failed"
  end

  test "verify_token/1 returns :error for non-binary or nil token input" do
    # non-binary guard returns :error early (no log)
    assert :error = Auth.verify_token(nil)
    assert :error = Auth.verify_token(123)
    assert :error = Auth.verify_token(%{})
  end

  test "sign_token/1 handles user without id (sub becomes nil) and verify returns nil subject" do
    # no id key
    user = %{}
    assert {:ok, token, claims} = Auth.sign_token(user)
    assert Map.has_key?(claims, "sub")
    assert claims["sub"] == nil
    assert {:ok, nil} = Auth.verify_token(token)
  end

  test "token_lifespan/0 returns 7 days in seconds" do
    assert Auth.token_lifespan() == 7 * 24 * 60 * 60
  end

  test "verify_token/1 returns :error when token is missing exp claim" do
    secret = Application.get_env(:backend, :jwt_secret_key)
    signer = Joken.Signer.create("HS256", secret)
    {:ok, token, _} = Joken.generate_and_sign(%{}, %{"sub" => 5}, signer)

    log =
      capture_log(fn ->
        assert :error = Auth.verify_token(token)
      end)

    assert log =~ "exp claim missing or invalid"
  end

  test "verify_token/1 returns :error when exp claim is not an integer" do
    secret = Application.get_env(:backend, :jwt_secret_key)
    signer = Joken.Signer.create("HS256", secret)
    {:ok, token, _} = Joken.generate_and_sign(%{}, %{"sub" => 6, "exp" => "not-an-int"}, signer)

    log =
      capture_log(fn ->
        assert :error = Auth.verify_token(token)
      end)

    assert log =~ "exp claim missing or invalid"
  end

  test "sign_token/1 sets exp roughly now + token_lifespan" do
    user = %{id: 10}
    assert {:ok, _token, claims} = Auth.sign_token(user)
    assert is_integer(claims["exp"])

    now = Joken.current_time()
    diff = claims["exp"] - now
    # allow small scheduling/time diffs
    assert diff > 0
    assert abs(diff - Auth.token_lifespan()) <= 5
  end
end
