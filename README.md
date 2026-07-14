# SGMakanHealthy

A Singapore food nutrition, taste-rating, and stall-comparison app. Browse 8 classic Singapore dishes, see their micro-nutrition, compare the same dish across different food stalls on price and a 1–5 star taste rating, read or write reviews (named or anonymous), and snap a photo to identify what you're eating. Built with Next.js (App Router, JavaScript), Tailwind CSS, and PostgreSQL (via Prisma).

## Stack

- Next.js 16 (App Router, plain JavaScript)
- Tailwind CSS v4
- PostgreSQL + Prisma 6
- Phone number + WhatsApp one-time-code login — no password, no third-party auth SDK. WhatsApp delivery is currently mocked (see `lib/sms.js`); the code is logged/echoed instead of actually sent.
- Optional food-photo recognition via the LogMeal API (gracefully disabled if no API key is set)

## Roles

Two roles: `ADMIN` and `USER`. The **first person to ever sign up becomes ADMIN automatically**; everyone after defaults to `USER`. Admins can manage stalls (`/admin/stalls`), edit dish descriptions/nutrition (`/admin/dishes`), and promote/demote users (`/admin/users`).

## Local setup

### 1. Start Postgres

```bash
docker compose up -d
```

This starts a Postgres 16 container matching the `DATABASE_URL` already set in `.env`.

### 2. Configure `.env`

See `.env.example` for the full list. At minimum you need:

- `DATABASE_URL` — already set for local Docker Postgres.
- `PHONE_VERIFY_SECRET` — generate with `openssl rand -hex 32`.
- `FOOD_RECOGNITION_API_KEY` — optional; leave blank and `/scan` falls back to manual dish selection.

### 3. Install dependencies, run migrations, seed data

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

Seeding populates the 8 fixed dishes and a set of sample stalls/prices so the app isn't empty on first load.

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Log in with any phone number in international format (e.g. `+6591234567`); since WhatsApp sending is mocked, the one-time code is shown directly in the login form and logged server-side. Pick a username to finish creating your account — your account becomes the first Admin.

## Useful commands

- `npx prisma studio` — browse/edit the database directly
- `npx prisma migrate dev` — apply schema changes during development
- `npx prisma db seed` — re-seed the 8 dishes + sample stalls (safe to re-run)

## Project structure

- `app/(auth)/login/` — phone/OTP login + signup flow (`components/auth/LoginForm.js`)
- `app/(app)/` — authenticated pages (dishes, stalls, profile, scan, admin), gated by `app/(app)/layout.js` calling `requireUser()`
- `app/api/auth/` — OTP request/verify + signup REST endpoints
- `app/api/food-recognition/` — photo-upload recognition endpoint
- `lib/auth.js` — session creation/lookup and role enforcement helpers
- `lib/otp.js`, `lib/sms.js`, `lib/authToken.js` — OTP generation/verification, (mocked) WhatsApp delivery, and the signup bridging token
- `lib/foodRecognition.js`, `lib/dishMatching.js` — external recognition API call and label-to-dish matching
- `lib/db.js` — Prisma client singleton
- `prisma/schema.prisma` — data model (`User`, `Otp`, `Session`, `Dish`, `Stall`, `StallDish`, `Review`)
- `prisma/seed.js` — the 8 dishes, sample stalls, and prices
