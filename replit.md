# ParkBnB

An Airbnb-style marketplace for booking private parking spaces — connect drivers with parking spot owners for hourly, daily, or monthly parking.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/parkbnb run dev` — run the frontend (port 18503)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, wouter, Framer Motion, Recharts
- API: Express 5 at `/api`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for the API contract
- `lib/db/src/schema/` — Drizzle schema: users, listings, bookings, reviews, favorites
- `artifacts/api-server/src/routes/` — Express route handlers (users, listings, bookings, reviews, search, dashboard, favorites)
- `artifacts/parkbnb/src/pages/` — Frontend pages (home, search, listing-detail, bookings, auth, profile, host/*)
- `artifacts/parkbnb/src/components/` — Shared components (layout, listing-card)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Architecture decisions

- **Mock auth via x-user-id header**: No real auth yet — a `userId` stored in localStorage is sent as `x-user-id` on every API request. Register page creates/finds the user via `POST /api/users/register`.
- **Contract-first API**: OpenAPI spec gates both codegen and the frontend. Always edit the spec first, then run codegen.
- **Availability check as POST**: The `/listings/:id/availability` endpoint uses POST (not GET) to avoid Orval generating conflicting `Params` types for endpoints with both path and query parameters.
- **Numeric fields as strings in DB**: Drizzle's `numeric` type returns strings from PostgreSQL; all route handlers parse them with `parseFloat()` before returning.
- **JSON columns for arrays**: vehicleTypes, amenities, and photos are stored as `json` columns in PostgreSQL (not arrays), allowing flexible schema without migrations.

## Product

- **Drivers** can search parking by location, date/time, and vehicle type; view listing details with photos, amenities, and host info; book instantly; manage bookings with QR code entry passes; favorite spots; and leave reviews.
- **Hosts** can list parking spaces with photos, pricing (hourly/daily/monthly), availability, vehicle compatibility, amenities, and rules; manage listings; view a dashboard with earnings analytics (Recharts bar chart), booking stats, and occupancy rate.
- **Cities seeded**: New York, Brooklyn, San Francisco, Chicago, Mumbai, Delhi, London, Bangalore.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`.
- Do not add endpoints with BOTH path params AND query params — use POST with a body instead to avoid Orval type collisions (see availability endpoint).
- After `pnpm --filter @workspace/db run push`, restart the API server workflow to pick up schema changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
