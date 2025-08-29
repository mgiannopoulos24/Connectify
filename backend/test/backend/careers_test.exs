defmodule Backend.CareersTest do
  use Backend.DataCase, async: true

  alias Backend.Careers
  alias Backend.Careers.Education
  alias Backend.Careers.JobExperience
  alias Backend.Companies
  alias Backend.Repo

  import Backend.AccountsFixtures

  describe "job experiences" do
    test "create_job_experience/1 with company_name creates company and job_experience (preloads company)" do
      user = user_fixture()

      attrs = %{
        "company_name" => "TestCo",
        "job_title" => "Developer",
        "employment_type" => "full_time",
        "user_id" => user.id
      }

      assert {:ok, %JobExperience{} = je} = Careers.create_job_experience(attrs)
      je = Repo.preload(je, :company)
      assert not is_nil(je.company)
      assert je.company.name == "TestCo"
    end

    test "create_job_experience/1 with company_id uses existing company" do
      {:ok, company} = Companies.get_or_create_company_by_name("ExistingCo")
      user = user_fixture()

      attrs = %{
        "company_id" => company.id,
        "job_title" => "Engineer",
        "employment_type" => "full_time",
        "user_id" => user.id
      }

      assert {:ok, %JobExperience{} = je} = Careers.create_job_experience(attrs)
      je = Repo.preload(je, :company)
      assert je.company.id == company.id
    end

    test "create_job_experience/1 without company_id or company_name returns error changeset" do
      user = user_fixture()

      attrs = %{
        "job_title" => "NoCompanyRole",
        "employment_type" => "full_time",
        "user_id" => user.id
      }

      assert {:error, %Ecto.Changeset{} = changeset} = Careers.create_job_experience(attrs)
      assert errors_on(changeset).company_name == ["company_id or company_name must be provided"]
    end

    test "update_job_experience/2 accepts update without company fields (when existing record present)" do
      user = user_fixture()
      # create initial experience with a company name
      {:ok, je} =
        Careers.create_job_experience(%{
          "company_name" => "InitialCo",
          "job_title" => "X",
          "employment_type" => "full_time",
          "user_id" => user.id
        })

      # update some attrs without providing company info
      assert {:ok, %JobExperience{} = updated} =
               Careers.update_job_experience(je, %{"job_title" => "Updated"})

      updated = Repo.preload(updated, :company)
      assert updated.job_title == "Updated"
      # company should still be present
      assert not is_nil(updated.company)
    end

    test "get_job_experience!/1 preloads company" do
      user = user_fixture()

      {:ok, je} =
        Careers.create_job_experience(%{
          "company_name" => "PreloadCo",
          "job_title" => "T",
          "employment_type" => "full_time",
          "user_id" => user.id
        })

      reloaded = Careers.get_job_experience!(je.id)
      assert not is_nil(reloaded.company)
      assert reloaded.company.name == "PreloadCo"
    end

    test "delete_job_experience/1 deletes the job experience" do
      user = user_fixture()

      {:ok, je} =
        Careers.create_job_experience(%{
          "company_name" => "ToDeleteCo",
          "job_title" => "Temp",
          "employment_type" => "full_time",
          "user_id" => user.id
        })

      assert {:ok, %JobExperience{}} = Careers.delete_job_experience(je)
      assert_raise Ecto.NoResultsError, fn -> Careers.get_job_experience!(je.id) end
    end

    test "update_job_experience/2 can change company by providing company_name" do
      user = user_fixture()

      {:ok, je} =
        Careers.create_job_experience(%{
          "company_name" => "OldCo",
          "job_title" => "Dev",
          "employment_type" => "full_time",
          "user_id" => user.id
        })

      assert {:ok, %JobExperience{} = updated} =
               Careers.update_job_experience(je, %{"company_name" => "NewCo"})

      updated = Repo.preload(updated, :company)
      assert not is_nil(updated.company)
      assert updated.company.name == "NewCo"
    end

    test "create_job_experience/1 returns changeset error for missing required fields" do
      # provide company but omit job_title/employment_type/user_id
      attrs = %{"company_name" => "NoFieldsCo"}
      assert {:error, %Ecto.Changeset{} = changeset} = Careers.create_job_experience(attrs)
      assert "can't be blank" in errors_on(changeset).job_title
      assert "can't be blank" in errors_on(changeset).employment_type
      assert "can't be blank" in errors_on(changeset).user_id
    end
  end

  describe "educations" do
    test "create, update, delete education lifecycle" do
      user = user_fixture()

      valid_attrs = %{
        "institution" => "Uni",
        "degree" => "BS",
        "school_name" => "Test University",
        "field_of_study" => "Computer Science",
        "user_id" => user.id
      }

      assert {:ok, %Education{} = edu} = Careers.create_education(valid_attrs)
      # schema stores school_name and field_of_study (no :institution field)
      assert edu.school_name == "Test University"
      assert edu.degree == "BS"
      assert edu.field_of_study == "Computer Science"

      assert {:ok, %Education{} = updated} = Careers.update_education(edu, %{"degree" => "MS"})
      assert updated.degree == "MS"

      assert {:ok, %Education{}} = Careers.delete_education(updated)
      assert_raise Ecto.NoResultsError, fn -> Careers.get_education!(edu.id) end
    end

    test "create_education/1 returns changeset error for invalid data" do
      # empty attrs should produce an error changeset according to schema validations
      assert {:error, %Ecto.Changeset{}} = Careers.create_education(%{})
    end
  end
end
