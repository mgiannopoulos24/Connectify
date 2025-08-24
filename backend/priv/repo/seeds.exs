alias Backend.Accounts
alias Backend.Companies
alias Backend.Skills
alias Backend.Jobs
alias Backend.Posts
alias Backend.Connections
alias Backend.Repo
import Ecto.Query, warn: false

# --- Data Generation Helpers ---
defmodule SeedHelper do
  @first_names ~w(Alice Bob Carol David Eve Frank Grace Heidi Ivan Judy Mallory Oscar Peggy Trent Walter Wendy)
  @last_names ~w(Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Hernandez Lopez Gonzalez Wilson Anderson)
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

  def random_user_data(index) do
    first_name = Enum.at(@first_names, rem(index, length(@first_names)))
    last_name = Enum.at(@last_names, rem(index, length(@last_names)))
    email = "#{String.downcase(first_name)}.#{String.downcase(last_name)}#{index}@example.com"

    %{
      name: first_name,
      surname: last_name,
      email: email,
      password: "password123",
      role: "professional",
      onboarding_completed: true,
      email_confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second),
      location:
        Enum.random(["New York, NY", "London, UK", "Berlin, DE", "Tokyo, JP", "Sydney, AU"])
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

# --- 1. Create Master Data (Companies & Skills) ---
IO.puts("Creating master skills and companies...")

master_skills =
  [
    "Elixir",
    "Phoenix",
    "LiveView",
    "React",
    "PostgreSQL",
    "Docker",
    "JavaScript",
    "HTML",
    "CSS",
    "Node.js",
    "TypeScript",
    "Python",
    "Data Analysis",
    "Project Management",
    "Agile"
  ]
  |> Enum.map(fn name ->
    {:ok, skill} = Skills.create_master_skill(%{"name" => name})
    skill
  end)

companies =
  [
    "Tech Solutions Inc.",
    "Innovate Corp",
    "Data Systems LLC",
    "Cloud Services Co.",
    "Web Wizards LLC",
    "QuantumLeap AI",
    "Stellar Cybernetics",
    "GreenLeaf Tech",
    "Apex Digital",
    "Nexus Innovations"
  ]
  |> Enum.map(fn name ->
    {:ok, company} = Companies.get_or_create_company_by_name(name)
    company
  end)

IO.puts("#{length(master_skills)} master skills created.")
IO.puts("#{length(companies)} companies created.")

# --- 2. Create Users ---
IO.puts("Creating Admin, John Ripper, and 15 professional users...")

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
           email_confirmed_at: NaiveDateTime.utc_now()
         }) do
    IO.puts("Professional user created: #{user.email}")

    {:ok, _} =
      Backend.Careers.create_job_experience(%{
        "user_id" => user.id,
        "job_title" => "Senior Elixir Developer",
        "employment_type" => "Full-time",
        "company_id" => Enum.random(companies).id
      })

    johns_skills = ["Agile", "LiveView", "Project Management", "TypeScript"]

    Enum.each(johns_skills, fn skill_name ->
      Skills.add_skill_for_user(user, %{"name" => skill_name})
    end)

    user
  else
    {:error, changeset} ->
      IO.puts(
        "Could not create professional user John Ripper. Errors: #{inspect(changeset.errors)}"
      )

      nil
  end

random_users =
  for i <- 1..15 do
    user_attrs = SeedHelper.random_user_data(i)

    with {:ok, user} <- Accounts.create_user(user_attrs) do
      {:ok, _} =
        Backend.Careers.create_job_experience(%{
          "user_id" => user.id,
          "job_title" => SeedHelper.random_job_title(),
          "employment_type" => Enum.random(["Full-time", "Contract"]),
          "company_id" => Enum.random(companies).id
        })

      Enum.take_random(master_skills, Enum.random(2..5))
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

IO.puts("#{length(users)} professional users now exist.")

# --- 3. Create Job Postings ---
IO.puts("Creating 20 job postings from various users...")

job_postings =
  for _ <- 1..20 do
    author = Enum.random(users)
    company = Enum.random(companies)
    skills_for_job = Enum.take_random(master_skills, Enum.random(3..5))

    job_attrs = %{
      "title" => "#{SeedHelper.random_job_title()}",
      "description" => "We are looking for a talented individual to join our team.",
      "location" => Enum.random(["Remote", "New York, NY", "San Francisco, CA"]),
      "job_type" => Enum.random(["Full-time", "Contract", "Part-time"]),
      "company_id" => company.id,
      "skill_ids" => Enum.map(skills_for_job, & &1.id)
    }

    {:ok, job_posting} = Jobs.create_job_posting(author, job_attrs)
    job_posting
  end

IO.puts("#{length(job_postings)} job postings created.")

# --- 4. Establish Connections ---
IO.puts("Creating a network of connections...")

Enum.each(users, fn user ->
  others = Enum.reject(users, &(&1.id == user.id))
  connections_to_make = Enum.take_random(others, Enum.random(2..5))

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
      Connections.accept_connection_request(request)
    end
  end)
end)

IO.puts("Connections established.")

# --- 5. Create Posts ---
IO.puts("Creating 50 random posts for various users...")

all_posts =
  for _ <- 1..50 do
    user = Enum.random(users)

    {:ok, post} =
      Posts.create_post(user, %{
        "content" =>
          "Sharing some thoughts on my industry. It's an exciting time for #{SeedHelper.random_job_title()}s!"
      })

    post
  end

IO.puts("#{length(all_posts)} posts created.")

# --- 6. Create Post Interactions (for Recommender) ---
IO.puts("Simulating post interactions (views, reactions, comments)...")
reaction_types = ~w(like support congrats awesome funny constructive)

Enum.each(users, fn user ->
  # Each user interacts with 10 to 25 random posts
  posts_to_interact_with = Enum.take_random(all_posts, Enum.random(10..25))

  Enum.each(posts_to_interact_with, fn post ->
    # Don't interact with own posts
    if post.user_id != user.id do
      # 1. Always track a view
      Posts.track_post_view(user, post)

      # 2. 60% chance to also react
      if :rand.uniform() < 0.6 do
        Posts.react_to_post(user, post, Enum.random(reaction_types))
      end

      # 3. 20% chance to also comment
      if :rand.uniform() < 0.2 do
        Posts.create_comment(user, post, %{"content" => "Great point!"})
      end
    end
  end)
end)

IO.puts("Post interactions simulated.")

# --- 7. Create Job Applications (for Recommender) ---
IO.puts("Simulating job applications to train recommender...")

Enum.each(users, fn user ->
  applicable_jobs = Enum.reject(job_postings, &(&1.user_id == user.id))
  jobs_to_apply_for = Enum.take_random(applicable_jobs, Enum.random(3..8))

  Enum.each(jobs_to_apply_for, fn job ->
    case Jobs.apply_for_job(user, job) do
      {:ok, _} -> :ok
      _ -> :error
    end
  end)
end)

IO.puts("Simulated job applications.")

IO.puts("Database seeding finished successfully!")
