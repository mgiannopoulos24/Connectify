defmodule BackendWeb.Admin.DashboardJSONTest do
  use Backend.DataCase, async: true

  alias BackendWeb.Admin.DashboardJSON

  describe "index/1" do
    test "renders dashboard statistics correctly" do
      stats = %{
        total_users: 150,
        accepted_connections: 320,
        total_job_postings: 45,
        total_posts: 1200
      }

      result = DashboardJSON.index(%{stats: stats})

      assert result == %{
               data: %{
                 "total_users" => 150,
                 "accepted_connections" => 320,
                 "total_job_postings" => 45,
                 "total_posts" => 1200
               }
             }
    end

    test "renders correctly when all statistics are zero" do
      stats = %{
        total_users: 0,
        accepted_connections: 0,
        total_job_postings: 0,
        total_posts: 0
      }

      result = DashboardJSON.index(%{stats: stats})

      assert result == %{
               data: %{
                 "total_users" => 0,
                 "accepted_connections" => 0,
                 "total_job_postings" => 0,
                 "total_posts" => 0
               }
             }
    end
  end
end
