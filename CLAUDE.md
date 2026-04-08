# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Raycast development mode
npm run build        # Build extension to dist/
npm run lint         # Lint with ESLint + Prettier (via ray CLI)
npm run fix-lint     # Auto-fix lint/formatting issues
npm run test         # Run all tests (vitest)
npm run test:watch   # Run tests in watch mode
npx vitest run src/lib/__tests__/calculations.test.ts  # Run a single test file
```

## Architecture

Raycast extension that displays a cumulative work hours balance from Clockify, with automatic public holiday deduction and manual days-off tracking.

**Commands:**
- `report` — Main view: markdown table + metadata with balance
- `add-days-off` / `remove-days-off` / `reset-days-off` — No-view commands to manage extra days off (stored in LocalStorage), each opens the report afterwards

**Data flow:** `report.tsx` (UI) → `api/clockify.ts` (fetch user + paginated time entries) → `lib/calculations.ts` (compute expected vs actual hours, subtract holidays + days off) → render markdown table + metadata.

- `src/report.tsx` — Main Raycast command component using `usePromise` for async data
- `src/add-days-off.ts` / `remove-days-off.ts` / `reset-days-off.ts` — No-view commands with inline argument for amount
- `src/api/clockify.ts` — Clockify REST API client with automatic pagination (50/page)
- `src/lib/calculations.ts` — Pure business logic: workday counting, hour formatting (de-DE locale), report calculation
- `src/lib/holidays.ts` — German public holiday computation (Easter algorithm, nationwide + per-state holidays, all 16 federal states)
- `src/lib/extraDaysOff.ts` — LocalStorage wrapper for the extra days-off counter
- `src/lib/types.ts` — Shared interfaces (`ClockifyTimeEntry`, `HoursReport`)

**Key design decisions:**
- The report tracks a **cumulative lifetime balance** (from first Clockify entry to today), not monthly
- **Public holidays** are computed programmatically per federal state (Bundesland setting) — no external API needed
- **Extra days off** (vacation etc.) are managed via LocalStorage with dedicated add/remove/reset commands
- `package.json` is both the npm config and the Raycast extension manifest (commands, preferences)
- `raycast-env.d.ts` is auto-generated from package.json — do not edit manually
