defmodule BackendWeb.HealthController do
  use BackendWeb, :controller

  # This is the function that the router calls.
  # `conn` holds all the information about the request.
  # `_params` means we are not using any parameters from the request.
  def index(conn, _params) do
    # This sends a JSON response with a 200 OK status code.
    json(conn, %{status: "ok"})
  end
end
