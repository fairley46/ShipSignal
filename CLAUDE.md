# CLAUDE.md

This is `Legibly` — *reads every merge and generates audience-specific plain-language release notes automatically*. Node.js, MIT-licensed, public. Works on GitHub Actions, GitLab CI, Bitbucket Pipelines, any CI system.

## Think before coding

- Read existing release-notes generation logic before modifying output shape — Legibly's value is *consistent voice across audiences*
- State the goal in one sentence before writing
- If the goal is unclear, ask — especially about audience taxonomy (engineer / PM / customer / executive)

## Simplicity first

- Prefer boring solutions to clever ones
- One concern per change
- No new dependencies without justification — Legibly should remain installable as a single npm dep on consumers' CI
- The CI integrations are intentionally minimal — don't bundle features that belong to the consumer's CI runner

## Surgical changes

- Don't refactor surrounding code without being asked
- Match existing patterns:
  - Audience templates live where they live; don't relocate
  - Output is committed back to the consumer's repo — never break the commit-back contract
- The `release-notes.yml` workflow IS the user-facing contract — major changes need a deprecation path

## Goal-driven execution

- Each commit advances a feature or fixes a specific issue — name it in the commit subject
- Tests first when behavior is added — there's a CI workflow already; preserve coverage
- Frequent commits over large ones

## What this repo is for

A small, single-purpose tool: merge → plain-language release notes, audience-specific, committed back. Used in real consumer CI pipelines.

## What this repo is NOT for

- A general changelog generator — Legibly is opinionated about audience-specific output
- A LLM wrapper utility — the value is the editorial discipline, not the model integration
- Brad's other agent projects — those live in `~/the-crew/`, `~/dispatch/`, etc.

## How to ship a change

1. Branch from `main` as `<your-id>/<short-feature>`
2. TDD: failing test → minimal impl → green → commit
3. PR to `main`; CI gates merge
4. Wait for human approval before merge
