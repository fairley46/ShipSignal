# End-to-End Example

A payments engineering team sets up Legibly and pushes to production.
This is everything that happens — from configuration to commit to generated output.

---

## Step 1 — The Team Picks Their Voice

The Payments team wants direct, accountable communication. No fluff. Numbers when
they exist. They browse the voice library and copy The Operator into their config:

```bash
cp voices/the-operator.md config/voice.md
```

`config/voice.md` is now the universal style guide applied to every release note
this team generates — regardless of audience.

---

## Step 2 — The Team Configures Their Deploy Points and Personas

In `config/team-config.yml`, they define which branches map to which environments,
and which audiences get notes for each one:

```yaml
team:
  name: "Payments Team"
  jira_project_key: "PAY"

deploy_points:
  - environment: production
    branch_pattern: "main"
    personas:
      - vp          # Business outcomes and risk for leadership
      - customer    # Day-to-day product users
      - partner     # Integration partners and API consumers

  - environment: staging
    branch_pattern: "release/*"
    personas:
      - internal        # QA team building their test plan
      - technical-user  # Engineers checking for breaking changes

  - environment: hotfix
    branch_pattern: "hotfix/*"
    personas:
      - vp        # Leadership needs to know immediately
      - customer  # Users need to know what was broken and fixed

ai_provider:
  type: anthropic
  model: claude-sonnet-4-6
```

That's the entire configuration. When they push to `main`, Legibly generates
three notes — one for each persona listed under `production` — all written in
The Operator voice.

---

## Step 3 — The Engineer Merges to Main

Three commits land in a single PR merge:

```
a3f7b2c1  fix: resolve duplicate charge events under concurrent session load (PAY-2341)
e9d14f08  perf: replace synchronous checkout validation with async pipeline (PAY-2287)
b72c3a19  feat: background export processing with download notification (PAY-2156)
```

**PR description** (`#847 — Checkout stability and export backgrounding`):

```
Fixes a race condition we've been tracking since the Black Friday load test.
Under concurrent sessions (>200 req/s) the payment processor was occasionally
firing duplicate charge events. Root cause: lock timeout in the session store
was shorter than the charge confirmation window. Extended lock TTL and added
idempotency key validation on the processor side.

Also shipping the async checkout validation work from PAY-2287. Moves field
validation off the main thread — p99 checkout time drops from 4.1s to 0.8s
in load testing. No changes to the validation rules themselves.

PAY-2156: exports were blocking the UI thread while generating. Moved to a
background job queue. Users get an email/notification when the file is ready.
```

**Jira tickets pulled via API:**

```
PAY-2341 [Critical] Duplicate charge events under concurrent load
  Reported by enterprise customer after Black Friday peak traffic.
  Charge confirmation p99: 3.8s. Lock TTL: 3.0s. Race window: ~0.8s.
  Fix: lock TTL extended to 8s + idempotency key added to charge processor.

PAY-2287 [High] Checkout validation blocking main thread
  p99 checkout time: 4.1s at 150 concurrent users → 0.8s after async migration.
  Target was <1.0s. Shipped.

PAY-2156 [Medium] Export UI blocks while file generates
  Large exports (10k+ rows) blocking browser tab for up to 90 seconds.
  Now queued as background job. In-app + email notification on completion.
```

---

## Step 4 — Legibly Fires

The CI pipeline triggers on the merge to `main`. It reads the config, detects
the `production` environment, and queues one AI call per configured persona:
`vp`, `customer`, `partner`.

Before generating each note, it runs a signal extraction pass across all inputs:

```
SIGNAL EXTRACTION (internal scratchpad — not included in output)

Performance metrics:
- Checkout p99: 4.1s → 0.8s  (80% reduction, 150 concurrent users)
- Export blocking: up to 90s → 0s (async, notification on completion)

Reliability:
- Duplicate charge race condition resolved
- Root cause: lock TTL (3.0s) < charge confirmation window (3.8s p99)
- Risk level: was reaching production under enterprise-level load

User-visible changes:
- Checkout significantly faster — felt experience: <1s vs 4+ seconds
- Exports no longer block the browser tab
- Duplicate charge bug: prevented going forward

Breaking changes: none
Action required: none

Environment: production → frame as delivered value, live today
Voice: The Operator → direct, metrics-first, no softening
```

---

## Step 5 — The Output

Three files are committed back to the repo automatically:

```
release-notes/production/2026-03-16-a3f7b2c1-vp.md
release-notes/production/2026-03-16-a3f7b2c1-customer.md
release-notes/production/2026-03-16-a3f7b2c1-partner.md
```

Here's the customer note — written for a day-to-day product user, in The Operator voice:

---

**`release-notes/production/2026-03-16-a3f7b2c1-customer.md`**

```markdown
---
release_date: 2026-03-16
environment: production
persona: customer
commit: a3f7b2c1
branch: main
generated_by: Legibly
---

## What's new — March 16, 2026

**Faster checkout.**
Completing a purchase now takes under a second. It was taking 4+ seconds.
Live now — nothing to change on your end.

**Exports run in the background.**
Large exports were locking up your browser for up to a minute while the file
generated. That's gone. Start the export, keep working, get a notification
when it's ready.

**Fixed: duplicate charges.**
A bug under high-traffic conditions could cause a payment to process twice.
It's resolved. If you saw an unexpected duplicate charge, contact support.

**Nothing you need to do.** All three are live.
```

---

## The Gap This Closes

**What the engineer wrote:**

> "Resolve race condition in payment processor. Lock TTL extended from 3.0s to 8.0s.
> Idempotency key validation added on processor side. Async validation pipeline reduces
> p99 checkout from 4.1s to 0.8s. Export jobs backgrounded to worker queue."

**What the customer needed to hear:**

> "Checkout is fast now. Exports don't block your browser. We fixed a bug that could
> charge you twice. Nothing you need to do."

Same facts. Right signal for the right audience.

The VP got a note about SLA risk and enterprise account reliability.
The partner got a note confirming no API surface changes.
The customer got the note above.

All three generated automatically. Zero product owner time spent writing.
