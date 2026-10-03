---
name: capacity-frontend
description: Change or refactor the React capacity view in this repository while preserving independent weekly controls, inline editing, and person-wide refresh after saving. Use for frontend work under web/src/CapacityGrid.
---

# Capacity frontend

Read the relevant files before editing. This is a project-specific skill: resolve source links relative to this file, and run commands from the repository root.

## File responsibilities

- [CapacityGrid.tsx](../../web/src/CapacityGrid/CapacityGrid.tsx) renders the range controls and maps weekly groups to components.
- [CapacityGrid.useContainer.ts](../../web/src/CapacityGrid/CapacityGrid.useContainer.ts) owns range selection, fetching, request state, editing, and refreshing a person's rows.
- [CapacityGridWeek.tsx](../../web/src/CapacityGrid/CapacityGridWeek.tsx) renders one weekly table and its inline form.
- [CapacityGridWeek.useContainer.ts](../../web/src/CapacityGrid/CapacityGridWeek.useContainer.ts) owns that table's sorting, status filter, and pagination.
- Keep interfaces in the corresponding `.types.ts`, configuration in `.constants.ts`, and reusable helpers in `.utils.ts`. Use the existing `CapacityGrid` and `CapacityGridWeek` filename prefixes and keep feature files in `web/src/CapacityGrid/`.
- [CapacityGrid.preview.tsx](../../web/src/CapacityGrid/CapacityGrid.preview.tsx) previews states with sample data. Its actions must not send real API requests or mutate the live grid.

## Preserve these behaviors

- Each weekly component has independent sorting, status filtering, and pagination. Apply sorting and filtering before slicing the page; reset only that week's page when its controls change. Current page size is 10.
- Capacity belongs to the person, not the week. Save with `PATCH /api/people/{id}`, then fetch `GET /api/capacity?person_id=...` for the current range and replace every displayed row for that person, including rows hidden by pagination or status filters. Preserve the other people's data and weekly control state.
- Keep editing in the selected capacity cell. Preserve the draft and show errors there. Distinguish failed saves from failed refreshes after a confirmed save.
- Range filters stay visible while scrolling. Disable them immediately when their request starts and restore them on success or failure. Preserve cancellation and ignore aborted responses.
- Initial date filters are empty. The current UI selects an available starting week and 1–10 weeks; the API end date is exclusive. Use the date helpers rather than duplicating date arithmetic.
- Do not silently add retry controls, alternate layouts, or change date semantics during a refactor. Follow the user's requested scope.

## Check the change

Use [capacity-validation](../capacity-validation/SKILL.md) for relevant commands and regression scenarios. If the API response changes, inspect [capacity.go](../../api/capacity.go) and update both ends together.

Do not edit `AGENTS.md`, `DECISIONS.md`, or `.notes/worklog.md` unless the user explicitly requests that file. Leave the schema, seed, Compose files, Dockerfiles, and Makefile unchanged.
