defmodule BackendWeb.SkillController do
  use BackendWeb, :controller

  alias Backend.Skills

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"skill" => skill_params}) do
    current_user = conn.assigns.current_user

    with {:ok, _skill} <-
           Skills.create_skill(Map.put(skill_params, "user_id", current_user.id)) do
      send_resp(conn, :created, "")
    end
  end
end