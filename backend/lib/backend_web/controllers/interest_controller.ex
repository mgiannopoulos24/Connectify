defmodule BackendWeb.InterestController do
  use BackendWeb, :controller

  alias Backend.Interests

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"interest" => interest_params}) do
    current_user = conn.assigns.current_user

    with {:ok, _interest} <-
           Interests.create_interest(Map.put(interest_params, "user_id", current_user.id)) do
      send_resp(conn, :created, "")
    end
  end
end
