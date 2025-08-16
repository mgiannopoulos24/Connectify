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

IO.puts("Database seeding finished.")
