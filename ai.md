backend/mix.exs:
````elixir
defmodule Backend.MixProject do
  use Mix.Project

  def project do
    [
      app: :backend,
      version: "0.1.0",
      elixir: "~> 1.15",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      compilers: [:phoenix_live_view] ++ Mix.compilers(),
      listeners: [Phoenix.CodeReloader]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Backend.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  def cli do
    [
      preferred_envs: [precommit: :test]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.8.0"},
      {:phoenix_ecto, "~> 4.5"},
      {:ecto_sql, "~> 3.13"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:phoenix_live_view, "~> 1.1.0"},
      {:lazy_html, ">= 0.1.0", only: :test},
      {:phoenix_live_dashboard, "~> 0.8.3"},
      {:esbuild, "~> 0.10", runtime: Mix.env() == :dev},
      {:tailwind, "~> 0.3", runtime: Mix.env() == :dev},
      {:heroicons,
       github: "tailwindlabs/heroicons",
       tag: "v2.2.0",
       sparse: "optimized",
       app: false,
       compile: false,
       depth: 1},
      {:swoosh, "~> 1.16"},
      {:req, "~> 0.5"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.26"},
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.2.0"},
      {:bandit, "~> 1.5"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["tailwind backend", "esbuild backend"],
      "assets.deploy": [
        "tailwind backend --minify",
        "esbuild backend --minify",
        "phx.digest"
      ],
      precommit: ["compile --warning-as-errors", "deps.unlock --unused", "format", "test"]
    ]
  end
end

````

backend/.formatter.exs:
````elixir
[
  import_deps: [:ecto, :ecto_sql, :phoenix],
  subdirectories: ["priv/*/migrations"],
  plugins: [Phoenix.LiveView.HTMLFormatter],
  inputs: ["*.{heex,ex,exs}", "{config,lib,test}/**/*.{heex,ex,exs}", "priv/*/seeds.exs"]
]

````

backend/priv/repo/seeds.exs:
````elixir
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

````

backend/priv/repo/migrations/20250807173129_create_users.exs:
````elixir
defmodule Backend.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :name, :string
      add :surname, :string
      add :password_hash, :string
      add :phone_number, :string
      add :photo_url, :string

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end

````

backend/priv/repo/migrations/.formatter.exs:
````elixir
[
  import_deps: [:ecto_sql],
  inputs: ["*.exs"]
]

````

backend/priv/repo/migrations/20250807173422_add_role_to_users.exs:
````elixir
defmodule Backend.Repo.Migrations.AddRoleToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :role, :string, null: false, default: "professional"
    end
  end
end

````

backend/test/test_helper.exs:
````elixir
ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Backend.Repo, :manual)

````

backend/test/backend/accounts_test.exs:
````elixir
defmodule Backend.AccountsTest do
  use Backend.DataCase

  alias Backend.Accounts

  describe "users" do
    alias Backend.Accounts.User

    import Backend.AccountsFixtures

    @invalid_attrs %{
      name: nil,
      email: nil,
      surname: nil,
      password_hash: nil,
      phone_number: nil,
      photo_url: nil,
      role: nil
    }

    test "list_users/0 returns all users" do
      user = user_fixture()
      assert Accounts.list_users() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      valid_attrs = %{
        name: "some name",
        email: "some email",
        surname: "some surname",
        password_hash: "some password_hash",
        phone_number: "some phone_number",
        photo_url: "some photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.create_user(valid_attrs)
      assert user.name == "some name"
      assert user.email == "some email"
      assert user.surname == "some surname"
      assert user.password_hash == "some password_hash"
      assert user.phone_number == "some phone_number"
      assert user.photo_url == "some photo_url"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()

      update_attrs = %{
        name: "some updated name",
        email: "some updated email",
        surname: "some updated surname",
        password_hash: "some updated password_hash",
        phone_number: "some updated phone_number",
        photo_url: "some updated photo_url"
      }

      assert {:ok, %User{} = user} = Accounts.update_user(user, update_attrs)
      assert user.name == "some updated name"
      assert user.email == "some updated email"
      assert user.surname == "some updated surname"
      assert user.password_hash == "some updated password_hash"
      assert user.phone_number == "some updated phone_number"
      assert user.photo_url == "some updated photo_url"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)
      assert user == Accounts.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end
end

````

backend/test/backend_web/controllers/page_controller_test.exs:
````elixir
defmodule BackendWeb.PageControllerTest do
  use BackendWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "Peace of mind from prototype to production"
  end
end

````

backend/test/backend_web/controllers/error_html_test.exs:
````elixir
defmodule BackendWeb.ErrorHTMLTest do
  use BackendWeb.ConnCase, async: true

  # Bring render_to_string/4 for testing custom views
  import Phoenix.Template, only: [render_to_string: 4]

  test "renders 404.html" do
    assert render_to_string(BackendWeb.ErrorHTML, "404", "html", []) == "Not Found"
  end

  test "renders 500.html" do
    assert render_to_string(BackendWeb.ErrorHTML, "500", "html", []) == "Internal Server Error"
  end
end

````

backend/test/backend_web/controllers/error_json_test.exs:
````elixir
defmodule BackendWeb.ErrorJSONTest do
  use BackendWeb.ConnCase, async: true

  test "renders 404" do
    assert BackendWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert BackendWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end

````

backend/test/backend_web/controllers/user_controller_test.exs:
````elixir
defmodule BackendWeb.UserControllerTest do
  use BackendWeb.ConnCase

  import Backend.AccountsFixtures

  @create_attrs %{
    name: "some name",
    email: "some email",
    surname: "some surname",
    password_hash: "some password_hash",
    phone_number: "some phone_number",
    photo_url: "some photo_url"
  }
  @update_attrs %{
    name: "some updated name",
    email: "some updated email",
    surname: "some updated surname",
    password_hash: "some updated password_hash",
    phone_number: "some updated phone_number",
    photo_url: "some updated photo_url"
  }
  @invalid_attrs %{
    name: nil,
    email: nil,
    surname: nil,
    password_hash: nil,
    phone_number: nil,
    photo_url: nil
  }

  describe "index" do
    test "lists all users", %{conn: conn} do
      conn = get(conn, ~p"/users")
      assert html_response(conn, 200) =~ "Listing Users"
    end
  end

  describe "new user" do
    test "renders form", %{conn: conn} do
      conn = get(conn, ~p"/users/new")
      assert html_response(conn, 200) =~ "New User"
    end
  end

  describe "create user" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/users", user: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == ~p"/users/#{id}"

      conn = get(conn, ~p"/users/#{id}")
      assert html_response(conn, 200) =~ "User #{id}"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/users", user: @invalid_attrs)
      assert html_response(conn, 200) =~ "New User"
    end
  end

  describe "edit user" do
    setup [:create_user]

    test "renders form for editing chosen user", %{conn: conn, user: user} do
      conn = get(conn, ~p"/users/#{user}/edit")
      assert html_response(conn, 200) =~ "Edit User"
    end
  end

  describe "update user" do
    setup [:create_user]

    test "redirects when data is valid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/users/#{user}", user: @update_attrs)
      assert redirected_to(conn) == ~p"/users/#{user}"

      conn = get(conn, ~p"/users/#{user}")
      assert html_response(conn, 200) =~ "some updated email"
    end

    test "renders errors when data is invalid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/users/#{user}", user: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit User"
    end
  end

  describe "delete user" do
    setup [:create_user]

    test "deletes chosen user", %{conn: conn, user: user} do
      conn = delete(conn, ~p"/users/#{user}")
      assert redirected_to(conn) == ~p"/users"

      assert_error_sent 404, fn ->
        get(conn, ~p"/users/#{user}")
      end
    end
  end

  defp create_user(_) do
    user = user_fixture()

    %{user: user}
  end
end

````

backend/test/support/data_case.ex:
````elixir
defmodule Backend.DataCase do
  @moduledoc """
  This module defines the setup for tests requiring
  access to the application's data layer.

  You may define functions here to be used as helpers in
  your tests.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use Backend.DataCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      alias Backend.Repo

      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Backend.DataCase
    end
  end

  setup tags do
    Backend.DataCase.setup_sandbox(tags)
    :ok
  end

  @doc """
  Sets up the sandbox based on the test tags.
  """
  def setup_sandbox(tags) do
    pid = Ecto.Adapters.SQL.Sandbox.start_owner!(Backend.Repo, shared: not tags[:async])
    on_exit(fn -> Ecto.Adapters.SQL.Sandbox.stop_owner(pid) end)
  end

  @doc """
  A helper that transforms changeset errors into a map of messages.

      assert {:error, changeset} = Accounts.create_user(%{password: "short"})
      assert "password is too short" in errors_on(changeset).password
      assert %{password: ["password is too short"]} = errors_on(changeset)

  """
  def errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {message, opts} ->
      Regex.replace(~r"%{(\w+)}", message, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end

````

backend/test/support/conn_case.ex:
````elixir
defmodule BackendWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use BackendWeb.ConnCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # The default endpoint for testing
      @endpoint BackendWeb.Endpoint

      use BackendWeb, :verified_routes

      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import BackendWeb.ConnCase
    end
  end

  setup tags do
    Backend.DataCase.setup_sandbox(tags)
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end
end

````

backend/test/support/fixtures/accounts_fixtures.ex:
````elixir
defmodule Backend.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Backend.Accounts` context.
  """

  @doc """
  Generate a unique user email.
  """
  def unique_user_email, do: "some email#{System.unique_integer([:positive])}"

  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        name: "some name",
        password_hash: "some password_hash",
        phone_number: "some phone_number",
        photo_url: "some photo_url",
        surname: "some surname"
      })
      |> Backend.Accounts.create_user()

    user
  end
end

````

backend/config/runtime.exs:
````elixir
import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# ## Using releases
#
# If you use `mix release`, you need to explicitly enable the server
# by passing the PHX_SERVER=true when you start it:
#
#     PHX_SERVER=true bin/backend start
#
# Alternatively, you can use `mix phx.gen.release` to generate a `bin/server`
# script that automatically sets the env var above.
if System.get_env("PHX_SERVER") do
  config :backend, BackendWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :backend, Backend.Repo,
    # ssl: true,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    # For machines with several cores, consider starting multiple pools of `pool_size`
    # pool_count: 4,
    socket_options: maybe_ipv6

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :backend, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :backend, BackendWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/bandit/Bandit.html#t:options/0
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # ## SSL Support
  #
  # To get SSL working, you will need to add the `https` key
  # to your endpoint configuration:
  #
  #     config :backend, BackendWeb.Endpoint,
  #       https: [
  #         ...,
  #         port: 443,
  #         cipher_suite: :strong,
  #         keyfile: System.get_env("SOME_APP_SSL_KEY_PATH"),
  #         certfile: System.get_env("SOME_APP_SSL_CERT_PATH")
  #       ]
  #
  # The `cipher_suite` is set to `:strong` to support only the
  # latest and more secure SSL ciphers. This means old browsers
  # and clients may not be supported. You can set it to
  # `:compatible` for wider support.
  #
  # `:keyfile` and `:certfile` expect an absolute path to the key
  # and cert in disk or a relative path inside priv, for example
  # "priv/ssl/server.key". For all supported SSL configuration
  # options, see https://hexdocs.pm/plug/Plug.SSL.html#configure/1
  #
  # We also recommend setting `force_ssl` in your config/prod.exs,
  # ensuring no data is ever sent via http, always redirecting to https:
  #
  #     config :backend, BackendWeb.Endpoint,
  #       force_ssl: [hsts: true]
  #
  # Check `Plug.SSL` for all available options in `force_ssl`.

  # ## Configuring the mailer
  #
  # In production you need to configure the mailer to use a different adapter.
  # Here is an example configuration for Mailgun:
  #
  #     config :backend, Backend.Mailer,
  #       adapter: Swoosh.Adapters.Mailgun,
  #       api_key: System.get_env("MAILGUN_API_KEY"),
  #       domain: System.get_env("MAILGUN_DOMAIN")
  #
  # Most non-SMTP adapters require an API client. Swoosh supports Req, Hackney,
  # and Finch out-of-the-box. This configuration is typically done at
  # compile-time in your config/prod.exs:
  #
  #     config :swoosh, :api_client, Swoosh.ApiClient.Req
  #
  # See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.
end

````

backend/config/test.exs:
````elixir
import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :backend, Backend.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "backend_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :backend, BackendWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "DTgXr6YlwpqyNIR2DDX5Btn2OVfjruDYudGraQqAu/oVboze6520rqH4cvfiLVnb",
  server: false

# In test we don't send emails
config :backend, Backend.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Enable helpful, but potentially expensive runtime checks
config :phoenix_live_view,
  enable_expensive_runtime_checks: true

````

backend/config/config.exs:
````elixir
# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :backend,
  ecto_repos: [Backend.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :backend, BackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: BackendWeb.ErrorHTML, json: BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Backend.PubSub,
  live_view: [signing_salt: "h9or58C9"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :backend, Backend.Mailer, adapter: Swoosh.Adapters.Local

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.25.4",
  backend: [
    args:
      ~w(js/app.js --bundle --target=es2022 --outdir=../priv/static/assets/js --external:/fonts/* --external:/images/* --alias:@=.),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => [Path.expand("../deps", __DIR__), Mix.Project.build_path()]}
  ]

# Configure tailwind (the version is required)
config :tailwind,
  version: "4.1.7",
  backend: [
    args: ~w(
      --input=assets/css/app.css
      --output=priv/static/assets/css/app.css
    ),
    cd: Path.expand("..", __DIR__)
  ]

# Configures Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"

````

backend/config/prod.exs:
````elixir
import Config

# Note we also include the path to a cache manifest
# containing the digested version of static files. This
# manifest is generated by the `mix assets.deploy` task,
# which you should run after static files are built and
# before starting your production server.
config :backend, BackendWeb.Endpoint, cache_static_manifest: "priv/static/cache_manifest.json"

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Req

# Disable Swoosh Local Memory Storage
config :swoosh, local: false

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.

````

backend/config/dev.exs:
````elixir
import Config

# Configure your database
config :backend, Backend.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "backend_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we can use it
# to bundle .js and .css sources.
config :backend, BackendWeb.Endpoint,
  # Binding to loopback ipv4 address prevents access from other machines.
  # Change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  # http: [ip: {127, 0, 0, 1}, port: String.to_integer(System.get_env("PORT") || "4000")],
  https: [
    port: 4001,
    # It's good practice to add the IP here too
    ip: {127, 0, 0, 1},
    cipher_suite: :strong,
    keyfile: "priv/cert/selfsigned_key.pem",
    certfile: "priv/cert/selfsigned.pem"
  ],
  check_origin: false,
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "IC5nDqbP37VWnhMkQB2sH0mdjtrJRmyMeJuENvpHjWNfX88odmzotGmV/QS340uh",
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:backend, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:backend, ~w(--watch)]}
  ]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :backend, BackendWeb.Endpoint,
  live_reload: [
    web_console_logger: true,
    patterns: [
      ~r"priv/static/(?!uploads/).*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/backend_web/(?:controllers|live|components|router)/?.*\.(ex|heex)$"
    ]
  ]

# Enable dev routes for dashboard and mailbox
config :backend, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :default_formatter, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :phoenix_live_view,
  # Include debug annotations and locations in rendered markup.
  # Changing this configuration will require mix clean and a full recompile.
  debug_heex_annotations: true,
  debug_attributes: true,
  # Enable helpful, but potentially expensive runtime checks
  enable_expensive_runtime_checks: true

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false

````

frontend/postcss.config.js:
````javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

````

frontend/vite.config.ts:
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },      
})

````

frontend/eslint.config.js:
````javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

````

frontend/src/main.tsx:
````typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

````

frontend/src/vite-env.d.ts:
````typescript
/// <reference types="vite/client" />

````

frontend/src/App.tsx:
````typescript
import Homepage from "./pages/Homepage"

function App() {

  return (
    <>
      <Homepage />
    </>
  )
}

export default App

````

frontend/src/pages/Welcome.tsx:
````typescript
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Network,
  Newspaper,
  Users,
  Briefcase,
  UserPlus,
  LogIn,
  Lightbulb,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";



// Placeholder for image assets
const placeholderImg = "https://via.placeholder.com/600x400";
const placeholderLogo = "https://via.placeholder.com/200x80";


const Welcome: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const navLinks = [
    { icon: Newspaper, text: "Articles", href: "#" },
    { icon: Users, text: "People", href: "#" },
    { icon: Briefcase, text: "Jobs", href: "#" },
  ];

  const features = [
      {
        icon: Users,
        title: "Networking",
        description: "Expand your professional network and connect with like-minded individuals.",
      },
      {
        icon: Briefcase,
        title: "Job Opportunities",
        description: "Discover new job opportunities and connect with potential employers.",
      },
      {
        icon: Lightbulb,
        title: "Professional Growth",
        description: "Access resources and tools to develop your skills and advance your career.",
      },
      {
        icon: Bookmark,
        title: "Personalized Feed",
        description: "Stay up-to-date with the latest industry news and discussions.",
      },
  ];

  const customerLogos = [
    { src: placeholderLogo, alt: "Konami Logo" },
    { src: placeholderLogo, alt: "Sony Logo" },
    { src: placeholderLogo, alt: "Nintendo Logo" },
    { src: placeholderLogo, alt: "Ghostbusters Logo" },
    { src: placeholderLogo, alt: "Nord Logo" },
    { src: placeholderLogo, alt: "Sklavos Logo" },
    { src: placeholderLogo, alt: "ForAllSecure Logo" },
    { src: placeholderLogo, alt: "Fsociety Logo" },
    { src: placeholderLogo, alt: "Allsafe Logo" },
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2 text-2xl font-bold">
              <Network className="text-blue-600" />
              <span>Connectify</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4">
              {navLinks.map((link) => (
                <a key={link.text} href={link.href} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600">
                  <link.icon className="w-5 h-5" />
                  <span>{link.text}</span>
                </a>
              ))}
              <div className="flex items-center gap-2 pl-4">
                 <Button variant="default" className="rounded-full" onClick={handleSignUp}>
                   <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                 </Button>
                 <Button variant="outline" className="rounded-full" onClick={handleSignIn}>
                   <LogIn className="mr-2 h-4 w-4" /> Sign In
                 </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-200">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-50 border-t border-gray-200">
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                 <a key={link.text} href={link.href} className="flex items-center gap-3 p-2 text-gray-600 rounded-md hover:bg-gray-100">
                   <link.icon className="w-5 h-5" />
                   <span>{link.text}</span>
                 </a>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-2 flex flex-col gap-3">
                 <Button variant="default" className="w-full" onClick={handleSignUp}>
                   <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                 </Button>
                 <Button variant="outline" className="w-full" onClick={handleSignIn}>
                   <LogIn className="mr-2 h-4 w-4" /> Sign In
                 </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Connect and Grow Your Network
                    </h1>
                    <p className="text-lg text-gray-500 mb-8">
                        Connectify is the premier professional networking platform for building meaningful connections and advancing your career.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                        {features.map((feature) => (
                           <div key={feature.title}>
                                <div className="flex items-center gap-3 mb-2">
                                    <feature.icon className="w-8 h-8 text-blue-500" />
                                    <h6 className="font-semibold text-lg">{feature.title}</h6>
                                </div>
                                <p className="text-gray-500">{feature.description}</p>
                           </div>
                        ))}
                    </div>
                     <div className="flex justify-center md:justify-start">
                        <Button variant="outline" className="w-full sm:w-auto">Learn More</Button>
                    </div>
                </div>
                 <div>
                    <img src={placeholderImg} alt="Professional networking" className="rounded-lg shadow-lg" />
                </div>
            </div>
        </section>

        {/* Customers Section */}
        <section ref={formRef} className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-12">Trusted by Leading Companies</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
                    {customerLogos.map((logo, index) => (
                        <div key={index} className="flex justify-center grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                             <img src={logo.src} alt={logo.alt} className="h-12 w-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <h6 className="font-bold mb-3">Company</h6>
                    <nav className="flex flex-col gap-2">
                        <a href="#" className="text-gray-500 hover:text-blue-600">About Us</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Careers</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">News</a>
                    </nav>
                </div>
                 <div className="col-span-2 md:col-span-1">
                    <h6 className="font-bold mb-3">Products</h6>
                     <nav className="flex flex-col gap-2">
                        <a href="#" className="text-gray-500 hover:text-blue-600">Networking</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Job Search</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Talent Solutions</a>
                    </nav>
                </div>
                 <div className="col-span-2 md:col-span-1">
                    <h6 className="font-bold mb-3">Resources</h6>
                     <nav className="flex flex-col gap-2">
                        <a href="#" className="text-gray-500 hover:text-blue-600">Blog</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Help Center</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Webinars</a>
                    </nav>
                </div>
                 <div className="col-span-2 md:col-span-1">
                    <h6 className="font-bold mb-3">Legal</h6>
                     <nav className="flex flex-col gap-2">
                        <a href="#" className="text-gray-500 hover:text-blue-600">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Terms of Service</a>
                    </nav>
                </div>
                 <div className="col-span-2 md:col-span-1">
                    <h6 className="font-bold mb-3">Contact</h6>
                     <nav className="flex flex-col gap-2">
                        <a href="#" className="text-gray-500 hover:text-blue-600">Support</a>
                        <a href="#" className="text-gray-500 hover:text-blue-600">Partnerships</a>
                    </nav>
                </div>
            </div>
             <div className="text-center text-gray-400 border-t mt-8 pt-6">
                <p>© {new Date().getFullYear()} Connectify. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
````

frontend/src/pages/RegisterPage.jsx:
````javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConnectdevelop } from '@fortawesome/free-brands-svg-icons';
import { Button, Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('/api/auth/register', formData);
      // Redirect to login page or another page after successful registration
      navigate('/login');
    } catch (err) {
      setErrorMessage('Registration failed');
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const backToWelcome = () => {
    navigate('/');
  };

  return (
    <>
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#" className="ms-4 fw-bolder fs-3" onClick={backToWelcome}>
            <span><FontAwesomeIcon icon={faConnectdevelop} /></span> Connectify
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="w-100 p-4 border rounded" style={{ maxWidth: '400px' }}>
          <h2 className="text-left mb-4 fw-bold">Register</h2>
          {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
          <div className='d-flex flex-column align-items-center'>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 mb-2 w-100' id="continue-btn">
              <i className="fab fa-google me-2"></i>Continue with Google
            </Button>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 w-100' id="continue-btn">
              <i className='fab fa-apple me-2'></i>Continue with Apple
            </Button>
          </div>
          <div className='d-flex align-items-center my-3'>
            <div className='flex-grow-1 border-top'></div>
            <span className='mx-3 text-muted'>OR</span>
            <div className='flex-grow-1 border-top'></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                name="username"
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                className={`btn btn-light position-absolute top-50 end-0 rounded-pill text-dark px-2 py-1 border fw-bold`}
                style={{ right: '5px', fontSize: '0.75rem', transform: 'translateY(-50%)'}} 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                className={`btn btn-light position-absolute top-50 end-0 rounded-pill text-dark px-2 py-1 border fw-bold`}
                style={{ right: '5px', fontSize: '0.75rem', transform: 'translateY(-50%)'}} 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Button type="submit" className="btn btn-primary w-100 mt-3 rounded-pill">Register</Button>
          </form>
        </div>
      </Container>
      <div className="w-100 text-center mt-3">
        Already have an account? <Link to="/login" className='text-decoration-none fw-bold'>Sign In</Link>
      </div>
    </>
  );
};

export default RegisterPage;

````

frontend/src/pages/Login.jsx:
````javascript
import { React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faConnectdevelop} from "@fortawesome/free-brands-svg-icons";
import { Button, Container, Navbar } from 'react-bootstrap';
import axios from 'axios';
import './styles/styles.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      // Save the JWT token in local storage or context
      localStorage.setItem('token', res.data.token);
      // Redirect to homepage or another page
      navigate('/homepage');
    } catch (err) {
      setErrorMessage('Invalid email or password');
      console.error(err);
    }
  };

  const backToWelcome = () => {
    navigate('/');
  };

  return (
    <>
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#" className="ms-4 fw-bolder fs-3" onClick={backToWelcome}>
            <span><FontAwesomeIcon icon={faConnectdevelop}/></span> Connectify
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="w-100 p-4 border rounded" style={{ maxWidth: '400px' }}>
          <h2 className="text-left mb-4 fw-bold">Log In</h2>
          <div className='d-flex flex-column align-items-center'>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 mb-2 w-100' id="continue-btn">
              <i className="fab fa-google me-2"></i>Continue with Google
            </Button>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 w-100' id="continue-btn">
              <i className='fab fa-apple me-2'></i>Continue with Apple
            </Button>
          </div>
          <div className='d-flex align-items-center my-3'>
            <div className='flex-grow-1 border-top'></div>
            <span className='mx-3 text-muted'>OR</span>
            <div className='flex-grow-1 border-top'></div>
          </div>
          {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                className={`btn btn-light position-absolute top-50 end-0 rounded-pill text-dark px-2 py-1 border fw-bold`}
                style={{ right: '5px', fontSize: '0.75rem', transform: 'translateY(-50%)'}} 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="w-100 text-left mt-3 py-0 mt-0">
              <Link to="/forgot-password" className='text-muted text-decoration-none' style={{ fontSize: '12px' }}>Forgot Password?</Link>
            </div>
            <Button type="submit" className="btn btn-primary w-100 mt-3 rounded-pill">Log In</Button>
          </form>
        </div>
      </Container>
      <div className="w-100 text-center mt-3">
        Don’t have an account? <Link to="/register" className='text-decoration-none fw-bold'>Register</Link>
      </div>
    </>
  );
};

export default LoginPage;

````

frontend/src/pages/JobListings.jsx:
````javascript
import React from 'react';

const JobListingsPage = () => {
  return (
    <div className="container mt-5">
      <h2>Job Listings</h2>
      {/* Display job listings */}
    </div>
  );
};

export default JobListingsPage;

````

frontend/src/pages/Notifications.jsx:
````javascript
import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="container mt-5">
      <h2>Notifications</h2>
      {/* Display notifications */}
    </div>
  );
};

export default NotificationsPage;

````

frontend/src/pages/Settings.jsx:
````javascript
import React from 'react';

const SettingsPage = () => {
  return (
    <div className="container mt-5">
      <h2>Settings</h2>
      {/* Settings form */}
    </div>
  );
};

export default SettingsPage;

````

frontend/src/pages/NetworkPage.jsx:
````javascript
import React from 'react';

const NetworkPage = () => {
  return (
    <div className="container mt-5">
      <h2>Network</h2>
      {/* Display connections and search bar */}
    </div>
  );
};

export default NetworkPage;

````

frontend/src/pages/Profile.jsx:
````javascript
import React from 'react';

const ProfilePage = () => {
  return (
    <div className="container mt-5">
      <h2>Profile</h2>
      {/* Display user information */}
    </div>
  );
};

export default ProfilePage;

````

frontend/src/pages/Messaging.jsx:
````javascript
import React from 'react';

const MessagingPage = () => {
  return (
    <div className="container mt-5">
      <h2>Messages</h2>
      {/* Display messages */}
    </div>
  );
};

export default MessagingPage;

````

frontend/src/pages/Homepage.tsx:
````typescript
import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className="container mt-5">
      <h2>Home</h2>
      {/* Timeline with posts */}
    </div>
  );
};

export default Homepage;
````



Εδώ είναι ο κώδικας μου σχετικά με την εργασία που σου δείχνω στο PDF. Θέλω να ξαναγράψεις την σελίδα του Register και να φτιάξεις τα αντίστοιχα endpoints στο backend για να λειτουργεί σωστά. Επίσης αξιοποίησε tailwind, shadcn components και lucide icons για να είναι πιο όμορφο το UI. 