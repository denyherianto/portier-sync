# Portier Sync

Integration management dashboard for monitoring, syncing, and resolving data conflicts between local and external systems.

## Features

- View and manage integrations with real-time sync status
- Trigger syncs and track sync history per integration
- Automatic conflict detection using string similarity (Jaro-Winkler, threshold 0.7)
- Conflict resolution UI — choose local, incoming, or a custom value per field
- Date fields are excluded from conflict detection and always auto-applied

## Stack

- [Next.js 16](https://nextjs.org/) — App Router, Route Handlers
- [Drizzle ORM](https://orm.drizzle.team/) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — local SQLite database
- [TanStack Query v5](https://tanstack.com/query) — data fetching and mutations
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env.local

# Generate and run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_PATH` | Path to the SQLite database file | `./data/portier-sync.db` |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL (empty = same origin) | `` |

## Database

```bash
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:studio     # Open Drizzle Studio (database browser)
```

## Docker

```bash
# Copy and configure env
cp .env.example .env.local

# Build and run
docker compose up --build
```

The SQLite database is persisted in a named Docker volume (`db_data`).
