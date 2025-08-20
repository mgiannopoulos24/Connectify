defmodule BackendWeb.Router do
  use BackendWeb, :router

  defmodule Plugs.EnsureConfirmed do
    import Plug.Conn
    # import Phoenix.Controller, only: [json: 2, halt: 1]

    def init(opts), do: opts

    def call(conn, _opts) do
      case conn.assigns[:current_user] do
        # This plug only acts if a user is assigned
        %Backend.Accounts.User{status: "pending_confirmation"} ->
          conn
          |> put_status(:forbidden)
          |> json(%{errors: %{detail: "Please confirm your email to continue."}})
          |> halt()

        _ ->
          conn
      end
    end
  end

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {BackendWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug BackendWeb.Plugs.AuthPlug
  end

  pipeline :api_confirmed do
    plug Plugs.EnsureConfirmed
  end

  pipeline :ensure_admin do
    plug BackendWeb.Plugs.EnsureAdminPlug
  end

  scope "/api", BackendWeb do
    pipe_through :api

    # --- Public / Pre-confirmation routes ---
    get "/health", HealthController, :index
    post "/register", UserController, :create
    post "/login", SessionController, :create
    delete "/logout", SessionController, :delete
    post "/email/confirm", EmailConfirmationController, :create
    post "/email/confirm/cancel", EmailConfirmationController, :cancel

    # --- Authenticated & Confirmed routes ---
    pipe_through :api_confirmed

    get "/users/me", UserController, :me
    put "/users/me/security", UserController, :update_security
    get "/users/search", UserController, :search
    resources "/users", UserController, except: [:new, :edit, :create]

    # Other resources
    resources "/job_experiences", JobExperienceController, except: [:new, :edit]
    resources "/educations", EducationController, except: [:new, :edit]
    resources "/skills", SkillController, except: [:new, :edit]
    resources "/interests", InterestController, only: [:create], as: :interest
    # Company search for autocomplete
    resources "/companies", CompanyController, only: [:index], as: :company

    # Posts
    resources "/posts", PostController, except: [:new, :edit]
    post "/posts/upload_image", PostController, :upload_image
    post "/posts/upload_video", PostController, :upload_video
    post "/posts/:id/react", PostController, :react
    delete "/posts/:id/react", PostController, :remove_reaction
    get "/posts/:id/reactions", PostController, :reactions
    post "/posts/:id/comments", PostController, :create_comment
    post "/posts/:post_id/comments/:comment_id/like", PostController, :like_comment
    delete "/posts/:post_id/comments/:comment_id/like", PostController, :unlike_comment
    post "/posts/:id/send", PostController, :send_post

    # Connections
    get "/connections", ConnectionController, :index
    get "/connections/pending", ConnectionController, :pending
    post "/connections", ConnectionController, :create
    put "/connections/:id/accept", ConnectionController, :accept
    put "/connections/:id/decline", ConnectionController, :decline

    # Chat
    post "/chat", ChatController, :create
    get "/chat/:chat_room_id/messages", ChatController, :index
    post "/chat/upload_image", ChatController, :upload_image

    # Notifications
    get "/notifications", NotificationController, :index
    put "/notifications/mark_as_read", NotificationController, :mark_as_read

    # Job Postings & Applications
    resources "/job_postings", JobPostingController, except: [:new, :edit]
    post "/job_postings/:id/apply", JobPostingController, :apply
    get "/job_postings/:id/applications", JobPostingController, :applications
    put "/job_applications/:id/review", JobApplicationController, :review

    # Recommendations
    # get "/recommendations/connections", RecommendationController, :connections
    # get "/recommendations/jobs", RecommendationController, :jobs

    # Admin routes
    scope "/admin", Admin, as: :admin do
      pipe_through :ensure_admin

      get "/users", UserController, :index
      get "/users/export", UserController, :export
      get "/users/:id", UserController, :show
      put "/users/:id/role", UserController, :update_role
      get "/statistics", DashboardController, :index
      resources "/companies", CompanyController, except: [:new, :edit]
      resources "/skills", SkillController, except: [:new, :edit]
      resources "/job_postings", JobPostingController, except: [:new, :edit]
      get "/job_applications", JobApplicationController, :index
    end
  end

  if Application.compile_env(:backend, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: BackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end