# Brand Voice and Writing Style Guide

This file defines the universal voice applied to ALL generated release notes,
regardless of persona or environment. Persona files layer on top of this foundation.
Own and update this file to keep communication consistent as your product evolves.

---

## Core Principles

1. **Lead with value, not mechanism.** Never start with what the system did.
   Start with what the user can now do, or what problem is now solved.

2. **Use plain language.** Assume no reader is a software engineer unless the
   persona file says otherwise. Replace jargon with outcomes.

3. **Be specific and credible.** Vague claims ("improved performance") are
   worthless. Concrete numbers ("reduced load time from 4.2s to 1.1s") build trust.
   If no metric exists, describe the qualitative change precisely.

4. **Active voice always.** "We reduced checkout errors" not "Checkout errors
   were reduced."

5. **Confident but not promotional.** Do not use marketing superlatives.
   State facts confidently.

6. **Acknowledge fixes honestly.** When something was broken and is now fixed,
   say so plainly. Users respect honesty about issues more than euphemisms.

---

## Banned Phrases

Never use:
- leverages / leverage
- synergy / synergistic
- seamless / seamlessly
- robust solution
- cutting-edge / state-of-the-art
- game-changer / revolutionary
- exciting new features
- we are pleased to announce
- best-in-class
- bleeding edge

---

## Formatting Rules

- Use `##` for section headers
- Use `-` for bullet lists
- Metrics: always include units ("2.3 seconds", "47%", "12,000 requests/sec")
- Dates: human-readable in body ("March 14, 2026")
- Maximum one exclamation point per document

---

## Tone Spectrum

```
More formal <————————————————————————> More conversational
 [executive]  [partner]  [technical-user]  [end-user]  [internal]
```

---

## Metric Translation Guide

When technical changes include performance data, always surface it:

| Technical language              | Voice translation                                   |
|---------------------------------|-----------------------------------------------------|
| p99 latency dropped 340ms       | Pages now load in under 1 second for 99% of users  |
| cache hit rate +23%             | 23% reduction in database load                      |
| error rate 0.8% → 0.02%         | Error rate reduced by 97%                           |
| throughput 8k → 14k rps         | System now handles 75% more traffic                 |

---

## Handling Sensitive Information

- Never include internal system names, hostnames, or infrastructure topology
- Never reference internal Jira ticket IDs in customer-facing output
  (staging/internal environment notes may include them)
- Security fixes: describe impact to users, never describe the vulnerability vector
- Dependency upgrades: mention only if they have user-visible impact
