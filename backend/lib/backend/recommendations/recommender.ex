defmodule Backend.Recommendations.Recommender do
  @moduledoc """
  Implements a Matrix Factorization Collaborative Filtering algorithm
  to recommend job postings and posts to users based on their network's interactions.
  """

  @k 20
  @alpha 0.02
  @beta 0.02
  @iterations 50
  @recommendations_count 10

  @reaction_weight 1.0
  @comment_weight 1.5
  @view_weight 0.5

  def recommend_jobs(user, all_job_postings, all_users, all_applications) do
    if Enum.empty?(all_applications) or Enum.empty?(all_job_postings) do
      []
    else
      user_id_to_index = Enum.with_index(all_users) |> Enum.into(%{}, fn {u, i} -> {u.id, i} end)

      job_id_to_index =
        Enum.with_index(all_job_postings) |> Enum.into(%{}, fn {j, i} -> {j.id, i} end)

      ratings =
        Enum.map(all_applications, fn app ->
          {user_id_to_index[app.user_id], job_id_to_index[app.job_posting_id], 1.0}
        end)
        |> Enum.reject(&(is_nil(elem(&1, 0)) or is_nil(elem(&1, 1))))

      num_users = length(all_users)
      num_jobs = length(all_job_postings)
      p = initialize_matrix(num_users, @k)
      q = initialize_matrix(num_jobs, @k)

      {trained_p, trained_q} = train(ratings, p, q, @iterations)

      generate_recommendations_for_jobs(
        user,
        all_job_postings,
        user_id_to_index,
        job_id_to_index,
        trained_p,
        trained_q
      )
    end
  end

  def recommend_posts(user, all_posts, all_users, interactions) do
    if Enum.empty?(all_posts) or Enum.empty?(all_users) do
      []
    else
      user_id_to_index = Enum.with_index(all_users) |> Enum.into(%{}, fn {u, i} -> {u.id, i} end)
      post_id_to_index = Enum.with_index(all_posts) |> Enum.into(%{}, fn {p, i} -> {p.id, i} end)

      ratings = build_post_ratings(interactions, user_id_to_index, post_id_to_index)

      if Enum.empty?(ratings) do
        []
      else
        num_users = length(all_users)
        num_posts = length(all_posts)
        p = initialize_matrix(num_users, @k)
        q = initialize_matrix(num_posts, @k)

        {trained_p, trained_q} = train(ratings, p, q, @iterations)

        generate_recommendations_for_posts(
          user,
          all_posts,
          user_id_to_index,
          post_id_to_index,
          trained_p,
          trained_q
        )
      end
    end
  end

  defp build_post_ratings(interactions, user_id_to_index, post_id_to_index) do
    reactions =
      Enum.map(interactions.reactions, fn r -> {r.user_id, r.post_id, @reaction_weight} end)

    comments =
      Enum.map(interactions.comments, fn c -> {c.user_id, c.post_id, @comment_weight} end)

    views = Enum.map(interactions.views, fn v -> {v.user_id, v.post_id, @view_weight} end)

    all_interactions = reactions ++ comments ++ views

    all_interactions
    |> Enum.group_by(
      fn {user_id, post_id, _weight} -> {user_id, post_id} end,
      fn {_user_id, _post_id, weight} -> weight end
    )
    |> Enum.map(fn {{user_id, post_id}, weights} ->
      {user_id_to_index[user_id], post_id_to_index[post_id], Enum.max(weights)}
    end)
    |> Enum.reject(&(is_nil(elem(&1, 0)) or is_nil(elem(&1, 1))))
  end

  defp initialize_matrix(rows, cols) do
    for _ <- 1..rows do
      for _ <- 1..cols do
        :rand.uniform() * 0.1
      end
    end
  end

  # --- FIX: Prefixed unused variable with an underscore ---
  defp train(_ratings, p, q, 0), do: {p, q}

  defp train(ratings, p, q, iterations_left) do
    {new_p, new_q} =
      Enum.reduce(Enum.shuffle(ratings), {p, q}, fn {user_index, item_index, rating},
                                                    {current_p, current_q} ->
        update(user_index, item_index, rating, current_p, current_q)
      end)

    train(ratings, new_p, new_q, iterations_left - 1)
  end

  defp update(user_index, item_index, rating, p, q) do
    user_vector = Enum.at(p, user_index)
    item_vector = Enum.at(q, item_index)

    prediction = dot_product(user_vector, item_vector)
    error = rating - prediction

    new_user_vector =
      for {p_ik, q_kj} <- Enum.zip(user_vector, item_vector) do
        p_ik + @alpha * (error * q_kj - @beta * p_ik)
      end

    new_item_vector =
      for {q_kj, p_ik} <- Enum.zip(item_vector, user_vector) do
        q_kj + @alpha * (error * p_ik - @beta * q_kj)
      end

    {List.replace_at(p, user_index, new_user_vector),
     List.replace_at(q, item_index, new_item_vector)}
  end

  defp dot_product(vec1, vec2) do
    Enum.zip_with(vec1, vec2, &(&1 * &2))
    |> Enum.sum()
  end

  defp generate_recommendations_for_jobs(
         user,
         all_job_postings,
         user_id_to_index,
         job_id_to_index,
         p,
         q
       ) do
    user_index = user_id_to_index[user.id]

    if is_nil(user_index) do
      []
    else
      user_vector = Enum.at(p, user_index)

      all_job_postings
      |> Enum.reject(&(&1.user_id == user.id))
      |> Enum.map(fn job_posting ->
        job_index = job_id_to_index[job_posting.id]
        job_vector = Enum.at(q, job_index)
        predicted_rating = dot_product(user_vector, job_vector)
        {predicted_rating, job_posting}
      end)
      |> Enum.sort_by(fn {rating, _job} -> rating end, :desc)
      |> Enum.take(@recommendations_count)
      |> Enum.map(fn {_rating, job} -> job end)
    end
  end

  defp generate_recommendations_for_posts(
         user,
         all_posts,
         user_id_to_index,
         post_id_to_index,
         p,
         q
       ) do
    user_index = user_id_to_index[user.id]

    if is_nil(user_index) do
      []
    else
      user_vector = Enum.at(p, user_index)

      all_posts
      |> Enum.reject(&(&1.user_id == user.id))
      |> Enum.map(fn post ->
        post_index = post_id_to_index[post.id]
        post_vector = Enum.at(q, post_index)
        predicted_rating = dot_product(user_vector, post_vector)
        {predicted_rating, post}
      end)
      |> Enum.sort_by(fn {rating, _post} -> rating end, :desc)
      |> Enum.take(@recommendations_count)
      |> Enum.map(fn {_rating, post} -> post end)
    end
  end
end
