# Persona: The Partner

Integration partners and API consumers who have built on top of this platform.
A platform change that breaks their integration is their problem — not the platform's.

---

## Who They Are

A senior engineer at a company that has built a product or integration on top of this
platform. Their customers don't know this platform exists — they just know whether the
integration works. When the platform ships a breaking change and they don't catch it,
their customers file tickets against *their* product. They read release notes carefully
because they've learned to.

## When They Read This

In their Slack engineering channel at 9:30am, before standup. Three minutes. Scanning
for two things in order: (1) "Action Required" or "Breaking" — if yes, this goes to
the top of today's work. (2) Anything touching the API surfaces their integration uses.

## What They Need

- Do I need to update my integration before this reaches production?
- If yes, what exactly needs to change and by when?
- Is backward compatibility guaranteed for anything I'm currently using?

## What to Leave Out

- End-user or business-outcome framing
- Internal changes with no API surface impact
- UI changes that don't affect the API or webhooks
- Marketing language

---

## Writing Instructions

- **Lead with action-required items.** If something requires partner action, that's bullet one.
- **Explicitly state backward compatibility.** "Existing integrations are unaffected" is worth writing.
- **Include version context.** Which API version is affected? Is v1 impacted?
- **Deprecation timelines are mandatory.** No removal date = useless notice.
- **Reference exact API surfaces.** Endpoint paths, field names, OAuth scopes, webhook event types.
- **Include migration guidance** when behavior changes. Where do they look? What do they change?

## Output Structure

```
## Partner Update — [YYYY-MM-DD]

**Action required** *(skip if nothing requires partner action)*:
- [What to do, what the deadline is, what happens if they don't act]

**API changes:**
- [Endpoint or field: what changed, new behavior, backward-compatible or not]

**Deprecation notices** *(skip if none)*:
- [What: deprecated [date]. Removal: [date]. Replacement: [endpoint or pattern]]

**Performance and reliability:**
- [Changes to API response times, rate limits, or reliability — specific numbers]

**Informational** *(no action needed)*:
- [Platform changes worth knowing about but requiring no partner response]
```

## Good Example

> ## Partner Update — 2026-03-16
>
> **API changes:**
> - `/v2/webhooks` now supports an optional `retry_policy` field.
>   Accepts `{"max_retries": 3, "backoff": "exponential"}`. Existing integrations
>   are unaffected — omitting the field preserves current behavior.
> - Export job status response now includes `queued_at` timestamp. Non-breaking addition.
>
> **Deprecation notices:**
> - `/v1/webhooks` deprecated 2026-03-16. Removal: 2026-07-01. Migrate to `/v2/webhooks` —
>   same payload format, adds `retry_policy` support.
>
> **Performance and reliability:**
> - Webhook delivery p99 latency: 4.2s → 0.9s. No integration changes required.

## Bad Example

> We made some improvements to webhooks that partners will find useful. Some older
> endpoints may be going away eventually.

**Why this fails:** No timeline, no backward-compat declaration, no specifics. "Eventually"
gives nothing to plan against. They'll flag it for follow-up with partner support — a 3-day
delay to get the information this note should have contained.
