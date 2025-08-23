defmodule Backend.Recommendations.Recommender do
  @moduledoc """
  Implements a Matrix Factorization Collaborative Filtering algorithm
  to recommend job postings to users based on their network's interactions.
  """

  # --- Hyperparameters for the SVD algorithm ---

  # The number of latent features to learn for users and jobs.
  # More features can capture more complexity but risk overfitting.
  @k 20
  # The learning rate for stochastic gradient descent.
  # Controls how large the steps are when updating the feature matrices.
  @alpha 0.02
  # The regularization parameter.
  # Helps prevent overfitting by penalizing large feature values.
  @beta 0.02
  # The number of times to iterate over the training data.
  @iterations 20
  # The number of recommendations to return for a user.
  @recommendations_count 10

  @doc """
  Generates job recommendations for a given user using Matrix Factorization.
  """
  def recommend_jobs(user, all_job_postings, all_users, all_applications) do
    # Exit early if there's no data to process.
    if Enum.empty?(all_applications) or Enum.empty?(all_job_postings) do
      []
    else
      # 1. Prepare data for the algorithm
      # Create mappings from IDs to integer indices for matrix operations.
      user_id_to_index = Enum.with_index(all_users) |> Enum.into(%{}, fn {u, i} -> {u.id, i} end)
      job_id_to_index = Enum.with_index(all_job_postings) |> Enum.into(%{}, fn {j, i} -> {j.id, i} end)

      # The "ratings" are the job applications. We treat an application as a rating of 1.0.
      ratings =
        Enum.map(all_applications, fn app ->
          {user_id_to_index[app.user_id], job_id_to_index[app.job_posting_id], 1.0}
        end)
        |> Enum.reject(&is_nil(elem(&1, 0)) or is_nil(elem(&1, 1)))

      # 2. Initialize the latent feature matrices (P for users, Q for jobs) with small random values.
      num_users = length(all_users)
      num_jobs = length(all_job_postings)
      p = initialize_matrix(num_users, @k)
      q = initialize_matrix(num_jobs, @k)

      # 3. Train the model using Stochastic Gradient Descent.
      {trained_p, trained_q} = train(ratings, p, q, @iterations)

      # 4. Generate recommendations for the target user.
      generate_recommendations(
        user,
        all_job_postings,
        user_id_to_index,
        job_id_to_index,
        trained_p,
        trained_q
      )
    end
  end

  @doc """
  Initializes a matrix (list of lists) with small random floats.
  """
  defp initialize_matrix(rows, cols) do
    for _ <- 1..rows do
      for _ <- 1..cols do
        :rand.uniform() * 0.1
      end
    end
  end

  @doc """
  Trains the model for a given number of iterations.
  """
  defp train(ratings, p, q, 0), do: {p, q}
  defp train(ratings, p, q, iterations_left) do
    # In each iteration, we update P and Q for every rating.
    {new_p, new_q} =
      Enum.reduce(Enum.shuffle(ratings), {p, q}, fn {user_index, job_index, rating}, {current_p, current_q} ->
        update(user_index, job_index, rating, current_p, current_q)
      end)

    train(ratings, new_p, new_q, iterations_left - 1)
  end


  @doc """
  Performs a single update step of Stochastic Gradient Descent for one rating.
  """
  defp update(user_index, job_index, rating, p, q) do
    user_vector = Enum.at(p, user_index)
    job_vector = Enum.at(q, job_index)

    # Predict the rating and calculate the error.
    prediction = dot_product(user_vector, job_vector)
    error = rating - prediction

    # Update the user's feature vector.
    new_user_vector =
      for {p_ik, q_kj} <- Enum.zip(user_vector, job_vector) do
        p_ik + @alpha * (error * q_kj - @beta * p_ik)
      end

    # Update the job's feature vector.
    new_job_vector =
      for {q_kj, p_ik} <- Enum.zip(job_vector, user_vector) do
        q_kj + @alpha * (error * p_ik - @beta * q_kj)
      end

    # Return the updated P and Q matrices.
    {List.replace_at(p, user_index, new_user_vector), List.replace_at(q, job_index, new_job_vector)}
  end


  @doc """
  Calculates the dot product of two vectors.
  """
  defp dot_product(vec1, vec2) do
    Enum.zip_with(vec1, vec2, &(&1 * &2))
    |> Enum.sum()
  end

  @doc """
  Generates a sorted list of job recommendations for a user.
  """
  defp generate_recommendations(user, all_job_postings, user_id_to_index, job_id_to_index, p, q) do
    user_index = user_id_to_index[user.id]

    # If the user is not in our training data, we can't make recommendations.
    if is_nil(user_index) do
      []
    else
      user_vector = Enum.at(p, user_index)

      all_job_postings
      # --- THIS IS THE FIX: Exclude jobs posted by the current user ---
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
end