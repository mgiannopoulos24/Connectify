defmodule BackendWeb.RecommendationController do
  use BackendWeb, :controller

  alias Backend.Recommendations
  alias BackendWeb.JobPostingJSON

  action_fallback BackendWeb.FallbackController

  def jobs(conn, _params) do
    current_user = conn.assigns.current_user
    recommended_jobs = Recommendations.get_job_recommendations(current_user)

    render(conn, JobPostingJSON, :index, job_postings: recommended_jobs)
  end
end