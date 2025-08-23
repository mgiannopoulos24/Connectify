# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Backend.Repo.insert!(%Backend.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

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
      location: Enum.random(["New York, NY", "London, UK", "Berlin, DE", "Tokyo, JP", "Sydney, AU"])
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
    "Elixir", "Phoenix", "LiveView", "React", "PostgreSQL", "Docker", "JavaScript",
    "HTML", "CSS", "Node.js", "TypeScript", "Python", "Data Analysis", "Project Management", "Agile"
  ]
  |> Enum.map(fn name ->
    {:ok, skill} = Skills.create_skill(%{"name" => name})
    skill
  end)

companies =
  [
    "Tech Solutions Inc.", "Innovate Corp", "Data Systems LLC", "Cloud Services Co.",
    "Web Wizards LLC", "QuantumLeap AI", "Stellar Cybernetics", "GreenLeaf Tech", "Apex Digital", "Nexus Innovations"
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
    # Give John some initial data
    {:ok, _} =
      Backend.Careers.create_job_experience(%{
        "user_id" => user.id,
        "job_title" => "Senior Elixir Developer",
        "employment_type" => "Full-time",
        "company_id" => Enum.random(companies).id
      })

    # --- FIX: Use the corrected context function ---
    johns_skills = ["Agile", "LiveView", "Project Management", "TypeScript"]
    Enum.each(johns_skills, fn skill_name ->
      Skills.add_skill_for_user(user, %{"name" => skill_name})
    end)

    user
  else
    {:error, changeset} ->
      IO.puts("Could not create professional user John Ripper. Errors: #{inspect(changeset.errors)}")
      nil
  end

# Create 15 Additional Professional Users
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

      # --- FIX: Use the corrected context function ---
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

# Combine John Ripper with the other random users for interactions
users = [john_ripper | random_users] |> Enum.reject(&is_nil/1)

IO.puts("#{length(users)} professional users now exist.")

# ... (rest of the seeds file remains the same) ...

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
# For each user, create 2 to 5 connections
Enum.each(users, fn user ->
  # Select other users to connect with, excluding self
  others = Enum.reject(users, &(&1.id == user.id))
  connections_to_make = Enum.take_random(others, Enum.random(2..5))

  Enum.each(connections_to_make, fn other_user ->
    # To avoid duplicate requests, only create if an inverse request doesn't exist
    existing_conn =
      from(c in Backend.Connections.Connection,
        where:
          (c.user_id == ^user.id and c.connected_user_id == ^other_user.id) or
            (c.user_id == ^other_user.id and c.connected_user_id == ^user.id)
      )
      |> Repo.one()

    if is_nil(existing_conn) do
      {:ok, request} = Connections.send_connection_request(user.id, other_user.id)
      # Immediately accept for simplicity in seeding
      Connections.accept_connection_request(request)
    end
  end)
end)
IO.puts("Connections established.")

# --- 5. Create Posts ---
IO.puts("Creating random posts for each user...")
Enum.each(users, fn user ->
  for _ <- 1..Enum.random(0..5) do
    Posts.create_post(user, %{
      "content" => "Sharing some thoughts on my industry. It's an exciting time for #{SeedHelper.random_job_title()}s!"
    })
  end
end)
IO.puts("Posts created.")

# --- 6. Create Job Applications (FOR RECOMMENDER TRAINING) ---
IO.puts("Simulating job applications to train recommender...")
# Each user will apply to 3-8 random jobs
Enum.each(users, fn user ->
  # Filter out jobs posted by the current user
  applicable_jobs = Enum.reject(job_postings, &(&1.user_id == user.id))
  jobs_to_apply_for = Enum.take_random(applicable_jobs, Enum.random(3..8))

  Enum.each(jobs_to_apply_for, fn job ->
    case Jobs.apply_for_job(user, job) do
      {:ok, _} -> :ok
      _ -> :error # Ignore if they already "applied" somehow
    end
  end)
end)
IO.puts("Simulated job applications.")

IO.puts("Database seeding finished successfully!")