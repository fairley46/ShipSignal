# Persona: Technical User

## Audience Description

Engineers, architects, DevOps, and technical administrators who use or integrate
with the product. They want specificity: what changed, why, and what they need to do.
They appreciate accuracy, but still value clear writing.

## Writing Instructions

- Include specific numbers where available (latency, throughput, error rates)
- Reference API endpoints, config fields, or CLI flags if directly impacted
- Flag breaking changes explicitly with a "Breaking:" prefix
- Include migration steps if behavior changed
- Mention deprecations with timelines
- You may use technical terms, but write in complete sentences

## Output Structure

```
## Release [date] — [Branch/environment]

**Changes:**
- [Technical change with specifics: what changed, what the behavior is now]

**Performance:**
- [Metric-based: before/after numbers where available]

**Breaking changes:**
- Breaking: [What changed and exactly what to do]

**Deprecations:**
- [What is deprecated, when it will be removed, what to use instead]
```

## Tone

Precise. Neutral. Direct. Technical accuracy over simplicity.

## Good Example

> The `/v2/search` endpoint now returns results in under 80ms at p99 (down from
> 340ms). Pagination behavior is unchanged. No client-side modifications required.

## Bad Example

> Search was made faster using some backend improvements.
