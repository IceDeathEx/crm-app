# CLAUDE.md

## What this is

A single-workspace CRM (Contacts, Deals pipeline, Notes, Tasks) with two roles (Admin/Member). Built with:

- Next.js 16.2.9 (App Router, plain JavaScript — not TypeScript)
- Tailwind CSS v4
- PostgreSQL via Prisma 6.19.3 (classic `prisma-client-js` generator, NOT the new `prisma-client` generator — see Gotchas)
- Auth0 via `@auth0/nextjs-auth0` v4.23.0
- Recharts for dashboard charts

The app is fully built and **deployed live**:

- **Production**: https://crm-app-pi-one.vercel.app
- **Repo**: https://github.com/IceDeathEx/crm-app (pushed from this local clone, not yet connected for git-based auto-deploy — see Deployment below)
- **Hosting**: Vercel (`taneekongnicholas-3062s-projects/crm-app` project)
- **Database**: Postgres via Vercel Storage, provisioned through the Supabase marketplace integration (free tier)
- **Auth**: Auth0 tenant `dev-6e3f7mbiu8jgqntc.us.auth0.com`, app configured with both local and production callback/logout URLs

Local dev also works end-to-end (Docker Postgres + `.env`), see Local development below.

## Local development

```bash
cd "C:\Users\runes\OneDrive\Desktop\MyAIProjects\Web Development"
docker compose up -d        # local Postgres, matches DATABASE_URL in .env
npm install
npx prisma migrate dev      # only needed after schema changes
npm run dev
```

Visit http://localhost:3000. `.env` already has real Auth0 credentials and `DATABASE_URL` filled in (gitignored — see `.env.example` for the shape). The first account ever to sign up becomes Admin automatically (`lib/auth.js`).

## Deployment

Deploys are currently manual via the Vercel CLI, run from this local clone:

```bash
npx vercel --prod
```

This builds remotely on Vercel and runs the `vercel-build` script (see `package.json`), which generates the Prisma client and runs `prisma migrate deploy` against production *before* `next build` — so schema migrations ship automatically on every deploy, no separate migration step needed.

To get git-push-triggered auto-deploy instead of manual `vercel --prod`, connect GitHub under the Vercel account's Login Connections (Settings → Login Connections → Connect GitHub), then `vercel link` will be able to attach the GitHub repo for CI/CD. Not yet done — optional.

### Production environment variables

Set via `vercel env add <NAME> production` (or the dashboard). Current vars:

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` — same shape as local `.env`, but `APP_BASE_URL` is the production URL.
- `DATABASE_URL` is deliberately **not** set in Vercel — see Gotchas for why, and how `lib/db.js` / `vercel-build` route around it.

### Auth0 production config

The Auth0 app (`CRM`, client id `0nBpd3gcYfRaXv9RMQs97zdhx3rMcvhP`) has both environments registered:
- Allowed Callback URLs: `http://localhost:3000/auth/callback`, `https://crm-app-pi-one.vercel.app/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`, `https://crm-app-pi-one.vercel.app`

If you ever see "Callback URL mismatch," it's almost always a stale-alias issue, not a real config bug — see the Gotcha below before touching Auth0 settings.

## Architecture notes (for continuing development)

- **Route structure**: authenticated pages live under `app/(app)/` (route group, doesn't affect URLs), gated by `app/(app)/layout.js` calling `requireUser()`. Public landing is `app/page.js`. API routes are under `app/api/*/route.js`.
- **Mutations**: forms use Server Actions (`app/(app)/<feature>/actions.js`) that call Prisma directly — no self-fetching of the API. The few interactive widgets that need instant feedback without a full form submit (deal stage select, task status checkbox, admin role select) are small Client Components that `fetch()` the actual `app/api/*` REST routes.
- **Auth**: `lib/auth0.js` creates the `Auth0Client`. `proxy.js` (NOT `middleware.js` — see Gotchas) wires it into the request pipeline. `lib/auth.js` has the page-level helpers (`requireUser`, `requireAdmin`, redirect on failure) and API-level helpers (`requireApiUser`, `requireApiAdmin`, `handleApiError`, throw/catch `HttpError` for JSON error responses).
- **Role sync**: first Auth0 user ever to log in becomes `ADMIN`; everyone after is `MEMBER` (`getOrCreateUser` in `lib/auth.js`). No Auth0 Action/Rule needed — it's all in our own `users` table. `getOrCreateUser` does a create-then-fallback-to-fetch on a unique constraint conflict, since concurrent requests (e.g. browser prefetch right after login) can race to insert the same user.
- **Prisma client**: generated to the default `node_modules/@prisma/client` location, imported as `import { PrismaClient } from "@prisma/client"` in `lib/db.js` (singleton pattern, cached on `globalThis` in dev). `lib/db.js` passes an explicit `datasourceUrl` falling back from `DATABASE_URL` to `POSTGRES_PRISMA_URL` — see Gotchas.
- **Dashboard charts**: `components/dashboard/*` are Client Components wrapping Recharts; the dashboard page (Server Component) does the Prisma `groupBy` queries and passes plain data down as props.

## Gotchas hit while building this (don't redo this work)

- **This project scaffolded onto Next.js 16.2.9**, which is newer than typical model training data and ships its own breaking-changes warning (`AGENTS.md` in the repo root, generated by `create-next-app`). Key changes already accounted for in this codebase:
  - `middleware.js` is renamed to `proxy.js` (named export `proxy` instead of `middleware`). Both still work but `middleware.js` is deprecated. This repo uses `proxy.js`.
  - `params` and `searchParams` are `Promise`s everywhere (pages, layouts, route handlers) — always `await` them. Already done throughout this codebase.
  - Turbopack is the default bundler now; no flags needed.
- **Prisma's new `prisma-client` generator outputs raw `.ts` source files**, which a plain-JS Next.js project can't import without a TypeScript build step. This broke the build once. Fixed by using the classic `provider = "prisma-client-js"` generator in `prisma/schema.prisma`, which compiles to plain JS in `node_modules/@prisma/client` as normal. If you ever see `Module not found: Can't resolve '@/app/generated/prisma'`, this is why — don't switch generators without also handling the TS output.
- **Prisma 6.19.3 still generates a `prisma.config.js`** (config moved out of `schema.prisma` itself, a v7-style change that was backported into late 6.x). This repo's `prisma.config.js` loads `DATABASE_URL` via `dotenv/config` from `.env` locally (Prisma CLI only auto-loads `.env`, not `.env.local`).
- **Vercel's Supabase Postgres integration injects `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`, never `DATABASE_URL`**, and these are marked "Sensitive" so the CLI/API can never read their values back once set (write-only — they still work fine at runtime, you just can't `vercel env pull` them). Worked around without ever needing to see the actual secret value:
  - `lib/db.js` passes `datasourceUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL` explicitly to `PrismaClient`, so the deployed app uses the pooled connection at runtime.
  - `package.json`'s `vercel-build` script does `export DATABASE_URL=$POSTGRES_URL_NON_POOLING && prisma generate && prisma migrate deploy && next build` — the direct (non-pooled) connection is required for migrations, and `prisma.config.js`'s `env("DATABASE_URL")` throws at config-load time if `DATABASE_URL` is completely unset, so it has to be exported for the whole chain, not just the migrate step.
- **`vercel --prod` CLI deploys were uploading the local `.env` into the remote build sandbox** despite `.env*` being in `.gitignore` (visible as a `Detected .env file, it is strongly recommended to use Vercel's env handling instead` warning in build logs). Root-caused as: it was the only thing letting `prisma generate` not crash (see above), not an actual leak vector beyond that. Fixed properly by exporting `DATABASE_URL` in `vercel-build` instead of relying on it, and added `.vercelignore` (`.env`, `.env.*`) as defense in depth regardless of root cause.
- **"Callback URL mismatch" / "The state parameter is missing" on Auth0 login in production** — not a real config bug both times we hit it:
  - Callback URL mismatch: the Allowed Callback URLs field hadn't actually been saved yet, or had been overwritten instead of appended to.
  - State parameter missing: Vercel auto-generates several alias hostnames per project (e.g. `crm-app-taneekongnicholas-3062s-projects.vercel.app`, plus a unique URL per deployment). The Auth0 OAuth transaction cookie is host-scoped — if you start the login flow on one alias and `APP_BASE_URL`/the registered callback URL points to a different one, the cookie set during `/auth/login` never reaches `/auth/callback`. Always start from the canonical `https://crm-app-pi-one.vercel.app`, not a bookmarked alias or old tab.
- **Docker wasn't installed on this machine originally** — installed via `winget install -e --id Docker.DockerDesktop`. Its Linux engine then failed to start because **WSL2 wasn't enabled**, which required an elevated `wsl --install` and a reboot. Resolved; Docker Desktop now starts normally. (The post-reboot Ubuntu *distro* download via `wsl --install` separately got stuck at 0% due to `wsldownload.azureedge.net` being unreachable on this network — irrelevant to Docker, which manages its own `docker-desktop`/`docker-desktop-data` WSL distros and doesn't need the Ubuntu one.)
- **Auth0 CLI isn't distributed via winget/npm** — downloaded the Windows x86_64 binary directly from `https://github.com/auth0/auth0-cli/releases` to `C:\Users\runes\auth0-cli\auth0.exe`. Never got a working login in this environment (`--web` device flow consistently failed with "User is not authorized" for unclear reasons) — the Auth0 app was ultimately created manually via the dashboard instead. If retrying the CLI, be aware `gh`/`vercel`'s `--web` device flows hit a similar problem here: their post-auth interactive prompts (e.g. git-credential-helper selection) hang forever in this non-TTY shell. `gh auth login --with-token` (piping a PAT) and plain `vercel login` (which doesn't have a post-auth prompt) both worked; pick CLI auth modes that avoid interactive follow-up prompts.
- **A stray `.git` repository existed at `C:\Users\runes\.git`** (home directory root, zero commits, unrelated to this project) before this project had its own. It was deleted — any git command run from inside this project folder would otherwise have walked up to that repo instead of failing cleanly, risking an accidental `git add -A` committing the entire home directory.
