---
name: capacity-validation
description: Select and run focused checks for this repository's capacity API and React grid, including independent weekly controls and person-wide save refresh. Use when validating changes or planning regression coverage.
---

# Capacity validation

Resolve source links relative to this file and run commands from the repository root. Choose checks that match the changed behavior; do not add broad suites just to increase coverage.

## Existing checks

- [capacity_test.go](../../api/capacity_test.go): range parsing and optional person-filter validation.
- [people_test.go](../../api/people_test.go): person IDs and capacity payload validation.
- [CapacityGridWeek.spec.tsx](../../web/src/CapacityGrid/CapacityGridWeek.spec.tsx): changing sorting, pagination, and status filtering in one week leaves another unchanged.

The assignment uses Compose; do not install a toolchain or change the run environment merely to run checks.

```bash
docker compose exec api go test ./...
docker compose exec web npm run tsc
docker compose exec web npm test -- CapacityGridWeek.spec.tsx
docker compose exec web npm run build
```

If local frontend dependencies are already installed, the corresponding fallback commands are `npm run tsc --prefix web`, `npm run test --prefix web -- CapacityGridWeek.spec.tsx`, and `npm run build --prefix web`.

## Highest-value regression cases

- Allocation: assignments spanning the selected range, inclusive assignment endpoints, exclusive filter end, weekends excluded, overlapping assignments summed, fractions preserved, and people with zero allocation included. Verify expected numbers independently against Postgres; mocked rows do not validate the SQL.
- Save: update one person's weekly capacity, then fetch only that person's rows for the displayed range. Every displayed week updates, other people remain unchanged, and each week's controls retain their state.
- Failures: failed loads release the range controls; failed saves preserve the draft; failed refreshes after a confirmed save explain the partial success. Late or aborted requests do not replace current data.
- Weekly controls: sort numeric columns numerically; status order is below/at/over; filter before paginating; reset only the affected week's page and clamp it after result counts shrink.
- Rendering: empty filters, empty data, visible over-allocation, inline editing, keyboard-operable controls, and sticky range filters. Preview states are illustrative and must not be reported as proof that real API failure handling works.

## Runtime verification

Use `make up` to start the existing environment, then open `http://localhost:3000` and inspect the actual numbers. Backend changes need an API rebuild. Never use `make reset` as a routine check: it wipes data.

After relevant checks pass, stop unless new changes or unresolved failures justify another run. If tools, dependencies, or permissions prevent a check, report precisely what ran, what passed, and what remains unverified; do not claim completion based only on file creation.

Do not edit `AGENTS.md`, `DECISIONS.md`, or `.notes/worklog.md` unless the user explicitly requests that file. Leave fixed environment and database input files unchanged.
