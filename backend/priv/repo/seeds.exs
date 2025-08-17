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
alias Backend.Repo

IO.puts("Seeding database...")

# --- Create an Admin User ---
# It's a good practice to use your context functions (like Accounts.create_user)
# as they handle all the necessary logic, such as hashing passwords.
with {:ok, admin_user} <-
       Accounts.create_user(%{
         name: "Admin",
         surname: "User",
         email: "admin@user.com",
         # Use a secure, memorable password for dev
         password: "irulehere",
         # Set the role to admin
         role: "admin",
         onboarding_completed: true,
         # We can manually confirm the email for convenience in seeds
         email_confirmed_at: NaiveDateTime.utc_now()
       }) do
  IO.puts("Admin user created: #{admin_user.email}")
else
  # Handle the case where user creation might fail (e.g., if the user already exists)
  {:error, changeset} ->
    IO.puts("Could not create admin user. Errors: #{inspect(changeset.errors)}")
end

# --- Create a Professional User ---
with {:ok, prof_user} <-
       Accounts.create_user(%{
         name: "John",
         surname: "Ripper",
         email: "john@ripper.com",
         password: "slaythemall",
         role: "professional",
         onboarding_completed: true,
         email_confirmed_at: NaiveDateTime.utc_now()
       }) do
  IO.puts("Professional user created: #{prof_user.email}")
else
  {:error, changeset} ->
    IO.puts("Could not create professional user. Errors: #{inspect(changeset.errors)}")
end

# --- Fetch the professional user to be the author of posts and jobs ---
prof_user = Accounts.get_user_by_email("john@ripper.com")

if prof_user do
  IO.puts("Seeding data for professional user: #{prof_user.email}")

  # --- Create Master Skills ---
  IO.puts("Creating master skills...")

  skills_to_create = [
    "Elixir",
    "Phoenix",
    "React",
    "PostgreSQL",
    "Docker",
    "JavaScript",
    "HTML",
    "CSS",
    "Node.js",
    "TypeScript"
  ]

  master_skills =
    Enum.map(skills_to_create, fn skill_name ->
      {:ok, skill} = Skills.create_master_skill(%{"name" => skill_name})
      skill
    end)

  IO.puts("#{length(master_skills)} master skills created.")

  # --- Create Companies ---
  IO.puts("Creating companies...")

  companies_to_create = [
    "Tech Solutions Inc.",
    "Innovate Corp",
    "Data Systems LLC",
    "Cloud Services Co.",
    "Web Wizards LLC"
  ]

  companies =
    Enum.map(companies_to_create, fn company_name ->
      {:ok, company} = Companies.get_or_create_company_by_name(company_name)
      company
    end)

  IO.puts("#{length(companies)} companies created.")

  # --- Create Posts ---
  IO.puts("Creating 5 posts...")

  for i <- 1..5 do
    Posts.create_post(prof_user, %{
      "content" =>
        "This is post number #{i}. Sharing some thoughts on technology and professional growth. #tech #career"
    })
  end

  IO.puts("5 posts created successfully.")

  # --- Create Job Postings ---
  IO.puts("Creating 10 job postings...")

  job_titles = [
    "Senior Elixir Developer",
    "Frontend React Engineer",
    "Full-Stack Developer",
    "DevOps Engineer",
    "Junior Backend Developer",
    "Phoenix LiveView Specialist",
    "Lead Software Engineer",
    "Database Administrator",
    "UI/UX Designer",
    "Product Manager"
  ]

  # --- FIX APPLIED HERE ---
  # Use the full list of valid job types from the schema
  valid_job_types = ["Full-time","Part-time","Self-employed","Freelance","Contract","Internship",
    "Apprenticeship",
    "Seasonal",]

  Enum.with_index(job_titles, 1)
  |> Enum.each(fn {title, index} ->
    # Select a random company
    company = Enum.random(companies)
    # Select two random skills
    selected_skills = Enum.take_random(master_skills, 2)
    skill_ids = Enum.map(selected_skills, & &1.id)

    job_attrs = %{
      "title" => title,
      "description" =>
        "Seeking a talented #{title} to join our dynamic team. This is a great opportunity to work on exciting projects. Required skills: #{Enum.map(selected_skills, & &1.name) |> Enum.join(", ")}.",
      "location" => Enum.random(["Remote", "New York, NY", "San Francisco, CA", "Austin, TX"]),
      "job_type" => Enum.random(valid_job_types),
      "company_id" => company.id,
      "skill_ids" => skill_ids
    }

    case Jobs.create_job_posting(prof_user, job_attrs) do
      {:ok, _job_posting} ->
        IO.puts("  - Created job posting ##{index}: '#{title}' at #{company.name}")

      {:error, changeset} ->
        IO.puts(
          "  - Failed to create job posting ##{index}: '#{title}'. Errors: #{inspect(changeset.errors)}"
        )
    end
  end)

  IO.puts("10 job postings created.")
else
  IO.puts("Professional user not found, skipping data seeding for jobs and posts.")
end

IO.puts("Database seeding finished.")
