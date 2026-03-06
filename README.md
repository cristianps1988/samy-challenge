# User & Posts Management Portal

Fullstack application for managing users and posts. Integrates with the [ReqRes](https://reqres.in) mock API to browse and import external users, then allows creating and managing posts authored by those saved users.

**Live backend**: `https://ejkct87811.execute-api.us-east-1.amazonaws.com`
**Live frontend**: `https://samy-challenge.vercel.app`

---

## Features

- **Authentication** — Login via ReqRes credentials, backend issues a signed JWT
- **Users** — Browse ReqRes users (paginated), import them to local DB, view saved users
- **Posts** — Full CRUD with pagination; posts require a saved user as author

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Package manager | pnpm 9 (workspaces) |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Query |
| Backend | Express 5, TypeScript, Clean Architecture |
| Database | PostgreSQL 16 (Docker for dev, Neon for production) |
| ORM / Query builder | Knex.js |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) |
| Testing | Vitest, Supertest (backend), React Testing Library (frontend) |
| Deploy | Serverless Framework + serverless-http → AWS Lambda |

---

## Architecture

The backend follows a **Simplified Clean Architecture** with a global Registry pattern for dependency management.

```
backend/src/
├── core/              # Domain entities — pure TypeScript, zero dependencies
├── application/       # Ports (interfaces) + Use Cases (business logic)
├── infrastructure/    # Express HTTP, Knex repositories, ReqRes adapter, Registry
└── shared/            # AppError hierarchy, ApiResponse factory
```

**Dependency rule**: `Infrastructure → Application → Core`. The application layer only accesses infrastructure through the `Registry` singleton.

The frontend is **feature-based**:

```
frontend/src/
├── app/               # Next.js App Router pages (thin — compose from features/)
├── components/        # Reusable UI primitives and layout components
├── features/          # auth/, users/, posts/ — each owns components, hooks, API functions
└── lib/               # api-client (fetch wrapper with token injection), utils
```

---

## Prerequisites

- Node.js 20 (`nvm use` — `.nvmrc` provided)
- pnpm 9 (`npm install -g pnpm`)
- Docker (for local PostgreSQL)

---

## Local Setup

```bash
git clone https://github.com/cristianps1988/samy-challenge
cd samy-challenge

# Install all workspace dependencies
pnpm install

# Configure environment
cp .env.example .env                          # root (Docker + shared vars)
cp backend/.env.example backend/.env          # backend-specific vars
cp frontend/.env.example frontend/.env.local  # frontend vars
# Edit each file with your values — see Environment Variables section below

# Start PostgreSQL
docker-compose up -d db

# Run database migrations
pnpm --filter backend db:migrate

# (Optional) Seed demo data
pnpm --filter backend db:seed

# Start both frontend and backend in dev mode
pnpm dev
```

The frontend will be at `http://localhost:3000` and the backend at `http://localhost:3001`.

**Test credentials**: `eve.holt@reqres.in` / `cityslicka`

---

## Running Tests

```bash
# All tests (backend + frontend)
pnpm test

# Backend only (42 tests across 6 files)
pnpm --filter backend test

# Frontend only (42 tests across 2 files)
pnpm --filter frontend test
```

---

## Deploy

### Backend — Automatic (GitHub Actions → AWS Lambda)

Every push to `main` that touches `backend/**` triggers the workflow at `.github/workflows/deploy-backend.yml`. It installs dependencies and runs `serverless deploy --stage prod` automatically.

Required GitHub secrets:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM credentials |
| `DATABASE_URL` | Production PostgreSQL (Neon) connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | Token expiration (e.g. `24h`) |
| `REQRES_BASE_URL` | ReqRes API base URL |
| `REQRES_API_KEY` | ReqRes API key |

To deploy manually:

```bash
cd backend
npx serverless deploy
```

### Frontend — Vercel

The frontend is deployed on Vercel connected to this repository. Deployments trigger automatically on push to `main`. Set `NEXT_PUBLIC_API_URL` to the Lambda URL in the Vercel project environment variables.

---

## Environment Variables

All variables live in a single `.env` at the project root (Docker + backend share it; frontend uses `NEXT_PUBLIC_API_URL`).

| Variable | Description | Example | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/user_posts_portal` | Yes |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | `a-very-long-secret-key-change-this` | Yes |
| `JWT_EXPIRATION` | JWT expiration duration | `24h` | No (default: `24h`) |
| `REQRES_BASE_URL` | ReqRes API base URL | `https://reqres.in/api` | No (default provided) |
| `REQRES_API_KEY` | ReqRes API key | `reqres_8162ed84...` | Yes |
| `PORT` | Backend HTTP port | `3001` | No (default: `3001`) |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` | No (default: `*`) |
| `NODE_ENV` | Environment | `development` | No |
| `NEXT_PUBLIC_API_URL` | Backend URL for the frontend | `http://localhost:3001/api` | Yes (frontend) |

---

## API Documentation (Swagger)

Interactive OpenAPI documentation is served at `/api/docs` (Swagger UI).

- **Live**: [https://ejkct87811.execute-api.us-east-1.amazonaws.com/api/docs](https://ejkct87811.execute-api.us-east-1.amazonaws.com/api/docs)
- **Local**: `http://localhost:3001/api/docs`

The spec is hand-authored using `openapi-types` and served via `swagger-ui-express`. Every endpoint is documented with request/response schemas, authentication requirements, and example payloads.

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/login` | No | Login via ReqRes, returns JWT |
| `POST` | `/api/users/import/:id` | Yes | Import a ReqRes user to local DB |
| `GET` | `/api/users/saved` | Yes | List locally saved users |
| `GET` | `/api/users/saved/:id` | Yes | Get a saved user by ID |
| `DELETE` | `/api/users/saved/:id` | Yes | Delete a saved user |
| `POST` | `/api/posts` | Yes | Create a post |
| `GET` | `/api/posts` | Yes | List posts (paginated: `?page=1&limit=10`) |
| `GET` | `/api/posts/:id` | Yes | Get post with author details |
| `PUT` | `/api/posts/:id` | Yes | Update a post |
| `DELETE` | `/api/posts/:id` | Yes | Delete a post |

### Response format

```json
{ "success": true, "data": { ... }, "meta": { ... } }
{ "success": false, "error": { "message": "...", "details": [...] } }
```

### Quick usage example

```bash
# Login
TOKEN=$(curl -s -X POST https://ejkct87811.execute-api.us-east-1.amazonaws.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eve.holt@reqres.in","password":"cityslicka"}' | jq -r '.data.token')

# Import user #1
curl -X POST https://ejkct87811.execute-api.us-east-1.amazonaws.com/api/users/import/1 \
  -H "Authorization: Bearer $TOKEN"

# Create a post
curl -X POST https://ejkct87811.execute-api.us-east-1.amazonaws.com/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first post","content":"Hello world content here","authorId":1}'
```

---

## Database Scripts

```bash
pnpm --filter backend db:migrate    # Run pending migrations
pnpm --filter backend db:seed       # Insert demo data
pnpm --filter backend db:rollback   # Rollback last migration batch
pnpm --filter backend db:reset      # Rollback all + re-migrate
```
