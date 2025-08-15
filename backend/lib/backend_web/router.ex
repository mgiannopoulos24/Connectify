defmodule BackendWeb.Router do
  use BackendWeb, :router

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

  pipeline :ensure_admin do
    plug BackendWeb.Plugs.EnsureAdminPlug
  end

  scope "/api", BackendWeb do
    pipe_through :api

    get "/users/me", UserController, :me
    get "/health", HealthController, :index
    resources "/users", UserController, except: [:new, :edit, :create]

    # Authentication routes
    post "/register", UserController, :create
    post "/login", SessionController, :create
    delete "/logout", SessionController, :delete

    # Other resources
    resources "/job_experiences", JobExperienceController, except: [:new, :edit]
    resources "/educations", EducationController, except: [:new, :edit]
    resources "/skills", SkillController, except: [:new, :edit]
    resources "/interests", InterestController, only: [:create], as: :interest

    # Posts
    resources "/posts", PostController, except: [:new, :edit]
    post "/posts/:id/react", PostController, :react
    delete "/posts/:id/react", PostController, :remove_reaction
    post "/posts/:id/comments", PostController, :create_comment

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
    post "/email/confirm", EmailConfirmationController, :create

    # Admin routes
    scope "/admin", Admin, as: :admin do
      pipe_through :ensure_admin

      get "/users", UserController, :index
      get "/users/:id", UserController, :show
      put "/users/:id/role", UserController, :update_role
      get "/statistics", DashboardController, :index
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
