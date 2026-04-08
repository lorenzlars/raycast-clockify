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

Raycast extension with a single `report` command that displays a cumulative work hours balance from Clockify, with optional calendar-based deductions for vacation/holidays.

**Data flow:** `report.tsx` (UI) → `api/clockify.ts` (fetch user + paginated time entries) → `lib/calculations.ts` (compute expected vs actual hours, apply deductions) → render markdown table + metadata.

- `src/report.tsx` — Entry point, Raycast command component using `usePromise` for async data
- `src/api/clockify.ts` — Clockify REST API client with automatic pagination (50/page)
- `src/lib/calculations.ts` — Pure business logic: workday counting, hour formatting (de-DE locale), report calculation, calendar deduction logic
- `src/lib/calendar.ts` — macOS Calendar.app integration via JXA (`osascript -l JavaScript`); gracefully returns empty array on error
- `src/lib/types.ts` — Shared interfaces (`ClockifyTimeEntry`, `CalendarEvent`, `HoursReport`)

**Key design decisions:**
- The report tracks a **cumulative lifetime balance** (from first Clockify entry to today), not monthly
- Calendar deductions: all-day events deduct `hoursPerDay`, timed events deduct their duration (capped at `hoursPerDay` per day), weekends are ignored
- `package.json` is both the npm config and the Raycast extension manifest (commands, preferences)
- `raycast-env.d.ts` is auto-generated from package.json — do not edit manually
