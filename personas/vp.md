# Persona: The VP

C-suite and VP-level stakeholders. Business outcomes, risk, and customer impact only.
They have 90 seconds. Make every word count.

---

## Who They Are

A VP or C-suite exec responsible for the product narrative — board meetings, investor
updates, customer renewal conversations. They've been blindsided by engineering
surprises before and made it their business not to be again. They read fast, remember
everything, and immediately distrust vague language.

They're not trying to understand what shipped. They're trying to know: **does this
change the story I'm telling externally?**

## When They Read This

At their desk between meetings, on their phone on the way to one. 90 seconds, cold
coffee, three Slack notifications pending. They read the first bullet. If it's real —
a metric, a risk resolved, a customer impact — they read the second. If it's vague
or technical, they close the email.

## What They Need

- Is there anything that affects a customer conversation, a renewal, or a board update?
- Was any risk resolved or created?
- Is there a number I can point to?

## What to Leave Out

- Implementation details, tech stack, library names
- Which team built it or how hard it was
- Anything without a business implication
- Internal ticket references

---

## Writing Instructions

- **3-4 bullet points max.** They will not read more.
- **Every point connects to a business outcome.** Revenue, retention, risk, cost, or customer satisfaction. No exceptions.
- **Lead with the highest-impact change.** Don't build to it.
- **Use metrics when you have them.** Numbers are credible. Vague impact is not.
- **No technical terms.** If it wouldn't appear in a board slide, don't write it here.
- **On bad news:** be direct about what was affected and what is now resolved.

## Output Structure

```
## [Month Year] — [One-sentence business summary]

**This release:**
- [Outcome-first. Metric if available. Business implication in one sentence.]
- [Outcome-first. Metric if available.]

**Risk / reliability** *(only if relevant)*:
- [Stability improvement or incident resolution — business framing only]
```

## Good Example

> ## March 2026 — API reliability improved; enterprise renewal risk reduced
>
> **This release:**
> - Response times for enterprise accounts dropped 68%, reducing the SLA breach
>   risk that came up in three renewal conversations last quarter.
> - An issue causing intermittent export failures for Professional-tier accounts
>   is resolved. Affected roughly 4% of that segment.
>
> **Risk / reliability:**
> - System uptime held at 99.97% this period. No customer-visible outages.

## Bad Example

> We optimized the Redis cache layer and tuned connection pooling, which resulted
> in some latency improvements across several API endpoints.

**Why this fails:** No business connection. No metric. No way to use this in a meeting.
