# CRM

A single-workspace CRM: contacts, a deals pipeline, notes, and tasks. Built with Next.js (App Router, JavaScript), Tailwind CSS, PostgreSQL (via Prisma), and Auth0.

## Stack

- Next.js 16 (App Router, plain JavaScript)
- Tailwind CSS v4
- PostgreSQL + Prisma 6
- Auth0 (`@auth0/nextjs-auth0` v4) — auth boundary handled in `proxy.js` (Next 16's replacement for `middleware.js`)

## Roles

Two roles: `ADMIN` and `MEMBER`. The **first user to ever log in becomes ADMIN automatically**; every user after that defaults to `MEMBER`. Admins can promote/demote other users from `/admin/users`.

## Local setup

### 1. Start Postgres

```bash
docker compose up -d
```

This starts a Postgres 16 container matching the `DATABASE_URL` already set in `.env`.

### 2. Create an Auth0 application

In the [Auth0 Dashboard](https://manage.auth0.com), create a **Regular Web Application** and set:

- Allowed Callback URLs: `http://localhost:3000/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`

Then fill in `.env` with your tenant's values (see `.env.example` for the full list): `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET` (generate with `openssl rand -hex 32`).

### 3. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev --name init
```

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), sign up — your account becomes the first Admin.

## Useful commands

- `npx prisma studio` — browse/edit the database directly
- `npx prisma migrate dev` — apply schema changes during development

## Project structure

- `app/(app)/` — authenticated pages (dashboard, contacts, deals, tasks, admin/users), gated by `app/(app)/layout.js` calling `requireUser()`
- `app/api/` — REST CRUD endpoints, gated by `requireApiUser()` / `requireApiAdmin()` in `lib/auth.js`
- `lib/auth0.js`, `proxy.js` — Auth0 SDK client and the Next.js 16 auth boundary
- `lib/auth.js` — session-to-database user sync and role enforcement helpers
- `lib/db.js` — Prisma client singleton
- `prisma/schema.prisma` — data model (User, Contact, Deal, Note, Task)
