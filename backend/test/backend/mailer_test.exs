defmodule Backend.MailerTest do
  use Backend.DataCase, async: true

  alias Backend.Mailer
  alias Swoosh.Email
  import Swoosh.TestAssertions

  setup do
    # ensure test adapter mailbox is empty before each test
    cond do
      function_exported?(Swoosh.Test, :reset, 0) ->
        apply(Swoosh.Test, :reset, [])

      function_exported?(Swoosh.Adapters.Test, :deliveries_reset, 0) ->
        apply(Swoosh.Adapters.Test, :deliveries_reset, [])

      true ->
        :ok
    end

    :ok
  end

  test "deliver/1 sends email with text and html bodies" do
    email =
      Email.new()
      |> Email.to("recipient@example.com")
      |> Email.from("sender@example.com")
      |> Email.subject("Hello")
      |> Email.text_body("plain text")
      |> Email.html_body("<p>html</p>")

    assert {:ok, _resp} = Mailer.deliver(email)

    # assert email was recorded by the test adapter
    assert_email_sent(fn sent ->
      Enum.any?(sent.to, fn {_name, addr} -> addr == "recipient@example.com" end) and
        sent.subject == "Hello" and
        sent.text_body == "plain text" and
        sent.html_body == "<p>html</p>"
    end)
  end

  test "multiple deliveries are recorded" do
    e1 =
      Email.new()
      |> Email.to("a@example.com")
      |> Email.from("x@example.com")
      |> Email.subject("A")

    e2 =
      Email.new()
      |> Email.to("b@example.com")
      |> Email.from("x@example.com")
      |> Email.subject("B")

    assert {:ok, _} = Mailer.deliver(e1)
    assert {:ok, _} = Mailer.deliver(e2)

    # use TestAssertions to confirm both emails were sent instead of relying on adapter internals
    assert_email_sent(fn sent -> sent.subject == "A" end)
    assert_email_sent(fn sent -> sent.subject == "B" end)
  end

  test "assert_email_sent/1 fails when no email was delivered (edge case)" do
    email =
      Email.new()
      |> Email.to("missing@example.com")
      |> Email.from("x@example.com")
      |> Email.subject("Missing")

    # mailbox is empty due to setup; asserting sent email should raise
    assert_raise ExUnit.AssertionError, fn ->
      assert_email_sent(email)
    end
  end

  test "deliver/1 supports multiple recipients in a single message" do
    email =
      Email.new()
      |> Email.to(["one@example.com", "two@example.com"])
      |> Email.from("sender@example.com")
      |> Email.subject("Multi")

    assert {:ok, _} = Mailer.deliver(email)

    assert_email_sent(fn sent ->
      Enum.any?(sent.to, fn {_name, addr} -> addr == "one@example.com" end) and
        Enum.any?(sent.to, fn {_name, addr} -> addr == "two@example.com" end)
    end)
  end

  test "deliver/1 preserves custom headers" do
    email =
      Email.new()
      |> Email.to("hdr@example.com")
      |> Email.from("sender@example.com")
      |> Email.subject("WithHeader")
      |> Email.header("X-Custom-Flag", "42")

    assert {:ok, _} = Mailer.deliver(email)

    assert_email_sent(fn sent ->
      Enum.any?(sent.headers, fn {k, v} -> k == "X-Custom-Flag" and v == "42" end)
    end)
  end
end
