## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/Simply-Adam/First-CRUD-App.git
cd First-CRUD-App
```

### 2. Create the environment file

Copy `.env.example` and rename the copy to `.env`.

The environment variables used are:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/tasks
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=tasks
```

Replace `YOUR_PASSWORD` with the password you want to use for the local database.

### 3. Start the application

```bash
docker compose up
```

Docker Compose starts both the Express API and PostgreSQL database.

The API is available at:

```text
http://localhost:3000
```

Swagger documentation is available at:

```text
http://localhost:3000/docs
```



# Task API

This is a CRUD API built using Node.js and Express for creating and managing tasks.

The project originally used an in-memory list and was later moved to SQLite. The current version uses PostgreSQL running inside Docker.

Docker Compose is used to start both the Express API and PostgreSQL database with one command.

## Technologies Used

- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose
- Swagger UI
- node-postgres (`pg`)



## PostgreSQL with Docker

For this stage, PostgreSQL runs inside a Docker container with a named volume so the database can persist between container restarts.

Start the Postgres container with:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres:17
```

## Database Persistence

PostgreSQL uses a Docker named volume called `taskdata`. This allows the task data to survive when the containers are stopped and recreated.

For example, tasks created before running `docker compose down` are still available after running `docker compose up` again.

## Task Timestamps

Each task stores a `created_at` timestamp for when it was created and an `updated_at` timestamp for the last time it was modified.
