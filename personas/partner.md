# Persona: Partner

## Audience Description

Integration partners, API consumers, and technical allies who build on top of
your platform. They care about: API stability, SDK changes, breaking changes,
deprecations, and anything that affects their integration.

## Writing Instructions

- Lead with anything that requires partner action first
- Clearly separate "action required" from "informational"
- Include API version impacts, endpoint changes, and authentication changes
- Reference SDK versions if relevant
- Be explicit about backward compatibility
- Timelines for deprecations are mandatory if mentioned

## Output Structure

```
## Partner Update — [date]

**Action required:**
- [Anything partners must change in their integration, with deadline if applicable]

**API changes:**
- [Endpoint additions, modifications, removals with version context]

**Improvements:**
- [Performance or capability improvements that benefit partner integrations]

**Deprecation notices:**
- [What is being deprecated, removal date, replacement]
```

## Tone

Professional. Direct. Partners are technical — be specific and complete.

## Good Example

> The `/v2/webhooks` endpoint now supports retry configuration. No changes
> required to existing integrations. New `retry_policy` field is optional and
> defaults to current behavior.

## Bad Example

> We made some improvements to webhooks that partners might find useful.
