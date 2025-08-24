alias Backend.Accounts
alias Backend.Companies
alias Backend.Skills
alias Backend.Jobs
alias Backend.Posts
alias Backend.Connections
alias Backend.Repo
alias Backend.Careers
alias Backend.Interests
alias Backend.Chat
import Ecto.Query, warn: false

# --- Data Generation Helpers ---
defmodule SeedHelper do
  @first_names ~w(Alice Bob Carol David Eve Frank Grace Heidi Ivan Judy Mallory Oscar Peggy Trent Walter Wendy Emma Liam Olivia Noah Ava Isabella Sophia Mia Charlotte Amelia)
  @last_names ~w(Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Hernandez Lopez Gonzalez Wilson Anderson Thomas Taylor Moore Jackson Martin Lee Perez)
  @job_titles [
    "Software Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Data Scientist",
    "DevOps Engineer",
    "Marketing Manager",
    "Project Coordinator",
    "Systems Analyst",
    "QA Tester",
    "Frontend Developer",
    "Backend Developer",
    "Cloud Architect",
    "Security Specialist",
    "Network Administrator",
    "Business Analyst"
  ]
  @school_names ["University of Example", "Tech Institute", "State College", "City University", "Design School"]
  @degrees ["Bachelor of Science", "Master of Arts", "PhD", "Associate Degree"]
  @fields_of_study ["Computer Science", "Marketing", "Graphic Design", "Data Analytics", "Business Administration", "Electrical Engineering"]

  def random_user_data(index) do
    first_name = Enum.at(@first_names, rem(index, length(@first_names)))
    last_name = Enum.at(@last_names, rem(index, length(@last_names)))
    email = "#{String.downcase(first_name)}.#{String.downcase(last_name)}#{index}@connectify.com"

    %{
      name: first_name,
      surname: last_name,
      email: email,
      password: "password123",
      role: "professional",
      onboarding_completed: true,
      email_confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second),
      status: "offline",
      location: Enum.random(["New York, NY", "London, UK", "Berlin, DE", "Tokyo, JP", "Sydney, AU"])
    }
  end

  def random_education_data do
    %{
      "school_name" => Enum.random(@school_names),
      "degree" => Enum.random(@degrees),
      "field_of_study" => Enum.random(@fields_of_study),
      "start_date" => Date.add(Date.utc_today(), -Enum.random(1000..3000)),
      "end_date" => Date.add(Date.utc_today(), -Enum.random(100..900))
    }
  end

  def random_job_title, do: Enum.random(@job_titles)
end

# --- Seeding Script Starts Here ---

IO.puts("Seeding database...")

# Clean slate for idempotency
Repo.delete_all(Backend.Accounts.User)
Repo.delete_all(Backend.Companies.Company)
Repo.delete_all(Backend.Skills.Skill)
# Other top-level schemas can be deleted here if needed

# --- 1. Create Master Data (Companies & Skills) ---
IO.puts("Creating master skills and companies...")

master_skills =
  [
    "Elixir", "Phoenix", "LiveView", "React", "PostgreSQL", "Docker", "JavaScript",
    "HTML", "CSS", "Node.js", "TypeScript", "Python", "Data Analysis", "Project Management", "Agile",
    "Go", "Rust", "AWS", "GCP", "Kubernetes"
  ]
  |> Enum.map(fn name ->
    {:ok, skill} = Skills.create_master_skill(%{"name" => name})
    skill
  end)

companies =
  [
    "Tech Solutions Inc.", "Innovate Corp", "Data Systems LLC", "Cloud Services Co.",
    "Web Wizards LLC", "QuantumLeap AI", "Stellar Cybernetics", "GreenLeaf Tech", "Apex Digital", "Nexus Innovations",
    "Momentum Dynamics", "Blue Ocean Strategies", "Orion Software", "Helios Energy", "Vertex Ventures"
  ]
  |> Enum.map(fn name ->
    {:ok, company} = Companies.get_or_create_company_by_name(name)
    company
  end)

IO.puts("#{length(master_skills)} master skills created.")
IO.puts("#{length(companies)} companies created.")

# --- 2. Create Users ---
IO.puts("Creating Admin, John Ripper, and 48 professional users...")

# Admin User
{:ok, _admin} =
  Accounts.create_user(%{
    name: "Admin",
    surname: "User",
    email: "admin@user.com",
    password: "irulehere",
    role: "admin",
    onboarding_completed: true,
    email_confirmed_at: NaiveDateTime.utc_now()
  })

# Explicitly create John Ripper
john_ripper =
  with {:ok, user} <-
         Accounts.create_user(%{
           name: "John",
           surname: "Ripper",
           email: "john@ripper.com",
           password: "slaythemall",
           role: "professional",
           onboarding_completed: true,
           status: "offline",
           email_confirmed_at: NaiveDateTime.utc_now()
         }) do
    IO.puts("Professional user created: #{user.email}")
    # Add Job Experience
    {:ok, _} =
      Careers.create_job_experience(%{
        "user_id" => user.id,
        "job_title" => "Senior Elixir Developer",
        "employment_type" => "Full-time",
        "company_id" => Enum.random(companies).id
      })
    # Add Education
    Careers.create_education(Map.put(SeedHelper.random_education_data(), "user_id", user.id))
    # Add Skills
    johns_skills = ["Agile", "LiveView", "Project Management", "TypeScript", "Elixir", "Phoenix"]
    Enum.each(johns_skills, fn skill_name ->
      Skills.add_skill_for_user(user, %{"name" => skill_name})
    end)

    user
  else
    {:error, changeset} ->
      IO.puts("Could not create professional user John Ripper. Errors: #{inspect(changeset.errors)}")
      nil
  end

random_users =
  for i <- 1..48 do
    user_attrs = SeedHelper.random_user_data(i)

    with {:ok, user} <- Accounts.create_user(user_attrs) do
      # Add Job Experience
      {:ok, _} =
        Careers.create_job_experience(%{
          "user_id" => user.id,
          "job_title" => SeedHelper.random_job_title(),
          "employment_type" => Enum.random(["Full-time", "Contract"]),
          "company_id" => Enum.random(companies).id
        })
      # Add Education
      Careers.create_education(Map.put(SeedHelper.random_education_data(), "user_id", user.id))
      # Add Skills
      Enum.take_random(master_skills, Enum.random(3..7))
      |> Enum.each(fn skill ->
        Skills.add_skill_for_user(user, %{"name" => skill.name})
      end)

      user
    else
      {:error, changeset} ->
        IO.puts("Failed to create user #{user_attrs.email}: #{inspect(changeset.errors)}")
        nil
    end
  end
  |> Enum.reject(&is_nil/1)

users = [john_ripper | random_users] |> Enum.reject(&is_nil/1)

IO.puts("#{length(users) + 1} total professional users now exist.")

# --- 3. Create Job Postings ---
IO.puts("Creating 40 job postings from various users...")
job_postings =
  for _ <- 1..40 do
    author = Enum.random(users)
    company = Enum.random(companies)
    skills_for_job = Enum.take_random(master_skills, Enum.random(3..5))

    job_attrs = %{
      "title" => "#{SeedHelper.random_job_title()}",
      "description" => "We are looking for a talented and motivated individual to join our dynamic team. This role involves collaborating with cross-functional teams to deliver high-quality products.",
      "location" => Enum.random(["Remote", "New York, NY", "San Francisco, CA", "London, UK"]),
      "job_type" => Enum.random(["Full-time", "Contract", "Part-time"]),
      "company_id" => company.id,
      "skill_ids" => Enum.map(skills_for_job, & &1.id)
    }

    {:ok, job_posting} = Jobs.create_job_posting(author, job_attrs)
    job_posting
  end
IO.puts("#{length(job_postings)} job postings created.")

# --- 4. Establish Connections & Follows (Interests) ---
IO.puts("Creating a network of connections and follows...")
Enum.each(users, fn user ->
  others = Enum.reject(users, &(&1.id == user.id))
  
  # Create Connections
  connections_to_make = Enum.take_random(others, Enum.random(5..10))
  Enum.each(connections_to_make, fn other_user ->
    existing_conn =
      from(c in Backend.Connections.Connection,
        where:
          (c.user_id == ^user.id and c.connected_user_id == ^other_user.id) or
            (c.user_id == ^other_user.id and c.connected_user_id == ^user.id)
      )
      |> Repo.one()

    if is_nil(existing_conn) do
      {:ok, request} = Connections.send_connection_request(user.id, other_user.id)
      # 80% chance to be an accepted connection
      if :rand.uniform() < 0.8, do: Connections.accept_connection_request(request)
    end
  end)

  # Follow Users
  users_to_follow = Enum.take_random(others, Enum.random(4..8))
  Enum.each(users_to_follow, fn user_to_follow ->
    Interests.follow_entity(user.id, user_to_follow.id, "user")
  end)

  # Follow Companies
  companies_to_follow = Enum.take_random(companies, Enum.random(3..6))
  Enum.each(companies_to_follow, fn company_to_follow ->
    Interests.follow_entity(user.id, company_to_follow.id, "company")
  end)

end)
IO.puts("Connections and follows established.")


# --- 5. Create Posts ---
IO.puts("Creating 100 random posts for various users...")
all_posts =
  for _ <- 1..100 do
    user = Enum.random(users)
    content = Enum.random([
      "Excited to share an update on my latest project! #tech #innovation",
      "Thinking about the future of AI and its impact on #{SeedHelper.random_job_title()}s.",
      "Just finished a great book on leadership. Highly recommend it to everyone in my network.",
      "Looking for recommendations for a good PostgreSQL client. What does everyone use?",
      "Happy to have connected with so many inspiring people this week. #networking"
    ])

    {:ok, post} = Posts.create_post(user, %{"content" => content})
    post
  end

IO.puts("#{length(all_posts)} posts created.")

# --- 6. Create Post Interactions (for Recommender) ---
IO.puts("Simulating post interactions (views, reactions, comments)...")
reaction_types = ~w(like support congrats awesome funny constructive)

Enum.each(users, fn user ->
  # Each user interacts with 15 to 30 random posts
  posts_to_interact_with = Enum.take_random(all_posts, Enum.random(15..30))

  Enum.each(posts_to_interact_with, fn post ->
    # Don't interact with own posts
    if post.user_id != user.id do
      # 1. Always track a view
      Posts.track_post_view(user, post)

      # 2. 70% chance to also react
      if :rand.uniform() < 0.7 do
        Posts.react_to_post(user, post, Enum.random(reaction_types))
      end

      # 3. 25% chance to also comment
      if :rand.uniform() < 0.25 do
        {:ok, comment} = Posts.create_comment(user, post, %{"content" => "Great point!"})
        # 4. 15% chance for someone else to react to that comment
        if :rand.uniform() < 0.15 do
          other_user = Enum.random(users)
          if other_user.id != user.id, do: Posts.react_to_comment(other_user, comment, Enum.random(reaction_types))
        end
      end
    end
  end)
end)
IO.puts("Post interactions simulated.")

# --- 7. Create Job Applications (for Recommender) ---
IO.puts("Simulating job applications to train recommender...")
Enum.each(users, fn user ->
  applicable_jobs = Enum.reject(job_postings, &(&1.user_id == user.id))
  jobs_to_apply_for = Enum.take_random(applicable_jobs, Enum.random(5..12))

  Enum.each(jobs_to_apply_for, fn job ->
    # apply_for_job automatically creates a notification
    Jobs.apply_for_job(user, job)
  end)
end)
IO.puts("Simulated job applications.")

# --- 8. Create Chat Rooms and Messages ---
IO.puts("Creating chat rooms and simulating conversations...")
# Take a subset of users to create chats for, to avoid too many messages
chatty_users = Enum.take_random(users, 25)
Enum.each(chatty_users, fn user ->
  # Find 2-4 accepted connections for this user
  connections = Connections.list_user_connections(user.id)
  
  connections_to_message = Enum.take_random(connections, Enum.random(2..4))

  Enum.each(connections_to_message, fn conn ->
    other_user_id = if conn.user_id == user.id, do: conn.connected_user_id, else: conn.user_id
    
    with {:ok, chat_room} <- Chat.get_or_create_chat_room(user.id, other_user_id) do
      # Create 5-10 messages in the room
      for i <- 1..Enum.random(5..10) do
        sender = if rem(i, 2) == 0, do: user, else: %{id: other_user_id}
        content = Enum.random(["Hey, how's it going?", "Good, thanks! How about you?", "Did you see that post about Elixir?", "Yeah, it was really interesting.", "We should catch up sometime."])
        Chat.create_message(chat_room, sender, %{"content" => content})
      end
    end
  end)
end)
IO.puts("Chat simulations complete.")


IO.puts("Database seeding finished successfully!")