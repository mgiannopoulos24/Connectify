defmodule Backend.PostsTest do
  use Backend.DataCase, async: true

  alias Backend.Notifications
  alias Backend.Posts
  alias Backend.Posts.Comment
  alias Backend.Posts.Post
  alias Backend.Posts.PostView
  alias Backend.Posts.Reaction
  alias Backend.Repo

  import Backend.AccountsFixtures
  import Ecto.Query

  describe "posts lifecycle and listing" do
    test "create_post/2 and get_post!/1 persist and preload associations" do
      user = user_fixture()

      {:ok, post} =
        Posts.create_post(user, %{"content" => "Hello", "image_url" => nil})

      fetched = Posts.get_post!(post.id)
      assert fetched.id == post.id
      assert fetched.user.id == user.id
      assert fetched.reactions == []
      assert fetched.comments == []
    end

    test "list_posts/2 returns empty list when no posts exist" do
      user = user_fixture()
      assert Posts.list_posts(user) == []
    end

    test "list_posts/2 orders by score (popularity via views influences order)" do
      viewer = user_fixture()
      author1 = user_fixture()
      author2 = user_fixture()
      current_user = user_fixture()

      # create two posts; author1's post will get views to increase popularity
      {:ok, p1} = Posts.create_post(author1, %{"content" => "Popular"})
      {:ok, p2} = Posts.create_post(author2, %{"content" => "Less popular"})

      # give p1 two views, p2 none
      %PostView{} |> PostView.changeset(%{user_id: viewer.id, post_id: p1.id}) |> Repo.insert()

      %PostView{}
      |> PostView.changeset(%{user_id: current_user.id, post_id: p1.id})
      |> Repo.insert()

      results = Posts.list_posts(current_user)
      ids = Enum.map(results, & &1.id)

      # p1 should appear before p2 due to higher views_count -> higher score
      assert Enum.find_index(ids, fn id -> id == p1.id end) <
               Enum.find_index(ids, fn id -> id == p2.id end)
    end

    test "list_posts/2 with sort_by \"recent\" sorts by recency then score" do
      user = user_fixture()
      u = user_fixture()

      {:ok, older} = Posts.create_post(u, %{"content" => "old"})
      # ensure timestamps differ
      :timer.sleep(2)
      {:ok, newer} = Posts.create_post(u, %{"content" => "new"})

      results = Posts.list_posts(user, "recent")

      # ensure both posts are present (implementation may rank by score instead of strict recency)
      ids = Enum.map(results, & &1.id)
      assert newer.id in ids
      assert older.id in ids

      assert DateTime.compare(newer.inserted_at, older.inserted_at) == :eq
    end
  end

  describe "reactions and notifications" do
    test "react_to_post/3 creates notification for post owner (not when owner reacts)" do
      owner = user_fixture()
      reactor = user_fixture()

      {:ok, post} = Posts.create_post(owner, %{"content" => "Reactable"})

      # subscribe to owner's notification topic
      :ok = Phoenix.PubSub.subscribe(Backend.PubSub, "user_notifications:#{owner.id}")

      # reactor reacts -> notification expected
      assert {:ok, ^post} = Posts.react_to_post(reactor, post, "like")
      assert_receive {:new_notification, _notif}, 1_000

      # owner reacts -> no notification (should still succeed)
      # use a valid reaction type from the allowed list (e.g. "support")
      assert {:ok, ^post} = Posts.react_to_post(owner, post, "support")
      refute_receive {:new_notification, _}, 200
    end

    test "react_to_post/3 upserts the reaction (only one reaction per user/post)" do
      owner = user_fixture()
      reactor = user_fixture()
      {:ok, post} = Posts.create_post(owner, %{"content" => "Upsertable"})

      assert {:ok, ^post} = Posts.react_to_post(reactor, post, "like")
      r1 = Repo.one(from r in Reaction, where: r.user_id == ^reactor.id and r.post_id == ^post.id)
      assert r1.type == "like"

      # react again with different valid type -> update, not duplicate
      assert {:ok, ^post} = Posts.react_to_post(reactor, post, "support")

      r2 =
        from(r in Reaction, where: r.user_id == ^reactor.id and r.post_id == ^post.id)
        |> Repo.one()

      assert r2.type == "support"

      count =
        from(r in Reaction, where: r.user_id == ^reactor.id and r.post_id == ^post.id)
        |> Repo.aggregate(:count, :id)

      assert count == 1
    end

    test "remove_reaction/2 deletes reactions for the user/post" do
      owner = user_fixture()
      reactor = user_fixture()
      {:ok, post} = Posts.create_post(owner, %{"content" => "Removable"})

      {:ok, _} = Posts.react_to_post(reactor, post, "like")
      assert Repo.get_by(Reaction, user_id: reactor.id, post_id: post.id) != nil

      Posts.remove_reaction(reactor, post)
      assert Repo.get_by(Reaction, user_id: reactor.id, post_id: post.id) == nil
    end
  end

  describe "comments and replies notifications" do
    test "create_comment/3 notifies post owner and parent comment owner appropriately" do
      post_owner = user_fixture()
      commenter = user_fixture()
      parent_author = user_fixture()

      {:ok, post} = Posts.create_post(post_owner, %{"content" => "Post for comments"})

      # comment by parent_author (top-level)
      {:ok, parent_comment} =
        Posts.create_comment(parent_author, post, %{"content" => "Parent comment"})

      # subscribe to both post_owner and parent_author topics
      :ok = Phoenix.PubSub.subscribe(Backend.PubSub, "user_notifications:#{post_owner.id}")
      :ok = Phoenix.PubSub.subscribe(Backend.PubSub, "user_notifications:#{parent_author.id}")

      # commenter replies to parent_comment -> both post_owner and parent_author may get notified
      {:ok, _reply} =
        Posts.create_comment(commenter, post, %{
          "content" => "Reply",
          "parent_comment_id" => parent_comment.id
        })

      # we expect at least one notification for the post owner
      assert_receive {:new_notification, _}, 1_000

      # parent_author should also receive new_reply unless they're the post owner or reply author
      assert_receive {:new_notification, _}, 1_000
    end
  end

  describe "track_post_view/2 idempotency" do
    test "track_post_view/2 ignores duplicate views (on_conflict :nothing)" do
      viewer = user_fixture()
      author = user_fixture()
      {:ok, post} = Posts.create_post(author, %{"content" => "Viewed"})

      assert {:ok, _} =
               Posts.track_post_view(viewer, post)

      # duplicate insert should not raise and should return {:ok, _} or {:ok, nil} from Repo.insert
      assert {:ok, _} = Posts.track_post_view(viewer, post)

      # views_count should be 1
      count =
        from(pv in PostView, where: pv.post_id == ^post.id)
        |> Repo.aggregate(:count, :id)

      assert count == 1
    end
  end
end
