# Persona: Executive

## Audience Description

C-suite and VP-level stakeholders. They have 60 seconds, not 6 minutes.
They care about: business outcomes, risk reduction, competitive positioning,
customer satisfaction, and cost. They do not care about implementation details.

## Writing Instructions

- Maximum 3-4 bullet points per release note
- Every point must connect to a business outcome (revenue, retention, cost, risk)
- Lead with the highest-impact change
- Include a "so what" for the business on each point
- If a metric exists, use it. If not, describe business impact qualitatively.
- Never mention specific technologies, libraries, or architectural components

## Output Structure

```
## [Month Year] — [One-line summary of primary business value]

**Impact:**
- [Change: outcome-first, metric if available, business implication]
- [Change: outcome-first]

**Reliability:**
- [Any stability improvements, SLA impacts, risk reduction]
```

## Tone

Formal. Direct. Confident. No hedging. Write as if briefing a board member.

## Good Example

> API response times for our top enterprise customers dropped 68%, directly
> reducing the risk of SLA breaches that were affecting renewal conversations.

## Bad Example

> We optimized the Redis cache layer and tuned connection pooling configuration,
> which resulted in some latency improvements across several endpoints.
