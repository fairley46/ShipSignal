# Persona: The Technical User

Engineers, architects, and admins who run or integrate with the product in production.
They want accuracy, specificity, and explicit callouts on anything that requires action.

---

## Who They Are

A senior engineer or platform admin responsible for keeping their team's systems
working with this product. They didn't choose the product — their org adopted it, and
now they own the integration. They've been burned by a "minor update" that wasn't, so
they read release notes carefully. They're not looking for marketing — they're looking
for behavioral changes and anything that requires a response.

## When They Read This

At their desk, between a code review and a standup, 4 minutes. They scan top to bottom:
first for "Breaking," then for the endpoints or config surfaces they depend on. Vague
language signals an untrustworthy note. Specific numbers and exact API references signal
one they can act on.

## What They Need

- Is there a breaking change that requires action on our end?
- Did any API surface, behavior, or config change?
- Are there deprecations with timelines I need to plan for?

## What to Leave Out

- Business outcome framing ("reduces churn," "improves retention")
- Marketing language of any kind
- Anything that doesn't describe concrete, testable behavior

---

## Writing Instructions

- **Flag breaking changes first, always.** Use `Breaking:` as a prefix. No exceptions.
- **Include specific numbers.** Before/after metrics — p99 latency, error rates, throughput. Vague is untrustworthy.
- **Reference the exact API surface.** Endpoint paths, field names, config keys, CLI flags.
- **Include migration steps** when behavior changes. Required, not optional.
- **Deprecations need a removal date.** "Deprecated" without a timeline is useless.
- **Describe behavior, not intent.** What does the system do now?

## Output Structure

```
## Release [YYYY-MM-DD] — [environment]

**Breaking changes** *(skip if none)*:
- Breaking: [What changed, exact surface affected, what to do]

**Changes:**
- [What it was → what it is now. Endpoint or config reference if applicable.]

**Performance:**
- [Metric: before → after, e.g. "p99 latency on /v2/search: 340ms → 78ms"]

**Deprecations** *(skip if none)*:
- [What: deprecated. Removal: [date]. Use: [replacement]]

**No action required** *(include if the release is safe to take passively)*
```

## Good Example

> ## Release 2026-03-16 — production
>
> **Changes:**
> - `/v2/search` p99 latency: 340ms → 78ms. Response schema unchanged.
>   Pagination behavior unchanged. No client updates required.
> - Export job status now includes `queued_at` timestamp alongside `started_at`
>   and `completed_at`. Non-breaking addition — existing consumers unaffected.
>
> **Deprecations:**
> - `/v1/search` deprecated. Removal: 2026-06-01. Migrate to `/v2/search` —
>   same parameters, same response shape.
>
> **No action required** unless you are currently using `/v1/search`.

## Bad Example

> Search was significantly improved with backend enhancements. Exports got some
> updates too. There may be a deprecation for older endpoints at some point.

**Why this fails:** No numbers, no endpoint names, no timeline. "Some updates" gives
nothing to test or act on. They'll go check the API docs themselves — wasting time
this note should have saved.
