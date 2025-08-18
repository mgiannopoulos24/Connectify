defmodule Backend.Accounts.StaleUserJanitor do
  @moduledoc """
  A GenServer that periodically cleans up stale, unconfirmed user accounts.
  """
  use GenServer
  require Logger

  alias Backend.Accounts

  # The cleanup task will run every hour.
  @cleanup_interval :timer.hours(1)

  # --- Client API ---

  @doc """
  Starts the janitor GenServer.
  """
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  # --- GenServer Callbacks ---

  @impl true
  def init(_opts) do
    Logger.info("Starting StaleUserJanitor...")
    # Schedule the first cleanup check to run after the interval.
    schedule_work()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:cleanup, state) do
    Logger.info("StaleUserJanitor: Running cleanup task for unconfirmed users...")

    case Accounts.delete_stale_pending_users() do
      {:ok, count} when count > 0 ->
        Logger.info("StaleUserJanitor: Successfully deleted #{count} stale pending user(s).")

      {:ok, _count} ->
        Logger.info("StaleUserJanitor: No stale pending users to delete.")

      {:error, reason} ->
        Logger.error("StaleUserJanitor: Error during cleanup task: #{inspect(reason)}")
    end

    # Schedule the next cleanup.
    schedule_work()
    {:noreply, state}
  end

  defp schedule_work do
    Process.send_after(self(), :cleanup, @cleanup_interval)
  end
end
