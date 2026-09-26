# Vycinty API

The backend for Vycinty — a REST API built with Express, PostgreSQL,
and Prisma. Counterpart to the `VYCINTY-V2` frontend repo.

## Status

- **Schema, seed data, `/categories`, and `/businesses` (search + detail)
  are implemented** (Weeks 3–4).
- **Auth (`/auth/signup`, `/auth/login`) and owner-protected
  `POST`/`PUT /businesses` are now implemented too** (Phase 4–5) —
  password hashing, JWT issuing/verification, and ownership checks
  are all real, not stubs.
- Photo upload is still `TODO` — that's next.

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
- `GET /businesses/:slug` — single business profile
- `POST /auth/signup` — creates an owner account, hashes the password
  (bcryptjs), rejects duplicate emails (409), issues a JWT
- `POST /auth/login` — verifies credentials, issues a JWT
- `src/middleware/auth.js` — `requireAuth` middleware, verifies the
  `Authorization: Bearer <token>` header on protected routes
- `POST /businesses` — create a listing (requires a valid token;
  auto-generates a unique slug from the name)
- `PUT /businesses/:id` — update a listing, but only if the
  authenticated owner actually owns it (403 otherwise)

Note on search: name matching is case-insensitive partial match.
Services-array matching (`?q=` against a business's services) is
exact-match only for now — searching "amala" won't match a service
string like "Amala & gbegiri". Fine for MVP; a real text search is a
reasonable later upgrade.

## What's still TODO

- Photo upload (Cloudinary or S3-compatible)
- Frontend needs a real login flow calling these endpoints and storing
  the token (see `VYCINTY-V2`'s `lib/api.ts` and the owner dashboard)

## How to use the auth endpoints

```bash
# Sign up
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Funmi Adewale","email":"funmi@example.com","password":"at-least-8-chars"}'
# → { "token": "...", "owner": { "id": "...", "name": "...", "email": "..." } }

# Use the token on a protected route
curl -X POST http://localhost:4000/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"name":"My Shop","categorySlug":"food-drink","description":"...","hours":"9-5","phone":"0800...","area":"Sabo"}'
```

## Connecting the frontend

Once this is deployed (Render or Railway), set `NEXT_PUBLIC_API_URL`
in `VYCINTY-V2` to point at it. Until then, the frontend runs on its
own mock data.