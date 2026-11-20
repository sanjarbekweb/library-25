# Libra25 — School Library Management

A school library platform: browsing a catalog, reserving copies, issuing and returning books, tracing copy history, and managing library users and feedback.

The repository is split into two independently installed packages:

| Package | Stack | Default port |
| --- | --- | --- |
| [`frontend/`](frontend) | Next.js 16 (App Router), React 19, Tailwind CSS, Clerk, TanStack Query | `3000` |
| [`backend/`](backend) | Express 5 REST API (`/api/v1/*`), Prisma 7 + PostgreSQL, Clerk bearer-token auth | `4000` |

The backend owns the Prisma schema and migrations (`backend/prisma/`). During the ongoing migration (see [plans](frontend/context-library/plans.md), Units 17–21) some frontend server components still read the database directly; the frontend therefore generates its Prisma client from `../backend/prisma/schema.prisma`.

## Application areas

- **Students:** catalog, book details, reservations, and loans.
- **Library assistants:** books, circulation desk, and history.
- **Administrators:** users, analytics, and feedback.

## Local setup

Use Node.js 22.12+, npm, a PostgreSQL database, and a Clerk development application. Configure Meilisearch for search and R2 for cover-image uploads.

### 1. Backend

```sh
cd backend
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, Clerk keys, CORS_ORIGIN
npm install               # also runs `prisma generate`
npm run db:push           # disposable development database only
npm run dev               # http://localhost:4000/api/health
```

### 2. Frontend

```sh
cd frontend
cp .env.example .env      # uncomment the settings you use
npm install               # generates the Prisma client from ../backend/prisma
npm run dev               # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env` if the backend is not on `http://localhost:4000/api/v1`.

Review schema changes before running any database command against existing data.

## Integrations

| Configuration | Used for |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | Runtime PostgreSQL access and Prisma tooling (backend; frontend until U-21) |
| Clerk keys | Authentication in both packages; `CLERK_WEBHOOK_SECRET` for `/api/webhooks/clerk` |
| `CORS_ORIGIN` | Browser origins allowed to call the backend |
| `NEXT_PUBLIC_API_URL` | Backend base URL used by the frontend |
| `MEILISEARCH_HOST`, `MEILISEARCH_MASTER_KEY` | Server-side book search and indexing |
| `R2_*` | Cover storage and public cover URLs |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Contact/feedback delivery |

## Commands

| Package | Command | Purpose |
| --- | --- | --- |
| backend | `npm run dev` | API with file watching |
| backend | `npm run build` / `npm start` | Compile to `dist/` and serve it |
| backend | `npm run typecheck` | TypeScript check |
| backend | `npm run db:generate` / `db:migrate` / `db:push` / `db:seed` / `db:studio` | Prisma tooling |
| frontend | `npm run dev` | Next.js development server |
| frontend | `npm run build` / `npm start` | Production build and serve |
| frontend | `npm run typecheck` / `npm run lint` | TypeScript check / ESLint |
| frontend | `npm run test:*` | Node test suites (see `frontend/package.json`); database suites require an isolated `_test` database |

## Structure

- `backend/src/` — `routes/` → `controllers/` → `services/` → `repositories/`, plus `schemas/` (Zod), `middlewares/` (auth, errors).
- `backend/prisma/` — data model, migrations and seed.
- `frontend/app/` — public/authenticated routes and remaining API handlers.
- `frontend/components/modules/` — library feature interfaces.
- `frontend/hooks/api/` — typed backend clients and React Query hooks.
- `frontend/lib/` — legacy services/schemas still used by server components during migration.
- `frontend/context-library/` — project context, architecture, plans and progress tracker.

See [LICENSE](LICENSE).
