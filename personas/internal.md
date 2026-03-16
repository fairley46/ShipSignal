# Persona: The Internal User

QA engineers and product managers running staging and UAT builds. They're the last
gate before production. They read this note to build their test plan for the day.

---

## Who They Are

A QA lead or senior PM who owns the staging sign-off. They've been doing this long
enough to know that "low-risk change" in a commit message sometimes means something
went wrong that nobody noticed yet. Their job is to find the thing nobody else found.
When something slips through staging and causes a production incident, they're the
one who asks: "what did I miss?"

## When They Read This

At their desk at 8:45am, staging environment open in one window, blank test plan in
another. They're reading to build a checklist. Every change is a test scenario. Every
high-risk flag is somewhere to spend more time. Every dependency note is something
to set up before they start.

## What They Need

- What changed and what specifically should I validate?
- What are the high-risk areas that need extra attention?
- Is there any setup required before I start testing (migrations, flags, seed data)?

## What to Leave Out

- Customer-facing or marketing framing
- Business outcome summaries
- Architecture explanations without operational impact
- Anything that doesn't affect what gets tested

---

## Writing Instructions

- **Frame changes as test scenarios, not deliveries.** Not "we added X" — "validate that X now does Y."
- **Include Jira ticket IDs.** Every change maps to a ticket. They use these for traceability.
- **Flag high-risk areas explicitly.** Auth, data persistence, critical paths, known fragile areas.
- **List setup dependencies first.** Migrations, feature flags, seed data — before anything else.
- **Be honest about edge cases.** If there's a known boundary condition, say so.
- **Reference the before state when testing a fix.** They need to know how to reproduce the original problem to confirm it's resolved.

## Output Structure

```
## Staging Build — [YYYY-MM-DD] — [branch]

**Setup before testing** *(skip if none)*:
- [Migration to run / feature flag to enable / seed data to load]

**What to validate:**
- [PROJ-123] [What changed → what to test → expected behavior]
- [PROJ-456] [What changed → what to test → expected behavior]

**High-risk — spend extra time here:**
- [PROJ-789] [Why it's risky, what to look for, known edge cases]

**Tickets in this build:**
- PROJ-123: [one-line summary]
- PROJ-456: [one-line summary]
```

## Good Example

> ## Staging Build — 2026-03-16 — release/2.14.0
>
> **Setup before testing:**
> - Run migration: `db:migrate:20260316_add_export_timestamps`
> - Enable feature flag `scheduled_exports` in staging config before testing PROJ-891
>
> **What to validate:**
> - [PROJ-891] Scheduled exports: configure a daily export, confirm it runs on
>   schedule, confirm `queued_at` appears in job status. Test CSV and JSON formats.
> - [PROJ-847] Export failure fix: export a dataset over 10k rows, confirm file
>   is complete. Previous behavior: silent failure at ~10,500 rows.
>
> **High-risk — spend extra time here:**
> - [PROJ-903] Search rewrite: new index. Validate queries with special characters
>   (apostrophes, ampersands, non-ASCII). Known edge case: `&` returned zero results.
>
> **Tickets in this build:**
> - PROJ-891: Scheduled export feature (feature-flagged)
> - PROJ-847: Export silent failure fix for large datasets
> - PROJ-903: Search indexing rewrite

## Bad Example

> We updated search and exports. Please test them to make sure they work.

**Why this fails:** No test scenarios, no ticket IDs, no edge cases, no setup steps.
They'll spend 30 minutes tracking down engineers to get what this note should have contained.
