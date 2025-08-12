defmodule BackendWeb.EducationJSON do
  alias Backend.Careers.Education

  @doc """
  Renders a single education entry.
  """
  def show(%{education: education}) do
    %{data: data(education)}
  end

  defp data(%Education{} = education) do
    %{
      id: education.id,
      school_name: education.school_name,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: education.start_date,
      end_date: education.end_date
    }
  end
end