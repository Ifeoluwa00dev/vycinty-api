# Vycinty API

The backend for Vycinty — a REST API built with Express, PostgreSQL,
and Prisma. Counterpart to the `VYCINTY-V2` frontend repo.

## Status

- **Schema, seed data, and `/categories` + `/businesses` are implemented**
  (Weeks 3–4 / Phase 2–3 of the original roadmap) — not just stubs.
- Auth (`/auth/signup`, `/auth/login`) and write operations
  (`POST`/`PUT /businesses`) are still `TODO` — that's next.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and fill in real values:
   ```bash
   cp .env.example .env
   ```
   Get a free `DATABASE_URL` from [Neon](https://neon.tech) or
   [Railway](https://railway.app).

3. Create the database tables:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Seed sample Ile-Ife business data (matches what the frontend's mock
   data currently shows, so nothing visually changes when you connect
   the two):
   ```bash
   npm run seed
   ```

5. Run the dev server:
   ```bash
   npm run dev
   ```
   - `GET http://localhost:4000/health` → `{"status":"ok"}`
   - `GET http://localhost:4000/categories` → your seeded categories
   - `GET http://localhost:4000/businesses?category=food-drink` → filtered results
   - `GET http://localhost:4000/businesses/iya-moria-kitchen` → one business

## What's implemented

- `prisma/schema.prisma` — Business, Category, Photo, Owner models
- `prisma/seed.js` — seeds the same 8 categories / 9 businesses the
  frontend mock data uses
- `GET /categories` — real DB query
- `GET /businesses` — search (`?q=`), category filter (`?category=`),
  area filter (`?area=`), combinable
- `GET /businesses/:slug` — single business profile (matches the
  frontend's `/business/[slug]` route)

Note on search: name matching is case-insensitive partial match.
Services-array matching (`?q=` against a business's services) is
exact-match only for now — searching "amala" won't match a service
string like "Amala & gbegiri". Fine for MVP; a real text search is a
reasonable later upgrade.

## What's still TODO

- `POST /auth/signup`, `POST /auth/login` — password hashing
  (bcryptjs) + JWT issuing (jsonwebtoken) — both already installed
- Auth middleware to protect owner-only routes
- `POST /businesses`, `PUT /businesses/:id` — owner-only, with
  ownership checks
- Photo upload (Cloudinary or S3-compatible)

## Connecting the frontend

Once this is deployed (Render or Railway), set `NEXT_PUBLIC_API_URL`
in `VYCINTY-V2` to point at it. Until then, the frontend runs on its
own mock data.
