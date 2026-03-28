# Gradeflow

Gradeflow is a local-first grade tracker for people who want control over their academic data.

The core idea is simple:

- a semester contains modules
- a module contains assignments
- assignments roll up into the grade view for that module and semester

This project exists because grades feel more private than most student tools treat them. A lot of academic software assumes your marks should live in somebody else's database by default. Gradeflow takes the opposite stance: your grades should stay with you unless you explicitly choose otherwise.

Right now the app is built to run locally and persist to a local JSON file. If this ever becomes a deployed product, grades should not just be "stored securely" in vague marketing terms. They should be end-to-end encrypted so the server is not casually trusted with the raw data.

## What the project is trying to be

Gradeflow is not trying to be a campus LMS, a collaboration suite, or a social product.

It is trying to be:

- calm
- direct
- private
- simple to update quickly
- useful for seeing where a semester stands without handing over personal academic data

The hierarchy matters:

1. You create semesters first.
2. Inside a semester, you create modules.
3. Inside a module, you track assignments and grouped, work-like, tutorials.

That structure is intentional. The landing page is about semesters. The workspace is about the currently selected semester. The module screen is where detailed grade tracking happens.

## Current product shape

Today the app supports:

- multiple semesters
- semester selection from the root landing page
- suggested semesters based on the current time
- add, edit, and delete semester flows
- module management inside a semester
- assignment tracking inside a module
- grouped tutorial tracking with drop-lowest support
- current-grade calculations, weighted contributions, and grade-band views
- local persistence across refreshes

## Privacy model

Gradeflow is local-first by design.

Current behavior:

- app state is written to `.gradeflow/state.json`
- if no live state exists yet, the app seeds from `.gradeflow/state.template.json`
- the live state file is git-ignored
- the app does not require a remote database to function

This is not a temporary implementation detail. It is part of the product direction.

If a hosted version is ever built, the standard should be:

- grades are end-to-end encrypted
- raw academic data is not readable by the server by default
- privacy is a product constraint, not a later security patch

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives via `shadcn/ui`-style wrappers

The app uses `shadcn`-style UI primitives as a foundation, but the product UI is intentionally custom rather than default-template styling.

## Local development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Persistence

Local state lives under:

```text
.gradeflow/state.json
```

Tracked starter state lives at:

```text
.gradeflow/state.template.json
```

This means the repo can ship with a starting structure without committing your ongoing personal grade data.

## Project structure

High-level layout:

- `app/` — routes and API endpoints
- `components/landing/` — semester-first root page
- `components/workspace/` — semester and module workspace UI
- `components/dashboard/` — shared module and form components
- `components/ui/` — base UI primitives
- `lib/` — types, grade calculations, semester utilities, and local state helpers

Important files:

- [app/page.tsx](/app/page.tsx) — root semester landing page
- [components/landing/minimal-landing.tsx](/components/landing/minimal-landing.tsx) — semester list UI
- [components/workspace/semester-screen.tsx](/components/workspace/semester-screen.tsx) — selected semester workspace
- [components/workspace/module-screen.tsx](/components/workspace/module-screen.tsx) — module detail screen
- [components/workspace/workspace-provider.tsx](/components/workspace/workspace-provider.tsx) — shared client state
- [lib/grade-utils.ts](lib/grade-utils.ts) — grade and weighting logic
- [lib/state-file.ts](lib/state-file.ts) — local JSON persistence

## Product stance

This project is opinionated.

- Grades are personal data.
- Local-first is the default, not the fallback.
- Simplicity matters more than feature sprawl.
- A future online version should earn trust cryptographically, not just ask for it.

## Status

Gradeflow is active and evolving. The current focus is product clarity, UI consistency, and preserving the local-first privacy model while the semester/module/assignment flow gets tighter.
