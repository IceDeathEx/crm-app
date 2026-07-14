# CLAUDE.md

## What this is

**SGMakanHealthy** — a Singapore food nutrition/review/comparison app. Users log in with a phone number + WhatsApp-delivered one-time code (no password, no email), browse 8 fixed Singapore dishes with micro-nutrition info, compare the same dish across different food stalls (price + a 1–5 star taste rating), read/write reviews (named or anonymous), customize a health-app-style profile (age/gender/height/weight/activity level), and snap/upload a photo to auto-identify a dish via an external food-recognition API.

Built with:

- Next.js 16.2.9 (App Router, plain JavaScript — not TypeScript)
- Tailwind CSS v4
- PostgreSQL via Prisma 6.19.3 (classic `prisma-client-js` generator, NOT the new `prisma-client` generator — see Gotchas)
- Phone number + WhatsApp OTP auth (own implementation, no third-party auth SDK — see Auth below)

This repo started as a CRM (Contacts/Deals/Notes/Tasks, Auth0 login) and was **fully repurposed** into this food app in one pass — see git history before the pivot commit for the old CRM code if you ever need to reference it. The old production CRM deployment/domain/Auth0 tenant referenced in earlier versions of this file no longer applies to this app; **re-deploy and re-point DNS/Auth0-equivalent config before treating any old URLs as live**.

Local dev works end-to-end (Docker Postgres + `.env`), see Local development below.

For a plain-language walkthrough of the stack and how pages/data/auth fit together, see [Learn.md](Learn.md).

## Local development

```bash
cd "C:\Users\runes\OneDrive\Desktop\MyAIProjects\Web Development"
docker compose up -d        # local Postgres, matches DATABASE_URL in .env
npm install
npx prisma migrate dev      # only needed after schema changes
npx prisma db seed          # (re)seeds the 8 dishes + sample stalls, safe to re-run
npm run dev
```

Visit http://localhost:3000. `.env` needs `DATABASE_URL` and `PHONE_VERIFY_SECRET` (generate with `openssl rand -hex 32`); `FOOD_RECOGNITION_API_KEY` is optional (see Gotchas). See `.env.example` for the shape. The first account ever to sign up becomes Admin automatically (`app/api/auth/signup/route.js`).

WhatsApp OTP delivery is **mocked** — `lib/sms.js` logs the code server-side and, outside production, echoes it back in the API response so the login UI can display it directly (no real WhatsApp message is sent). Swap `lib/sms.js`'s implementation for a real provider (e.g. Twilio WhatsApp API) when ready; nothing else in the auth flow needs to change.

## Deployment

Not yet re-deployed since the CRM → food app pivot. Deploying will need, at minimum:
- A fresh (or reset) Postgres database — the schema is unrelated to the old CRM schema, so an existing production DB with CRM data cannot be migrated in place (same `phone`/`username`-required-field issue as local dev, see Gotchas).
- `PHONE_VERIFY_SECRET` set in the hosting environment (was `AUTH0_*` before — those are gone).
- Optionally `FOOD_RECOGNITION_API_KEY` for real photo recognition (the app works fine without it — `/scan` falls back to manual dish selection).
- The rest of the previous Vercel/Prisma deployment mechanics (see Gotchas below) still apply as infrastructure and don't need to be redone: `vercel-build` script, `.vercelignore`, `lib/db.js`'s `POSTGRES_PRISMA_URL` fallback, etc.

## Architecture notes (for continuing development)

- **Route structure**: authenticated pages live under `app/(app)/` (route group, doesn't affect URLs), gated by `app/(app)/layout.js` calling `requireUser()`. Public landing is `app/page.js`. Auth pages live under `app/(auth)/` (e.g. `/login`). API routes are under `app/api/*/route.js`.
- **Mutations**: forms use Server Actions (`app/(app)/<feature>/actions.js`) that call Prisma directly — no self-fetching of the API. Small Client Components that need instant feedback without a full form submit (admin role select) `fetch()` the actual `app/api/*` REST routes instead.
- **Auth**: phone number + WhatsApp OTP, no third-party SDK.
  - `lib/phone.js` — E.164 validation.
  - `lib/otp.js` — generate/hash/rate-limit/consume OTP codes, backed by the `Otp` Prisma model.
  - `lib/sms.js` — WhatsApp send, currently mocked (see Local development above).
  - `lib/authToken.js` — short-lived HMAC token bridging "OTP verified" → "pick a username" during signup, so no server-side state is needed between those two steps.
  - `lib/auth.js` — `createSession`/`clearSession` (DB-backed `Session` table + httpOnly cookie, 30-day expiry), `getSessionUser()` (cached per-request), `requireUser`/`requireAdmin` (redirect on failure, for pages), `requireApiUser`/`requireApiAdmin` (throw `HttpError`, for API routes), `handleApiError` (maps `HttpError`/`ValidationError`/Prisma `P2003`/`P2025` to response codes).
  - Flow: `app/api/auth/otp/request` → `app/api/auth/otp/verify` → (existing user: session created, done) or (new phone: `app/api/auth/signup` with a chosen username completes account creation + session). UI is `components/auth/LoginForm.js`, a 3-step client state machine.
- **Role sync**: first user ever to sign up becomes `ADMIN`; everyone after is `USER`. Enforced in `app/api/auth/signup/route.js` via `db.user.count()`, with a P2002 race-condition fallback (concurrent signups for the same phone).
- **Prisma client**: generated to the default `node_modules/@prisma/client` location, imported as `import { PrismaClient } from "@prisma/client"` in `lib/db.js` (singleton pattern, cached on `globalThis` in dev). `lib/db.js` passes an explicit `datasourceUrl` falling back from `DATABASE_URL` to `POSTGRES_PRISMA_URL` — see Gotchas.
- **Domain model**: `Dish` (the 8 fixed dishes, with nutrition reference values — admin-editable but not creatable/deletable), `Stall` (food stalls), `StallDish` (join model — a specific dish at a specific stall, carries price, is what reviews attach to and what comparison tables list), `Review` (always has a `userId`; `isAnonymous` only controls display, so moderation/edit-your-own-review still works for anonymous posts).
- **Food recognition**: `lib/foodRecognition.js` calls the LogMeal API if `FOOD_RECOGNITION_API_KEY` is set, else immediately returns `{available: false}` — never crashes without a key. `lib/dishMatching.js` maps generic vision-API labels back to our 8 dish slugs via a synonym table (generic APIs won't return "char kway teow" verbatim). UI (`/scan`, `components/scan/ScanForm.js`) always offers a manual dish-picker fallback.
- **Visual design**: indigo/violet/fuchsia gradient accents (navbar logo chip, primary buttons, page background) — `lib/theme.js` holds the shared `ACCENT_GRADIENT`/`ACCENT_TEXT` lookup, `lib/format.js` holds domain-specific color helpers (`dishCategoryColor`, `starRatingColor`) following the same pattern.
- **Dish images**: `Dish.imageUrl` is currently unset for all seeded dishes — cards/detail pages fall back to a category-colored box with an emoji (`dishEmoji()` in `lib/format.js`). Drop real photos into `public/dishes/` and set `imageUrl` to replace, no code change needed.

## Gotchas hit while building this (don't redo this work)

- **This project scaffolded onto Next.js 16.2.9**, which is newer than typical model training data and ships its own breaking-changes warning (`AGENTS.md` in the repo root, generated by `create-next-app`). Key changes already accounted for in this codebase:
  - `middleware.js` is renamed to `proxy.js`. This app has **no `proxy.js` at all** — it was deleted in the CRM→food-app pivot. Auth0's SDK needed middleware to catch its own implicit `/auth/*` routes; this app's auth routes are explicit `app/api/auth/*` handlers and the gate is already at render time in `app/(app)/layout.js` via `requireUser()`, so no middleware is needed. Only add one back if you need edge-level interception for something new.
  - `params` and `searchParams` are `Promise`s everywhere (pages, layouts, route handlers) — always `await` them. Already done throughout this codebase.
  - Turbopack is the default bundler now; no flags needed.
- **Prisma's new `prisma-client` generator outputs raw `.ts` source files**, which a plain-JS Next.js project can't import without a TypeScript build step. This broke the build once (on the original CRM). Fixed by using the classic `provider = "prisma-client-js"` generator in `prisma/schema.prisma`, which compiles to plain JS in `node_modules/@prisma/client` as normal. If you ever see `Module not found: Can't resolve '@/app/generated/prisma'`, this is why — don't switch generators without also handling the TS output.
- **Prisma 6.19.3 still generates a `prisma.config.js`** (config moved out of `schema.prisma` itself, a v7-style change that was backported into late 6.x). This repo's `prisma.config.js` loads `DATABASE_URL` via `dotenv/config` from `.env` locally (Prisma CLI only auto-loads `.env`, not `.env.local`), and also declares the seed command (`seed: "node prisma/seed.js"`).
- **`prisma/seed.js` is written in CommonJS (`require`), not ESM**, deliberately — `package.json` has no `"type": "module"` (all the repo's config files use explicit `.mjs` extensions instead, e.g. `next.config.mjs`), so a plain `node prisma/seed.js` invocation (as run by `prisma db seed`) parses as CommonJS by default. Don't switch it to `import` syntax without also renaming the file or adding `"type": "module"` project-wide.
- **Reworking the schema after data already exists in the dev DB will hit Prisma's data-loss guard** — happened once when pivoting `User` from Auth0 fields to `phone`/`username` (both required, no default, existing rows). Prisma also refuses to run `migrate reset`/`migrate dev` destructive prompts non-interactively for AI agents without explicit user consent (`PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var) — this is intentional and correct behavior, not a bug to work around. When a schema pivot makes existing dev data incompatible, the fix is `prisma migrate reset` (after getting the user's explicit go-ahead — it's destructive) to wipe local dev data, then `prisma migrate dev` to (re)generate a clean migration history, then `prisma db seed`.
- **Vercel's Supabase Postgres integration injects `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`, never `DATABASE_URL`**, and these are marked "Sensitive" so the CLI/API can never read their values back once set (write-only — they still work fine at runtime, you just can't `vercel env pull` them). Worked around without ever needing to see the actual secret value:
  - `lib/db.js` passes `datasourceUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL` explicitly to `PrismaClient`, so the deployed app uses the pooled connection at runtime.
  - `package.json`'s `vercel-build` script does `export DATABASE_URL=$POSTGRES_URL_NON_POOLING && prisma generate && prisma migrate deploy && next build` — the direct (non-pooled) connection is required for migrations, and `prisma.config.js`'s `env("DATABASE_URL")` throws at config-load time if `DATABASE_URL` is completely unset, so it has to be exported for the whole chain, not just the migrate step. This mechanism is infra-level and unaffected by the CRM→food-app pivot.
- **`vercel --prod` CLI deploys were uploading the local `.env` into the remote build sandbox** despite `.env*` being in `.gitignore` (visible as a `Detected .env file, it is strongly recommended to use Vercel's env handling instead` warning in build logs). Root-caused as: it was the only thing letting `prisma generate` not crash (see above), not an actual leak vector beyond that. Fixed properly by exporting `DATABASE_URL` in `vercel-build` instead of relying on it, and added `.vercelignore` (`.env`, `.env.*`) as defense in depth regardless of root cause.
- **Nutrition reference values and dish images are placeholders**, not sourced from a verified nutrition database (e.g. Singapore HPB) or real photography — seeded in `prisma/seed.js` with plausible estimates so the app is fully functional end-to-end. Swap in real figures/photos later without any schema change (`prisma/seed.js`'s `DISHES` array and `Dish.imageUrl`, respectively).
- **Food recognition (`/scan`) has never been tested against a real API key** in this environment — `lib/foodRecognition.js` targets the LogMeal API but no `FOOD_RECOGNITION_API_KEY` has been obtained yet. Verified only that the no-key graceful-fallback path works (`{available: false}`, manual picker shown, no crash). Get a real key before trusting the matching/label-mapping logic in `lib/dishMatching.js` end-to-end.
- **Docker wasn't installed on this machine originally** — installed via `winget install -e --id Docker.DockerDesktop`. Its Linux engine then failed to start because **WSL2 wasn't enabled**, which required an elevated `wsl --install` and a reboot. Resolved; Docker Desktop now starts normally (though it does need to be launched — it's not set to auto-start — before `docker compose up -d` will work). (The post-reboot Ubuntu *distro* download via `wsl --install` separately got stuck at 0% due to `wsldownload.azureedge.net` being unreachable on this network — irrelevant to Docker, which manages its own `docker-desktop`/`docker-desktop-data` WSL distros and doesn't need the Ubuntu one.)
- **A stray `.git` repository existed at `C:\Users\runes\.git`** (home directory root, zero commits, unrelated to this project) before this project had its own. It was deleted — any git command run from inside this project folder would otherwise have walked up to that repo instead of failing cleanly, risking an accidental `git add -A` committing the entire home directory.
