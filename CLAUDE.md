# CLAUDE.md

## What this is

A single-workspace CRM (Contacts, Deals pipeline, Notes, Tasks) with two roles (Admin/Member). Built with:

- Next.js 16.2.9 (App Router, plain JavaScript — not TypeScript)
- Tailwind CSS v4
- PostgreSQL via Prisma 6.19.3 (classic `prisma-client-js` generator, NOT the new `prisma-client` generator — see Gotchas)
- Auth0 via `@auth0/nextjs-auth0` v4.23.0

The app is fully built (all pages, Server Actions, and API routes from the original plan). Lint and `npm run build` both pass. **What's NOT done yet: the local Postgres container has never been migrated, and Auth0 credentials have never been filled in, so the app has never been run live end-to-end.**

## Resume steps after a PC restart

Work was paused mid-setup because WSL2 needed enabling (requires a restart) and the Auth0 CLI device login was never completed. Do these in order:

### 1. Verify Docker Desktop is actually running

Docker Desktop and its CLI are installed (`C:\Program Files\Docker\Docker\`). Before the restart, its Linux engine couldn't start because WSL2 wasn't enabled. If `wsl --install` was run in an elevated terminal and the PC restarted, the engine should now start automatically when Docker Desktop launches.

Check:
```powershell
docker ps
```
If that errors, open Docker Desktop manually and wait for it to say "running," or re-check `wsl --status`.

### 2. Start local Postgres

```bash
cd "C:\Users\runes\OneDrive\Desktop\MyAIProjects\Web Development"
docker compose up -d
```

This matches the `DATABASE_URL` already set in `.env` (user `crm_user`, db `crm_dev`, port 5432).

### 3. Get Auth0 credentials into `.env`

`.env` currently has empty placeholders for `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`. Two ways to fill them in:

**Option A — manually via Auth0 Dashboard** (simplest, no CLI needed):
1. Go to https://manage.auth0.com, create a **Regular Web Application**.
2. Set Allowed Callback URLs to `http://localhost:3000/auth/callback`.
3. Set Allowed Logout URLs to `http://localhost:3000`.
4. Copy Domain / Client ID / Client Secret from the app's Settings tab into `.env`.
5. Generate `AUTH0_SECRET` with `openssl rand -hex 32` (or any 32-byte hex string).

**Option B — Auth0 CLI** (was in progress, not completed):
- Binary is at `C:\Users\runes\auth0-cli\auth0.exe` (downloaded from the official GitHub releases, not installed via a package manager — not on PATH).
- Run `& "C:\Users\runes\auth0-cli\auth0.exe" login --no-input` (the `--no-input` flag is required — the interactive arrow-key picker doesn't work in this non-TTY shell). It prints a URL + one-time code; open the URL in a browser and approve it with your Auth0 account.
- After login succeeds, create the app with the CLI (e.g. `auth0 apps create --name CRM --type regular --callbacks http://localhost:3000/auth/callback --logout-urls http://localhost:3000`) and copy the resulting domain/client id/secret into `.env`.

### 4. Install deps and migrate

```bash
npm install
npx prisma migrate dev --name init
```

### 5. Run it

```bash
npm run dev
```

Visit http://localhost:3000, sign up — your account becomes the first Admin automatically (see `lib/auth.js`).

### 6. Verification checklist

1. Sign up as user A → confirm `users` table has 1 row with `role = ADMIN` (`npx prisma studio`).
2. Create a contact, a deal on that contact, a note, and a task.
3. Change the deal's stage via the dropdown on the deal detail page; confirm it persists.
4. Log out, sign up as user B → confirm `role = MEMBER` and `/admin/users` is hidden/blocked for them.
5. As user A, promote user B to Admin from `/admin/users`.
6. Try deleting a contact that has a deal — should be blocked with an error banner (FK `Restrict`).

## Architecture notes (for continuing development)

- **Route structure**: authenticated pages live under `app/(app)/` (route group, doesn't affect URLs), gated by `app/(app)/layout.js` calling `requireUser()`. Public landing is `app/page.js`. API routes are under `app/api/*/route.js`.
- **Mutations**: forms use Server Actions (`app/(app)/<feature>/actions.js`) that call Prisma directly — no self-fetching of the API. The few interactive widgets that need instant feedback without a full form submit (deal stage select, task status checkbox, admin role select) are small Client Components that `fetch()` the actual `app/api/*` REST routes.
- **Auth**: `lib/auth0.js` creates the `Auth0Client`. `proxy.js` (NOT `middleware.js` — see Gotchas) wires it into the request pipeline. `lib/auth.js` has the page-level helpers (`requireUser`, `requireAdmin`, redirect on failure) and API-level helpers (`requireApiUser`, `requireApiAdmin`, `handleApiError`, throw/catch `HttpError` for JSON error responses).
- **Role sync**: first Auth0 user ever to log in becomes `ADMIN`; everyone after is `MEMBER` (`getOrCreateUser` in `lib/auth.js`). No Auth0 Action/Rule needed — it's all in our own `users` table.
- **Prisma client**: generated to the default `node_modules/@prisma/client` location, imported as `import { PrismaClient } from "@prisma/client"` in `lib/db.js` (singleton pattern, cached on `globalThis` in dev).

## Gotchas hit while building this (don't redo this work)

- **This project scaffolded onto Next.js 16.2.9**, which is newer than typical model training data and ships its own breaking-changes warning (`AGENTS.md` in the repo root, generated by `create-next-app`). Key changes already accounted for in this codebase:
  - `middleware.js` is renamed to `proxy.js` (named export `proxy` instead of `middleware`). Both still work but `middleware.js` is deprecated. This repo uses `proxy.js`.
  - `params` and `searchParams` are `Promise`s everywhere (pages, layouts, route handlers) — always `await` them. Already done throughout this codebase.
  - Turbopack is the default bundler now; no flags needed.
- **Prisma's new `prisma-client` generator outputs raw `.ts` source files**, which a plain-JS Next.js project can't import without a TypeScript build step. This broke the build once. Fixed by using the classic `provider = "prisma-client-js"` generator in `prisma/schema.prisma`, which compiles to plain JS in `node_modules/@prisma/client` as normal. If you ever see `Module not found: Can't resolve '@/app/generated/prisma'`, this is why — don't switch generators without also handling the TS output.
- **Prisma 6.19.3 still generates a `prisma.config.js`** (config moved out of `schema.prisma` itself, a v7-style change that was backported into late 6.x). This repo's `prisma.config.js` loads `DATABASE_URL` via `dotenv/config` from `.env` (not `.env.local` — Prisma CLI only auto-loads `.env`, so `.env` is the single source of truth here for both Prisma CLI and Next.js).
- **Docker wasn't installed on this machine** — installed via `winget install -e --id Docker.DockerDesktop`. Its Linux engine then failed to start because **WSL2 wasn't enabled**, which requires an elevated `wsl --install` and a reboot — can't be done non-interactively without admin rights.
- **Auth0 CLI isn't distributed via winget/npm** — downloaded the Windows x86_64 binary directly from `https://github.com/auth0/auth0-cli/releases` (currently v1.32.0) to `C:\Users\runes\auth0-cli\auth0.exe`. Its `login` command's interactive account-type picker doesn't work in a non-TTY shell; use `--no-input` to skip straight to the device-code (browser) flow.
