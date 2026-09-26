# Libra25 — School Library Management

A Next.js application for managing a school library: browsing a catalog, reserving copies, issuing and returning books, tracing copy history, and managing library users and feedback.

The application uses React, TypeScript, Tailwind CSS, Clerk authentication, Prisma/PostgreSQL, Meilisearch, and Cloudflare R2 for cover uploads.

## Application areas

- **Students:** catalog, book details, reservations, and loans.
- **Library assistants:** books, circulation desk, and history.
- **Administrators:** users, analytics, and feedback.

## Local setup

Use Node.js 22.12+, npm, a PostgreSQL database, and a Clerk development application. Configure Meilisearch for search and R2 for cover-image uploads.

1. Copy `.env.example` to `.env`.
2. **Uncomment the settings you use.** The committed template has all assignments commented out.
3. Set both `DATABASE_URL` and `DIRECT_URL` before installing dependencies. The runtime reads the first; Prisma configuration reads the second.
4. Set Clerk credentials and route configuration.

Minimal environment shape:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/libra25
DIRECT_URL=postgresql://user:password@localhost:5432/libra25
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Then, against a disposable local development database:

```sh
npm install
npm run db:push
npm run dev
```

Open `http://localhost:3000`. Installation generates the Prisma client. `db:push` synchronizes the schema; review schema changes before using any database command on existing data.

## Integrations

| Configuration | Used for |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | Runtime PostgreSQL access and Prisma tooling |
| Clerk keys and `CLERK_WEBHOOK_SECRET` | Authentication and `/api/webhooks/clerk` user synchronization |
| `MEILISEARCH_HOST`, `MEILISEARCH_MASTER_KEY` | Server-side book search and indexing |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cover storage and public cover URLs |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Contact/feedback delivery |

For local development, the two database URLs can reference the same PostgreSQL instance. Configure Clerk's webhook to reach `/api/webhooks/clerk` when testing user synchronization. Privileged roles must be provisioned consistently with the application's database and Clerk claims.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply development migrations |
| `npm run db:push` | Synchronize a development schema |
| `npm run db:seed` | Run the seed script; inspect it before use |
| `npm run db:studio` | Browse database records |

## Structure

- `app/` — public/authenticated routes, server actions, and API handlers.
- `components/modules/` — library feature interfaces.
- `lib/services/` — domain operations.
- `lib/schemas/` — input validation.
- `lib/search/` and `lib/storage/` — search and object-storage integrations.
- `prisma/schema.prisma` — data model.
- `context-library/` — project context and architecture notes.

No automated test script is declared in this published revision. Build and lint are useful development checks, but real Clerk, database, search, and upload workflows need integration verification with configured services.

See [LICENSE](LICENSE).
