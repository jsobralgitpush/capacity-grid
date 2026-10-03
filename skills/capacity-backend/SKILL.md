---
name: capacity-backend
description: Change or refactor the Go capacity and person-update endpoints in this repository. Use for API validation, allocation SQL, response contracts, or capacity save behavior.
---

# Capacity backend

Read the relevant files before editing. Resolve source links relative to this file and run commands from the repository root.

## File responsibilities

- [capacity.go](../../api/capacity.go): `handleCapacity` coordinates HTTP handling; `parseCapacityFilters` and `parseCapacityRange` validate inputs; `queryCapacity` executes and scans; `capacitySQL` holds the parameterized query.
- [people.go](../../api/people.go): `handleUpdatePerson` coordinates HTTP handling; `parsePersonID`, `parseUpdatePersonInput`, and `validateWeeklyHours` validate inputs; `updatePersonCapacity` performs the write; `updatePersonCapacitySQL` holds the query.
- [main.go](../../api/main.go) registers stdlib routes and provides `writeJSON`. Match these conventions; keep SQL in named constants, not dynamically assembled strings. Return errors from helpers and handle HTTP status codes in handlers.
- Read [schema.sql](../../db/schema.sql) for data relationships and [seed.sql](../../db/seed.sql) selectively for representative cases. These are fixed inputs.

## Preserve the current contract

- A capacity response is an array with one row per person/week: `id`, `name`, `capacity`, `allocation`, `status`, `week_start`, and `week_end`. Status is `below_capacity`, `at_capacity`, or `over_capacity`. An empty result is `[]`.
- `capacity` is `people.weekly_hours`; allocation sums assignment hours on working days in that week. Assignment boundaries are inclusive, overlaps add together, and only Monday–Friday count. No holiday or leave model exists.
- A filtered range is `[from, to)` with 1–104 whole seven-day weeks starting on `from`. Both dates must be supplied together. With neither date, return calendar weeks containing assignments and include people with zero allocation for those weeks.
- Optional `person_id` limits the returned people and assignment aggregation. Keep the same week set as the equivalent full-roster request so refreshing one person does not lose weeks.
- `PATCH /api/people/{id}` accepts `weekly_hours` from 0 through 168, including fractions and zero. Missing/null values, unknown JSON fields, trailing JSON, malformed payloads, and invalid IDs are rejected. Unknown people return 404; database failures return a generic 500 response and are logged server-side.
- Weekly capacity is one value per person and applies to all weeks, including history. Do not introduce effective dates or per-week writes without an explicit domain change.
- Pass request contexts to database operations, close result sets, check iteration errors, and preserve wrapped errors so `errors.Is` still detects `pgx.ErrNoRows`.

Treat these as existing product decisions, not universal rules. Coordinate requested contract changes with [CapacityGrid.types.ts](../../web/src/CapacityGrid/CapacityGrid.types.ts) and the frontend container.

## Check the change

Use [capacity-validation](../capacity-validation/SKILL.md). Unit tests cover parsing and validation; allocation correctness requires exercising SQL against Postgres.

Do not edit `AGENTS.md`, `DECISIONS.md`, or `.notes/worklog.md` unless the user explicitly requests that file. Leave the schema, seed, Compose files, Dockerfiles, and Makefile unchanged.
