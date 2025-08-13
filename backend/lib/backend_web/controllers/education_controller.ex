defmodule BackendWeb.EducationController do
  use BackendWeb, :controller

  alias Backend.Careers
  alias Backend.Careers.Education
  alias BackendWeb.EducationJSON

  action_fallback BackendWeb.FallbackController

  def create(conn, %{"education" => education_params}) do
    current_user = conn.assigns.current_user

    with {:ok, %Education{} = education} <-
           Careers.create_education(Map.put(education_params, "user_id", current_user.id)) do
      conn
      |> put_status(:created)
      |> render(EducationJSON, :show, education: education)
    end
  end

  def update(conn, %{"id" => id, "education" => education_params}) do
    current_user = conn.assigns.current_user
    education = Careers.get_education!(id)

    if education.user_id == current_user.id do
      with {:ok, %Education{} = education} <-
             Careers.update_education(education, education_params) do
        render(conn, EducationJSON, :show, education: education)
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    education = Careers.get_education!(id)

    if education.user_id == current_user.id do
      with {:ok, _education} <- Careers.delete_education(education) do
        send_resp(conn, :no_content, "")
      end
    else
      conn |> put_status(:forbidden) |> json(%{errors: %{detail: "Forbidden"}})
    end
  end
end
