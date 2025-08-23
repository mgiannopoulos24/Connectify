defmodule Backend.Recommendations do
  @modledoc """
  The Recommendations context.
  Provides an API for generating job and connection recommendations.
  """
  alias Backend.Recommendations.Recommender
  alias Backend.Repo
  alias Backend.Accounts.User
  alias Backend.Jobs.JobPosting
  alias Backend.Jobs.JobApplication
  alias Backend.Jobs
  import Ecto.Query, warn: false

  @doc """
  Gets job posting recommendations for a user.

  It fetches all necessary data, uses the Recommender to generate a list of
  recommended job postings, enriches them with application status, and then
  filters out any jobs the user has already been accepted for.
  """
  def get_job_recommendations(user) do
    # 1. Fetch all data required for the algorithm
    all_users = Repo.all(User)
    all_job_postings = Jobs.list_all_job_postings()
    all_applications = Repo.all(JobApplication)

    # 2. Delegate to the Recommender to get the raw recommendations
    recommended_jobs = Recommender.recommend_jobs(user, all_job_postings, all_users, all_applications)

    # 3. Get the user's application statuses
    user_applications_map =
      from(ja in JobApplication,
        where: ja.user_id == ^user.id,
        select: {ja.job_posting_id, ja.status}
      )
      |> Repo.all()
      |> Map.new()

    # 4. Enrich and then filter the recommendations
    recommended_jobs
    |> Enum.map(fn post ->
      # First, add the application status to each recommended job
      status = Map.get(user_applications_map, post.id)
      Map.put(post, :application_status, status)
    end)
    # --- THIS IS THE NEW FIX ---
    # Now, reject any job where the status is 'accepted'
    |> Enum.reject(fn post_with_status ->
      post_with_status.application_status == "accepted"
    end)
    # --- END FIX ---
  end
end