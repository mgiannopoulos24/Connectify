defmodule BackendWeb.Presence do
  @moduledoc """
  The Presence module.
  """
  use Phoenix.Presence,
    otp_app: :backend,
    pubsub_server: Backend.PubSub
end
