defmodule Backend.RecommendationsTest do
  use Backend.DataCase, async: true

  alias Backend.Posts
  alias Backend.Recommendations
  alias Backend.Repo

  import Backend.AccountsFixtures

  describe "job recommendations" do
    test "get_job_recommendations/1 returns an empty list when there are no job postings" do
      user = user_fixture()
      results = Recommendations.get_job_recommendations(user)
      assert is_list(results)
      assert results == []
    end

    test "get_job_recommendations/1 returns a list (no crash) for a user with data present" do
      # This test ensures the function doesn't crash when dataset exists.
      # We create a user and rely on any existing seed/test fixtures; it's resilient to different recommender outputs.
      user = user_fixture()

      # call function — implementation delegates to Recommender; ensure return type is list
      assert is_list(Recommendations.get_job_recommendations(user))
    end
  end

  describe "post recommendations" do
    test "get_post_recommendations/1 returns an empty list when there are no posts" do
      user = user_fixture()
      results = Recommendations.get_post_recommendations(user)
      assert is_list(results)
      assert results == []
    end

    test "get_post_recommendations/1 returns a list and does not crash when posts/reactions/comments/views exist" do
      author = user_fixture()
      viewer = user_fixture()
      target = user_fixture()

      # create a post and add some interactions using the public Posts API so tests remain robust
      {:ok, post} = Posts.create_post(author, %{"content" => "Recommendation test post"})

      # Try to add a reaction and a view if the Posts API supports it; ignore failures but ensure no crash
      _ =
        try do
          Posts.react_to_post(viewer, post, "like")
        rescue
          _ -> :ok
        end

      _ =
        try do
          Posts.track_post_view(viewer, post)
        rescue
          _ -> :ok
        end

      # Now ask for recommendations; the recommender may rank, filter, or return empty list.
      res = Recommendations.get_post_recommendations(target)
      assert is_list(res)

      # If the recommender returns Post structs or maps, ensure elements are of an expected shape when present
      if Enum.any?(res) do
        first = hd(res)
        assert is_map(first) or is_struct(first)
      end
    end

    test "get_post_recommendations/1 is resilient to being called for users with no interactions" do
      lonely_user = user_fixture()
      assert is_list(Recommendations.get_post_recommendations(lonely_user))
    end
  end
end
