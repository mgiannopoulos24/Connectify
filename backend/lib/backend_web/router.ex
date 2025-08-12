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

    # Authenticated user routes (requires token)
    resources "/users", UserController, except: [:new, :edit, :create]

    # Registration (public route)
    post "/register", UserController, :create

    # Login route
    post "/login", SessionController, :create

    # Logout route
    delete "/logout", SessionController, :delete

    resources "/job_experiences", JobExperienceController, except: [:new, :edit]
    resources "/educations", EducationController, except: [:new, :edit]
    resources "/skills", SkillController, except: [:new, :edit]
    resources "/interests", InterestController, only: [:create], as: :interest

    post "/email/confirm", EmailConfirmationController, :create
  end

  scope "/api/admin", BackendWeb do
    # Apply both pipelines in order. First, authenticate the user (:api),
    # then check if they are an admin (:ensure_admin).
    pipe_through [:api, :ensure_admin]

    get "/users", AdminController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", BackendWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: BackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
