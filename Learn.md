# Learn.md

A walkthrough of how this CRM app is built, for anyone (including future you) ramping up on the codebase.

## Stack

- **Next.js 16.2.9** (App Router, plain JavaScript) — frontend and backend in one app
- **Tailwind CSS v4** — styling
- **Recharts** — the dashboard charts
- **Prisma 6.19.3 + PostgreSQL** — database layer
- **Auth0** (`@auth0/nextjs-auth0`) — login/sessions
- Hosted on **Vercel**, database on **Supabase** (via Vercel Storage)

## How the pages are organized

- `app/page.js` — public landing page (Sign up / Log in). Checks for a session and redirects to `/dashboard` if you're already logged in.
- `app/(app)/` — everything behind login lives here (the `(app)` folder name doesn't show up in the URL, it's just a grouping). `app/(app)/layout.js` calls `requireUser()` before rendering anything inside, which is the actual gate — no session, no access. It wraps pages in `AppShell` (the navbar + colored background shown everywhere once logged in).
  - `dashboard/`, `contacts/`, `deals/`, `tasks/`, `admin/users/` — one folder per feature, each with a `page.js`. Nested folders like `contacts/[id]/edit/` map straight to `/contacts/:id/edit`.
- `app/api/*/route.js` — REST endpoints (`/api/contacts`, `/api/deals`, etc.), used only by the few widgets that need instant feedback (deal stage dropdown, task checkbox) without a full page reload.

## How data moves

- **Reads**: pages are Server Components — they call Prisma (`lib/db.js`) directly inside the page function, no fetch involved. That's how the dashboard pulls contact counts, deal totals, and the chart data (`db.deal.groupBy`, `db.task.count`).
- **Writes**: forms submit to **Server Actions** (`actions.js` next to each page) that call Prisma directly too — no API round-trip for normal create/edit/delete.
- **Exceptions**: the handful of one-click toggles (stage select, task done checkbox, admin role select) are small Client Components that `fetch()` the REST routes in `app/api/`, since they need to update without a full form submit.

## Auth flow

`proxy.js` (Next 16's renamed `middleware.js`) intercepts every request and hands it to the Auth0 SDK, which owns `/auth/login`, `/auth/callback`, `/auth/logout`. On first login, `lib/auth.js` creates a matching row in the app's own `User` table — first person ever to sign in becomes Admin, everyone else is Member. That row (not the Auth0 session) is what every page actually checks for role-gating (e.g. hiding `/admin/users` from Members).

## The dashboard charts

The dashboard page runs two extra Prisma `groupBy`/`count` queries (deal value per stage, task open/done counts), then hands that plain data down to `PipelineChart` and `TaskStatusChart` (`components/dashboard/`) — both Client Components, since Recharts renders to SVG in the browser and can't run as a Server Component.

## Deployment

See [CLAUDE.md](CLAUDE.md) for the full deployment setup, environment variables, and gotchas hit while standing this up (Vercel/Supabase env var quirks, Auth0 callback URL issues, etc.).
