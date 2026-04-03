# GradeLog

GradeLog is a simple grade tracker that keeps your marks on your device.

No accounts required. No cloud by default.

You can optionally connect your devices to keep your data in sync across devices.

Just your semesters, modules, and assignments, stored locally and available offline.

The core idea is simple:

- a semester contains modules
- a module contains assignments
- assignments roll up into the grade view for that module and semester

This project exists because grades feel more private than most student tools treat them. A lot of academic software assumes your marks should live in somebody else's database by default. GradeLog takes the opposite stance: your grades should stay with you unless you explicitly choose otherwise.

Right now the app is built to run locally and persist inside the browser with IndexedDB. If this ever becomes a deployed product, grades should not just be "stored securely" in vague marketing terms. They should be end-to-end encrypted so the server is not casually trusted with the raw data.

## Platforms

GradeLog runs as:

- a web app
- an installable PWA (works offline after first load)
- a native mobile app via Capacitor (Android and iOS shells)

All versions share the same local-first data model. Your data stays on-device unless you explicitly export it.

## Sync (optional)

GradeLog works fully offline with no account.

If you want to use it across multiple devices, you can choose to connect your devices.

- syncing is optional
- your local device remains the primary working copy
- changes sync when you are online
- you can disconnect at any time

Note: synced data is not yet end-to-end encrypted. Encryption is planned so that servers cannot read your grades.

## What the project is trying to be

GradeLog is not trying to be a campus LMS, a collaboration suite, or a social product.

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
- browser-local persistence across refreshes
- installable offline-first behavior after the first load

## Privacy model

GradeLog is local-first by design.

Current behavior:

- app state is written to IndexedDB in the browser
- persisted app state is versioned and migrated locally as the schema evolves
- the app does not require a remote database to function
- the app shell can reopen offline after it has been loaded once
- backups can be exported to and restored from local JSON files
- optional sync can be enabled to keep data in sync across connected devices
- when sync is used today, data is stored on a remote service to enable cross-device syncing
- synced data is not yet end-to-end encrypted

This is not a temporary implementation detail. It is part of the product direction.

The long-term standard for this project is:

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

Local state lives in the browser via IndexedDB.

On first launch, GradeLog seeds from the app's default semester template. After that, all semester, module, and assessment changes are stored locally in the browser with no backend or cloud dependency.

Persisted state includes an explicit version field and runs through a small migration path before the app uses it. That same migration path is used for backup import, so older local data can be upgraded intentionally instead of being trusted blindly.

The app also ships with a minimal service worker and web app manifest so it can be installed and reopened offline after the first successful load. Navigation responses are cached as they are visited, which keeps revisited deep links available offline while still using a simple network-first shell strategy.

## Local backup

GradeLog includes a lightweight local backup flow in the app chrome.

- Export saves the full normalized app state to a JSON file on your device.
- Import validates and migrates the JSON locally before it replaces current state.
- No server is involved in backup or restore.

## Project structure

High-level layout:

- `app/` — routes and app metadata
- `public/` — manifest, icons, and service worker
- `components/landing/` — semester-first root page
- `components/workspace/` — semester and module workspace UI
- `components/dashboard/` — shared module and form components
- `components/ui/` — base UI primitives
- `lib/` — types, grade calculations, semester utilities, and client-side state helpers

Important files:

- [app/page.tsx](/app/page.tsx) — root semester landing page
- [components/landing/minimal-landing.tsx](/components/landing/minimal-landing.tsx) — semester list UI
- [components/workspace/semester-screen.tsx](/components/workspace/semester-screen.tsx) — selected semester workspace
- [components/workspace/module-screen.tsx](/components/workspace/module-screen.tsx) — module detail screen
- [components/workspace/courses-provider.tsx](/components/workspace/courses-provider.tsx) — shared client state
- [lib/app-state.ts](lib/app-state.ts) — app state shape, versioning, and migration
- [lib/app-state-actions.ts](lib/app-state-actions.ts) — pure immutable app-state mutations
- [lib/grade-utils.ts](lib/grade-utils.ts) — grade and weighting logic
- [lib/app-state-storage.ts](lib/app-state-storage.ts) — IndexedDB persistence

## Product stance

This project is opinionated.

- Grades are personal data.
- Local-first is the default, not the fallback.
- Simplicity matters more than feature sprawl.
- A future online version should earn trust cryptographically, not just ask for it.

## Status

GradeLog is active and evolving. The current focus is product clarity, UI consistency, and preserving the local-first privacy model while the semester/module/assignment flow gets tighter.

## Support

If you found this useful, you can support development:
https://ko-fi.com/kefasaleck
