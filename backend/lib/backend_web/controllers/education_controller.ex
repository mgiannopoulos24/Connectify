defmodule BackendWeb.EducationController do
  use BackendWeb, :controller

  alias Backend.Careers
  alias Backend.Careers.Education

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"education" => education_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %Education{} = education} <-
           Careers.create_education(Map.put(education_params, "user_id", current_user.id)) do
      conn
      |> put_status(:created)
      |> render(:show, education: education)
    end
  end
end
