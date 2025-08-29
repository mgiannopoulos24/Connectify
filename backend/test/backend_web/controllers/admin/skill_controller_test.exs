defmodule BackendWeb.Admin.SkillControllerTest do
  use BackendWeb.ConnCase, async: true

  alias Backend.Skills
  alias Backend.Repo
  import Backend.AccountsFixtures

  defp login_user(conn, user) do
    {:ok, token, _} = Backend.Auth.sign_token(user)
    Plug.Conn.put_req_header(conn, "cookie", "auth_token=#{token}")
  end

  setup do
    admin_user =
      user_fixture(%{
        role: "admin",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    professional_user =
      user_fixture(%{
        role: "professional",
        status: "active",
        email_confirmed_at: NaiveDateTime.utc_now()
      })

    %{
      admin_conn: login_user(build_conn(), admin_user),
      prof_conn: login_user(build_conn(), professional_user)
    }
  end

  describe "index" do
    test "lists all master skills for an admin", %{admin_conn: conn} do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Elixir"})
      conn = get(conn, ~p"/api/admin/skills")

      assert json_response(conn, 200)["data"] == [
               %{"id" => skill.id, "name" => "Elixir"}
             ]
    end

    test "returns 403 forbidden for a non-admin user", %{prof_conn: conn} do
      conn = get(conn, ~p"/api/admin/skills")
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "show" do
    test "shows a specific skill for an admin", %{admin_conn: conn} do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "Phoenix"})
      conn = get(conn, ~p"/api/admin/skills/#{skill.id}")
      assert json_response(conn, 200)["data"] == %{"id" => skill.id, "name" => "Phoenix"}
    end

    test "returns 404 for non-existent skill ID", %{admin_conn: conn} do
      conn = get(conn, ~p"/api/admin/skills/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end

  describe "create" do
    @create_attrs %{"name" => "LiveView"}

    test "creates a master skill for an admin", %{admin_conn: conn} do
      conn = post(conn, ~p"/api/admin/skills", skill: @create_attrs)
      response_data = json_response(conn, 201)["data"]
      assert response_data["name"] == "LiveView"
      assert Repo.get_by!(Skills.Skill, name: "LiveView")
    end

    test "returns 422 for invalid data", %{admin_conn: conn} do
      conn = post(conn, ~p"/api/admin/skills", skill: %{"name" => ""})
      assert json_response(conn, 422)["errors"]["name"]
    end

    test "returns 422 for duplicate skill name", %{admin_conn: conn} do
      Skills.create_master_skill(@create_attrs)
      conn = post(conn, ~p"/api/admin/skills", skill: @create_attrs)
      assert json_response(conn, 422)["errors"]["name"]
    end

    test "returns 403 for a non-admin user", %{prof_conn: conn} do
      conn = post(conn, ~p"/api/admin/skills", skill: @create_attrs)
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end

  describe "update" do
    @update_attrs %{"name" => "Ecto"}

    test "updates a skill for an admin", %{admin_conn: conn} do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "OldName"})
      conn = put(conn, ~p"/api/admin/skills/#{skill.id}", skill: @update_attrs)
      assert json_response(conn, 200)["data"]["name"] == "Ecto"
      assert Repo.get_by!(Skills.Skill, name: "Ecto")
    end

    test "returns 404 for non-existent ID", %{admin_conn: conn} do
      conn = put(conn, ~p"/api/admin/skills/#{Ecto.UUID.generate()}", skill: @update_attrs)
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end
  end

  describe "delete" do
    test "deletes a skill for an admin", %{admin_conn: conn} do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "ToDelete"})
      conn = delete(conn, ~p"/api/admin/skills/#{skill.id}")
      assert response(conn, 204)
      assert_raise Ecto.NoResultsError, fn -> Skills.get_skill!(skill.id) end
    end

    test "returns 404 for non-existent ID", %{admin_conn: conn} do
      conn = delete(conn, ~p"/api/admin/skills/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)["errors"]["detail"] == "Not Found"
    end

    test "returns 403 for a non-admin user", %{prof_conn: conn} do
      {:ok, skill} = Skills.create_master_skill(%{"name" => "CantDelete"})
      conn = delete(conn, ~p"/api/admin/skills/#{skill.id}")
      assert json_response(conn, 403)["errors"]["detail"]
    end
  end
end
