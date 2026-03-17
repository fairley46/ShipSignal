# End-to-End Example

This is a complete ShipSignal run — from a real production merge to a generated
release note. Everything below is what the tool reads, how it processes it, and
what it produces.

**Scenario:** A payments team merges a bug fix and two improvements to `main`.
**Persona:** `customer.md` — the day-to-day user of the product.
**Voice:** `the-operator.md` — direct, accountable, metrics-first.

---

## 1. What the Engineer Pushed

**Commits merged to `main`:**

```
a3f7b2c1  fix: resolve duplicate charge events under concurrent session load (PAY-2341)
e9d14f08  perf: replace synchronous validation in checkout with async pipeline (PAY-2287)
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

**Jira tickets pulled:**

```
PAY-2341 [Critical] Duplicate charge events under concurrent load
  Labels: payments, reliability, incident-risk
  Description: Reported by enterprise customer (Acme Corp) after Black Friday.
  Charge confirmation p99 was 3.8s; lock TTL was 3.0s. Race window: ~0.8s.
  Fix: lock TTL extended to 8s + idempotency key added to charge processor.

PAY-2287 [High] Checkout validation blocking main thread
  Labels: performance, checkout
  p99 checkout time: 4.1s (load test at 150 concurrent users)
  After: 0.8s. Target was <1.0s. Shipped.

PAY-2156 [Medium] Export UI blocks while file generates
  Labels: exports, ux
  Large exports (10k+ rows) were blocking the browser tab for up to 90 seconds.
  Now queued as background job. Email + in-app notification on completion.
```

---

## 2. What ShipSignal Extracts

Before generating the note, ShipSignal runs a signal extraction pass across
all inputs. This is the reasoning scratchpad — it never appears in the output.

```
SIGNAL EXTRACTION

Performance metrics:
- Checkout p99: 4.1s → 0.8s (80% improvement, load tested at 150 concurrent users)
- Export blocking time eliminated: was up to 90s blocking; now async with notification

Reliability improvements:
- Duplicate charge event race condition resolved
- Root cause: lock TTL (3.0s) shorter than charge confirmation window (3.8s p99)
- Fix: extended TTL + idempotency keys — eliminates the race window
- Risk level: was affecting enterprise customers under concurrent load

User-visible behavior changes:
- Checkout flow is significantly faster (felt: button responds in <1s vs 4+ seconds)
- Exports no longer block the browser — user can navigate away and gets notified
- Duplicate charges: user-visible only if charge fired twice; now prevented

Breaking changes: none
Action required: none

Environment: production
Framing: delivered value customers can use today
```

---

## 3. Generated Release Note

**Output file:** `release-notes/production/2026-03-16-a3f7b2c1-customer.md`

---

```markdown
---
release_date: 2026-03-16
environment: production
persona: customer
commit: a3f7b2c1
branch: main
generated_by: ShipSignal
---

## What's new — March 16, 2026

**Faster checkout.**
Completing a purchase now takes under a second in most cases. It was taking
4+ seconds. That's live now — nothing to change on your end.

**Exports run in the background.**
Large exports were locking up your browser tab while the file generated —
sometimes for over a minute. That's gone. Start an export, keep working,
and you'll get a notification when it's ready to download.

**Fixed: duplicate charges.**
A bug under high-traffic conditions could cause a payment to be processed
twice. It's resolved. If you ever saw an unexpected duplicate charge, contact
support and we'll sort it out.

**Nothing you need to do.** All three changes are live automatically.
```

---

## The Gap This Closes

**What the engineer wrote:**

> "Resolve race condition in payment processor. Lock TTL extended from 3.0s to 8.0s.
> Idempotency key validation added on processor side. Async validation pipeline reduces
> p99 checkout from 4.1s to 0.8s. Export jobs backgrounded to worker queue."

**What the customer needed to hear:**

> "Checkout is fast now. Exports don't freeze your browser. We fixed a bug that
> could charge you twice. Nothing you need to do."

Same facts. Completely different signal.

ShipSignal reads the engineer's output and produces the customer's input — automatically,
on every merge, for every audience you've configured.
