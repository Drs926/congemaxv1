# LOCAL DEV RUNBOOK

## Prerequisites
- Node 22+
- PostgreSQL user-mode installed in `_pg`
- `.env` with:
  - `DATABASE_URL`
  - `JWT_SECRET`

## Configure Local Postgres Path
1. Copy `scripts/local.dev.example.json` to `scripts/local.dev.json`.
2. Set `pg_base` in `scripts/local.dev.json`.

## Start
`npm run dev:up`

## Stop
`npm run dev:down`

## Reset DB
`npm run dev:reset`

## Verification
`curl http://localhost:3001/health`
