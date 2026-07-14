# Learn.md

A walkthrough of how SGMakanHealthy is built, for anyone (including future you) ramping up on the codebase.

## Stack

- **Next.js 16.2.9** (App Router, plain JavaScript) — frontend and backend in one app
- **Tailwind CSS v4** — styling
- **Prisma 6.19.3 + PostgreSQL** — database layer
- Phone number + WhatsApp one-time-code login — own implementation, no third-party auth SDK (WhatsApp delivery is currently mocked)
- Optional **LogMeal API** call for food-photo recognition

## How the pages are organized

- `app/page.js` — public landing page. Checks for a session and redirects to `/dishes` if you're already logged in.
- `app/(auth)/login/` — the phone/OTP login and signup flow lives outside the authenticated route group, with its own minimal layout (no navbar).
- `app/(app)/` — everything behind login lives here (the `(app)` folder name doesn't show up in the URL, it's just a grouping). `app/(app)/layout.js` calls `requireUser()` before rendering anything inside, which is the actual gate — no session, no access. It wraps pages in `AppShell` (the navbar + gradient background shown everywhere once logged in).
  - `dishes/`, `stalls/`, `profile/`, `scan/`, `admin/stalls/`, `admin/dishes/`, `admin/users/` — one folder per feature, each with a `page.js`. Nested folders like `dishes/[slug]/[stallDishId]/` map straight to `/dishes/chicken-rice/some-id`.
- `app/api/*/route.js` — REST endpoints. Two groups: `app/api/auth/*` (OTP request/verify, signup — the whole login flow, since there's no SDK auto-mounting routes anymore) and `app/api/users`, `app/api/food-recognition` (used by the widgets that need instant feedback or handle a file upload, rather than a full page submit).

## How data moves

- **Reads**: pages are Server Components — they call Prisma (`lib/db.js`) directly inside the page function, no fetch involved. That's how the dish detail page pulls nutrition facts, stall listings, and average ratings (`db.review.groupBy`).
- **Writes**: forms submit to **Server Actions** (`actions.js` next to each page) that call Prisma directly too — no API round-trip for normal create/edit/delete (posting a review, editing your profile, admin managing a stall's dishes).
- **Exceptions**: the admin role select is a small Client Component that `fetch()`es a REST route (`/api/users/[id]`), since it needs to update without a full form submit. The photo-scan flow (`components/scan/ScanForm.js`) also talks to a REST route (`/api/food-recognition`) because it's uploading a file, which Server Actions don't handle as naturally.

## Auth flow

There's no third-party auth SDK. The flow is entirely our own, in three steps, driven by `components/auth/LoginForm.js`:

1. **Request a code** — `POST /api/auth/otp/request` with a phone number. `lib/otp.js` generates a 6-digit code, hashes it, stores it in the `Otp` table with a 5-minute expiry (rate-limited to 5 requests/hour per phone), and `lib/sms.js` "sends" it — currently just logs it server-side and echoes it back in the response outside production, so local testing works without real WhatsApp delivery.
2. **Verify the code** — `POST /api/auth/otp/verify` checks the code against the `Otp` table (max 5 wrong attempts). If the phone number already has a `User`, a session is created immediately (a row in the `Session` table + an httpOnly cookie) and login is done. If it's a brand-new phone number, the response includes a short-lived signed token instead (`lib/authToken.js`) and the UI asks for a username.
3. **Finish signup** — `POST /api/auth/signup` takes the phone, chosen username, and that signed token, creates the `User` row (first user ever → `ADMIN`, everyone else → `USER`), and creates the session.

After that, every page/route checks the session the same way: `lib/auth.js`'s `requireUser()` (redirects to `/login` if no valid session, for pages) or `requireApiUser()` (throws a JSON 401, for API routes) — both read the session cookie, look up the `Session` row, and return the linked `User`.

## The food domain

- **`Dish`** — the 8 fixed Singapore dishes, with a short description and nutrition reference values (calories, protein, carbs, fat, sodium, fiber, sugar). Nutrition lives on the dish, not the stall — it's a property of the recipe.
- **`Stall`** — a food stall, with a name and address.
- **`StallDish`** — the actual comparable unit: a specific dish sold at a specific stall, with a price. This is what a dish's comparison table lists (`/dishes/[slug]`), and what reviews attach to.
- **`Review`** — always has a `userId` (never null), plus an `isAnonymous` flag that only controls whether the username is shown or hidden as "Anonymous". Keeping the `userId` even for anonymous reviews means the review can still be edited/deleted by its author or an admin, and abuse can still be traced — a nulled foreign key would break both.

The dish detail page (`app/(app)/dishes/[slug]/page.js`) joins `StallDish` rows for that dish with a `db.review.groupBy` to compute an average rating per stall, so the comparison table can be sorted by price or by rating.

## Photo recognition

`/scan` uploads a photo to `POST /api/food-recognition`. `lib/foodRecognition.js` calls the LogMeal API if `FOOD_RECOGNITION_API_KEY` is set; if it's not set (the default in this environment), it returns `{ available: false }` immediately with no network call. `lib/dishMatching.js` then maps whatever labels come back to one of the 8 dish slugs via a synonym table, since a generic vision API won't return "char kway teow" verbatim. Whatever happens — a confident match, an unrecognized label, or recognition being unavailable — the UI always offers a manual dish picker as a fallback, so the feature degrades instead of breaking.

## Deployment

See [CLAUDE.md](CLAUDE.md) for the full deployment setup, environment variables, and gotchas hit while building this (Vercel/Supabase env var quirks, Prisma migration gotchas, etc.).
