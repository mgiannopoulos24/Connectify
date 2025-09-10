defmodule BackendWeb.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.
  """

  use ExUnit.CaseTemplate

  alias Ecto.Adapters.SQL.Sandbox

  using do
    quote do
      # Import conveniences for testing with channels
      use Phoenix.ChannelTest

      # The default endpoint for testing
      @endpoint BackendWeb.Endpoint
    end
  end

  setup tags do
    # Start the SQL sandbox for tests (ensure Backend.Repo is configured)
    pid = Sandbox.start_owner!(Backend.Repo, shared: not tags[:async])

    # Temporarily quiet Logger for the test process (restore on exit)
    original_level = Logger.level()
    Logger.configure(level: :error)

    on_exit(fn ->
      Logger.configure(level: original_level)
      Sandbox.stop_owner(pid)
    end)

    :ok
  end
end
