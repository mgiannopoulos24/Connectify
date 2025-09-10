# Connectify

## Description
Connectify is a full-stack, LinkedIn-inspired professional networking application. It was developed as a final project for the "Internet Application Technologies" course at the Department of Informatics & Telecommunications. The platform allows users to create professional profiles, build a network of connections, share articles, post and apply for jobs, and communicate through private messages.

The project is composed of a backend REST API built with the **Elixir/Phoenix** framework and a modern frontend client built with **React and TypeScript**.

## Key Features
### For Professionals:
- **User Authentication**: Secure user registration and login system using JWT (JSON Web Tokens) stored in secure, HTTP-only cookies.
- **Profile Management**: Users can create and manage their professional profile, including details about their education, work experience, and skills.
- **Professional Networking**: Search for other professionals, send/accept/reject connection requests, and view your network.
- **Content Feed**: A central timeline where users can:
    - Post articles with text, images, and videos.
    - View posts from their connections in a chronological feed.
    - Interact with posts by liking and commenting.
- **Job Board**:
    - Post new job opportunities.
    - View and search for job listings.
    - Apply for jobs.
    - [Bonus] Receive personalized job recommendations based on skills and network data, powered by a Matrix Factorization algorithm.
- **Private Messaging**: Engage in one-on-one private conversations with connections.
- **Notifications**: Receive alerts for new connection requests, likes, and comments.
### For Administrators:
- **User Management**: A dedicated admin panel to view and manage all registered users on the platform.
- **Data Export**: Ability to export user data (biographical info, posts, experience, network) in XML and JSON formats.
### Advanced Features:
- **Recommendation System**: [Bonus] The feed is enhanced with a recommendation algorithm (Matrix Factorization implemented from scratch) to suggest relevant articles and content, even from users outside one's immediate network.

## Technologies
### Backend:
- **Framework**: Phoenix Framework
- **Language**: Elixir
- **Database**: PostgreSQL
- **Authentication**: Joken for JWT authentication
- **Hashing**: Argon2
- **Real-time Communication**: Phoenix Channels 

### Frontend:
- **Framework**: React
- **Language**: TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **GIPHY Integration**: Giphy API for GIF support 
- **HTTP Client**: Axios

## Project Setup
### Prerequisites
- Elixir & Mix
- Node.js and npm
- PostgreSQL
- Docker
### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Create a `.env` file inside the `backend` directory and add your database and JWT secret key. You can copy the structure from `.env.example`, or create it with the following content:
```bash
# Example for local development
JWT_SECRET_KEY=your_super_secret_key_generated_with_mix_phx.gen.secret_64
DATABASE_URL=ecto://postgres:postgres@localhost:5432/backend_dev
```
3. Install dependencies:
```bash
mix deps.get
```
4. Create and migrate the database:
```bash
mix ecto.setup
mix ecto.migrate
```
5. Generate a self-signed SSL certificate for local development:
```bash
mix phx.gen.cert 
```

6. Start the Phoenix server:
```bash
mix phx.server
```

The backend will be available at `https://localhost:4000`.

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Create a `.env` file inside the `frontend` directory and add your Giphy API key. You can copy the structure from `.env.example`, or create it with the following content:
```bash
VITE_GIPHY_API_KEY=your_giphy_api_key
# You can get a Giphy API key by signing up at https://developers.giphy.com/
```
3. Install dependencies:
```bash
npm install
```
4. Start the development server:
```bash
npm run dev
```

The frontend application will be running at `https://localhost:5173` (or another available port). It is pre-configured to proxy API requests to the backend.


## Docker Setup
You can also run the application using Docker and Docker Compose. This setup includes both the backend and frontend services, along with a PostgreSQL database.

1. Ensure you have Docker and Docker Compose installed on your machine.
2. Create a `.env` file in the root directory with the necessary environment variables as described in the `.env.example`.
3. Copy both the self-signed certificate and key files generated in the backend setup step to the `frontend/cert` directory. These files are required for HTTPS in the frontend service.
4. Build and start the services:
```bash
# This should take about 30-40 minutes cause of the manual tailwind installation
docker-compose up --build
```
5. The backend will be available at `https://localhost:4000` and the frontend at `https://localhost:8443`.

## Contributing

Contributions are welcome. To contribute, follow these steps:

- Report issues or request features by opening an issue with a clear title, steps to reproduce, and relevant logs or screenshots.
- Fork the repository and create a descriptive branch:
```bash
git checkout -b feat/short-description
```
or 
```bash
git checkout -b fix/short-description
```
- Keep changes focused and add tests for new behavior where appropriate.
- Follow project formatting and linting:
  - Backend: run mix format and existing test suite (mix test).
  - Frontend: run eslint/prettier and the frontend test commands.
- Open a pull request with a description of the change, related issue (if any), and testing steps. Maintainers will review and request changes if needed.
- Ensure CI passes before merge.