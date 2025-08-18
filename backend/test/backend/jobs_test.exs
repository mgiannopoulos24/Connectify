defmodule Backend.JobsTest do
  use Backend.DataCase, async: true

  alias Backend.Jobs
  alias Backend.Jobs.{JobPosting, JobApplication}
  alias Backend.Companies

  import Backend.AccountsFixtures

  describe "job postings and applications" do
    test "create_job_posting/1 with company_name creates a company and posting" do
      user = user_fixture()

      attrs = %{
        "user_id" => user.id,
        "company_name" => "TestCo",
        "title" => "Backend Engineer",
        "description" => "Do backends",
        "job_type" => "Full-time"
      }

      assert {:ok, %JobPosting{} = posting} = Jobs.create_job_posting(attrs)
      assert posting.user_id == user.id
      assert posting.company.name == "TestCo"
      assert posting.title == "Backend Engineer"
    end

    test "create_job_posting/2 with user and company_id uses existing company" do
      user = user_fixture()
      {:ok, company} = Companies.create_company(%{name: "ExistingCo"})

      attrs = %{
        "company_id" => company.id,
        "title" => "SWE",
        "description" => "Build things",
        "job_type" => "Full-time"
      }

      assert {:ok, %JobPosting{} = posting} = Jobs.create_job_posting(user, attrs)
      assert posting.company.id == company.id
      assert posting.user_id == user.id
    end

    test "create_job_posting/1 returns user error changeset when user_id missing/invalid" do
      attrs = %{
        "user_id" => "00000000-0000-0000-0000-000000000000",
        "company_name" => "X",
        "title" => "T",
        "description" => "D",
        "job_type" => "Full-time"
      }

      assert {:error, %Ecto.Changeset{} = changeset} = Jobs.create_job_posting(attrs)
      assert "is missing or invalid" in errors_on(changeset).user_id
    end

    test "create_job_posting/1 without company_id or company_name returns company error" do
      user = user_fixture()

      attrs = %{
        "user_id" => user.id,
        "title" => "NoCompany",
        "description" => "D",
        "job_type" => "Full-time"
      }

      assert {:error, %Ecto.Changeset{} = changeset} = Jobs.create_job_posting(attrs)
      assert errors_on(changeset).company |> Enum.any?()
    end

    test "get_job_posting!/1 preloads user, company and skills" do
      user = user_fixture()

      attrs = %{
        "user_id" => user.id,
        "company_name" => "PreloadCo",
        "title" => "PreloadRole",
        "description" => "D",
        "job_type" => "Full-time"
      }

      {:ok, posting} = Jobs.create_job_posting(attrs)
      loaded = Jobs.get_job_posting!(posting.id)

      assert loaded.user.id == user.id
      assert loaded.company.name == "PreloadCo"
      assert is_list(loaded.skills)
      assert is_list(loaded.job_applications)
    end

    test "list_all_job_postings/0 returns postings ordered by inserted_at desc" do
      user = user_fixture()

      attrs1 = %{
        "user_id" => user.id,
        "company_name" => "A",
        "title" => "Old",
        "description" => "old",
        "job_type" => "Full-time"
      }

      attrs2 = %{
        "user_id" => user.id,
        "company_name" => "B",
        "title" => "New",
        "description" => "new",
        "job_type" => "Full-time"
      }

      {:ok, p1} = Jobs.create_job_posting(attrs1)
      # ensure ordering is deterministic even when DB timestamps have second precision
      :timer.sleep(1100)
      {:ok, p2} = Jobs.create_job_posting(attrs2)

      postings = Jobs.list_all_job_postings()

      # verify returned list is sorted by inserted_at descending
      assert postings == Enum.sort_by(postings, & &1.inserted_at, {:desc, DateTime})
    end

    test "apply_for_job/3 prevents applying to own job and allows others, rejects duplicates" do
      owner = user_fixture()
      other = user_fixture()

      attrs = %{
        "user_id" => owner.id,
        "company_name" => "AppCo",
        "title" => "Role",
        "description" => "Desc",
        "job_type" => "Full-time"
      }

      {:ok, posting} = Jobs.create_job_posting(attrs)

      # owner cannot apply
      assert {:error, :cannot_apply_to_own_job} = Jobs.apply_for_job(owner, posting, %{})

      # other can apply
      assert {:ok, %JobApplication{} = app} = Jobs.apply_for_job(other, posting, %{"cover_letter" => "Hi"})
      assert app.user_id == other.id
      assert app.job_posting_id == posting.id

      # duplicate application rejected
      assert {:error, %Ecto.Changeset{} = changeset} =
               Jobs.apply_for_job(other, posting, %{"cover_letter" => "Again"})

      errors = errors_on(changeset)
      assert Enum.any?(Map.values(errors), fn vals -> Enum.any?(vals, &String.contains?(&1, "already applied")) end)
    end

    test "review_application/2 updates status and returns updated application" do
      owner = user_fixture()
      applicant = user_fixture()

      attrs = %{
        "user_id" => owner.id,
        "company_name" => "ReviewCo",
        "title" => "Role",
        "description" => "Desc",
        "job_type" => "Full-time"
      }

      {:ok, posting} = Jobs.create_job_posting(attrs)
      {:ok, application} = Jobs.apply_for_job(applicant, posting, %{})

      assert {:ok, updated} = Jobs.review_application(application, "accepted")
      assert updated.status == "accepted"

      # review to a non-notifying status still succeeds
      assert {:ok, _} = Jobs.review_application(updated, "reviewed")
    end

    test "list_job_postings_for_user_feed/1 attaches application_status for user's applications" do
      owner = user_fixture()
      applicant = user_fixture()

      attrs = %{
        "user_id" => owner.id,
        "company_name" => "FeedCo",
        "title" => "FeedRole",
        "description" => "Desc",
        "job_type" => "Full-time"
      }

      {:ok, posting} = Jobs.create_job_posting(attrs)
      {:ok, _app} = Jobs.apply_for_job(applicant, posting, %{})

      feed = Jobs.list_job_postings_for_user_feed(applicant)
      found = Enum.find(feed, &(&1.id == posting.id))
      assert found.application_status == "submitted"
    end

    test "delete_job_posting/1 deletes the posting" do
      user = user_fixture()

      attrs = %{
        "user_id" => user.id,
        "company_name" => "DelCo",
        "title" => "ToDelete",
        "description" => "Desc",
        "job_type" => "Full-time"
      }

      {:ok, posting} = Jobs.create_job_posting(attrs)
      assert {:ok, _} = Jobs.delete_job_posting(posting)
      assert_raise Ecto.NoResultsError, fn -> Jobs.get_job_posting!(posting.id) end
    end
  end
end