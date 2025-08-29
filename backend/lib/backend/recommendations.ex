defmodule Backend.Recommendations do
  @moduledoc """
  The Recommendations context.
  Provides an API for generating job and connection recommendations.
  """
  alias Backend.Recommendations.Recommender
  alias Backend.Repo
  alias Backend.Accounts.User
  alias Backend.Jobs.JobPosting
  alias Backend.Jobs.JobApplication
  alias Backend.Jobs
  alias Backend.Posts.Post
  alias Backend.Posts.Reaction
  alias Backend.Posts.Comment
  alias Backend.Posts.PostView

  import Ecto.Query, warn: false

  def get_job_recommendations(user) do
    all_users = Repo.all(User)
    all_job_postings = Jobs.list_all_job_postings()
    all_applications = Repo.all(JobApplication)

    recommended_jobs =
      Recommender.recommend_jobs(user, all_job_postings, all_users, all_applications)

    user_applications_map =
      from(ja in JobApplication,
        where: ja.user_id == ^user.id,
        select: {ja.job_posting_id, ja.status}
      )
      |> Repo.all()
      |> Map.new()

    recommended_jobs
    |> Enum.map(fn post ->
      status = Map.get(user_applications_map, post.id)
      Map.put(post, :application_status, status)
    end)
    |> Enum.reject(fn post_with_status ->
      post_with_status.application_status == "accepted"
    end)
  end

  @doc """
  Gets post recommendations for a user.
  """
  def get_post_recommendations(user) do
    # Fetch all data required for the algorithm
    all_users = Repo.all(from u in User, select: u)
    all_posts = Repo.all(from p in Post, select: p)
    all_reactions = Repo.all(Reaction)
    all_comments = Repo.all(Comment)
    all_views = Repo.all(PostView)

    # Delegate to the Recommender to get the raw recommendations
    Recommender.recommend_posts(user, all_posts, all_users, %{
      reactions: all_reactions,
      comments: all_comments,
      views: all_views
    })
  end
end
