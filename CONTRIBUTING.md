# Contributing to GradeLog

Thanks for taking the time to contribute.

GradeLog is a local-first grade tracker. That product direction is not incidental. It affects what kinds of contributions fit the project and which ones do not.

## Before you start

Please read the README before making larger changes.

If you want to work on:

- a bug fix
- a small polish improvement
- a focused UX improvement
- a documentation update
- a contained platform or sync bug

you can usually open a PR directly.

If you want to work on:

- a major new feature
- a structural architecture change
- authentication or sync model changes
- privacy or storage model changes
- large UI redesigns

please open an issue or start a discussion first.

## Product principles

Contributions should preserve these project constraints:

- local-first is the default, not the fallback
- no account is required for core use
- sync is optional
- privacy is a product concern, not a later patch
- the app should stay calm, direct, and easy to understand

Changes that push GradeLog toward cloud-first behavior, invasive onboarding, unnecessary tracking, or generic SaaS patterns are unlikely to be accepted.

## What kinds of contributions are welcome

Good fits include:

- bug fixes
- sync correctness fixes
- UI polish
- performance improvements
- offline behavior improvements
- accessibility improvements
- documentation improvements
- tests for existing behavior
- small developer-experience improvements

## What is less likely to be accepted

These are not absolute rules, but they are poor default directions for this project:

- adding analytics or user tracking
- making sign-in part of the default flow
- making remote storage the primary source of truth
- adding feature sprawl unrelated to grade tracking
- replacing the visual language with a generic template UI
- adding clever technical complexity without a clear product need

## Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

## Pull requests

Please keep pull requests focused.

A good PR usually:

- does one thing
- explains why the change is needed
- notes any tradeoffs
- avoids unrelated refactors

If your change affects user behavior, include a short before/after explanation.

If your change touches sync, persistence, or privacy-sensitive behavior, be explicit about:

- what data changes
- whether local-first behavior is preserved
- whether any new remote dependency is introduced

## Code style

Try to match the existing codebase style:

- keep solutions practical
- prefer clear behavior over clever abstractions
- preserve existing product language and tone
- avoid unnecessary churn in unrelated files

## Documentation

If your change affects product behavior, setup, sync, privacy, or contributor workflow, update the relevant documentation as part of the same PR where reasonable.

## Final note

Not every contribution will be accepted, even if it is technically solid.

For GradeLog, product fit matters as much as implementation quality.
