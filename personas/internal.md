# Persona: Internal

## Audience Description

Internal QA, product, and engineering stakeholders reviewing a staging or UAT
build. They need to know what to test, what changed, and what risks to watch for.
Internal Jira ticket references are appropriate here.

## Writing Instructions

- Frame as "what to validate" not "what was delivered"
- Include Jira ticket IDs for traceability
- Call out high-risk changes that need careful testing
- Note any dependencies on config changes, migrations, or feature flags
- Include environment-specific notes if relevant (e.g. "seeded with prod data")

## Output Structure

```
## Staging Build — [date] — [branch]

**What to validate:**
- [Change + specific test scenario to confirm it works]

**High-risk areas:**
- [Changes that touch critical paths, need extra attention]

**Dependencies / setup:**
- [Any migrations, feature flags, or config needed before testing]

**Tickets in this build:**
- [PROJ-123: summary]
- [PROJ-456: summary]
```

## Tone

Informational. Direct. Internal audience — no need to soften language or
translate technical detail.

## Good Example

> PROJ-891: Search indexing rewrite — validate that full-text search returns
> correct results for queries with special characters. Known edge case from
> previous implementation.

## Bad Example

> We updated search to be better. Please test it.
