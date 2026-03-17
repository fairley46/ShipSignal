# Legibly

![CI](https://github.com/fairley46/Legibly/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js >=20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

> A GitHub Action that reads every merge and generates audience-specific plain language notes automatically — committed back to your repo on every PR.

---

## Table of Contents

- [See It in Action](#see-it-in-action)
- [The Problem](#the-problem)
- [What Legibly Does](#what-legibly-does)
- [How It Works](#how-it-works)
- [MCP Skill](#mcp-skill)
- [Repo layout](#repo-layout)
- [End-to-End Example](#end-to-end-example)
- [Quick Start](#quick-start)
- [Personas](#personas)
- [Brand Voice](#brand-voice)
- [License](#license)

---

## See It in Action

**What the engineer committed:**
> "Resolve race condition in payment processor. Lock TTL extended from 3.0s to 8.0s.
> Async validation pipeline reduces p99 checkout from 4.1s to 0.8s. Export jobs
> backgrounded to worker queue."

**What Legibly generated for the VP:**
> "Checkout reliability incident resolved. p99 latency down 80% to under a second.
> A potential double-charge bug was caught and fixed before customer impact."

**What Legibly generated for the customer:**
> "Checkout is fast now — under a second. Exports no longer block your browser.
> We fixed a bug that could charge you twice. Nothing you need to do."

**What Legibly generated for the technical user:**
> "Payment lock TTL extended 3s → 8s (resolves race under high concurrency). Async
> validation pipeline: p99 4.1s → 0.8s. Export jobs moved to worker queue — no longer
> blocking the request thread. No API or schema changes."

Same commit. Three different notes. Each one says exactly what that audience needs to hear, and nothing they don't. Committed to your repo automatically on every merge.

---

## The Problem

Engineers are shipping at a pace that didn't exist two years ago. A single agentic session can produce what used to take a sprint. But the communication layer hasn't kept up. Product owners still spend hours manually reading PRs, decoding commit messages, and translating technical changes into language that customers can understand. That's not a scalable job. The result: enormous engineering value that never gets communicated. Customers don't know what changed. Stakeholders can't see the progress.

**Legibly closes that gap.** It automates the translation from technical work to customer value, so the communication layer moves at the speed of code.

→ [The data behind this problem](docs/overview.md)

---

## What Legibly Does

On every merge or push, Legibly:

1. Reads the git diff, commit messages, and PR description
2. Pulls linked Jira ticket context (optional, works without Jira)
3. Uses AI to extract the value signal: metrics, improvements, fixes, new capabilities
4. Generates a separate release note for each configured **persona** (a named audience like `vp`, `customer`, or `technical-user`, each with its own framing and structure)
5. Commits the notes to your repo as markdown files automatically, then prunes to keep the most recent files per persona (configurable, default 50)

That's the automatic path — it always runs, no action needed. A second path exists for teams that want to push notes further: once the markdown is committed, an engineer reads it and manually triggers the notification workflow to send to Slack, Teams, Confluence, or a webhook. AI-generated content is never sent automatically.

A third path — the [MCP skill](#mcp-skill) — exposes the same translation pipeline conversationally inside Claude Desktop, for on-demand use before a merge, mid-review, or during standup prep.

**Note on output quality:** Legibly translates what it's given. The quality of generated notes is directly proportional to the quality of PR descriptions and commit messages. See [Engineering Process](docs/setup.md#engineering-process) for what to write and why it matters.

The product owner's job shifts from **writing** to **talking to customers**. The communication still happens. It just doesn't require a human to produce it.

---

## How It Works

```
merge / push to configured branch
        ↓
GitHub Action fires automatically
        ↓
reads: git diff + commits + PR description + Jira tickets (optional)
        ↓
AI extracts value signals (metrics, changes, fixes, improvements)
        ↓
generates notes per persona (vp, customer, partner, etc.)
        ↓
commits markdown files to release-notes/{environment}/    ← always, no action needed

        ── if notify is configured ──────────────────────────────
        ↓
engineer reads the committed markdown files
        ↓
Actions → "Send Notifications" → Run workflow → pick environment + persona
        ↓
hooks fire: Slack / Teams / Confluence / webhook
        ─────────────────────────────────────────────────────────
```

Content customization happens in two places:

- **`config/voice.md`**: your brand voice, writing rules, banned phrases. Owned by product.
- **`personas/*.md`**: one file per audience. Add, edit, or remove. No code changes needed.

The automatic path (merge → generate → commit) runs on every push with no action needed. The notification path is always manual: an engineer reads the committed notes first, then decides to send.

---

## MCP Skill

The MCP skill connects Legibly to Claude Desktop so you can translate PRs conversationally — before a merge, mid-review, during standup prep, or when explaining a change to a stakeholder. Same AI provider, personas, and voice as the Action.

**What you can do:**
- Ask "What personas does Legibly know about?" to see all configured audiences
- Paste a PR description and get release notes for any persona instantly
- Give a GitHub PR URL and Legibly fetches the body automatically
- Add a git diff or commit log for richer, more specific output
- Request multiple personas at once to compare how the same change reads to different audiences

**Setup in one paragraph:** build the action (`cd action && npm run build`), add `legibly` to your Claude Desktop `mcpServers` config with the path to `dist/mcp.js` and your `LEGIBLY_REPO_ROOT` and `AI_API_KEY`, then restart Claude Desktop.

→ [Full MCP setup and usage guide](docs/mcp.md)

---

## Repo layout

| Folder / file | What it is |
|---|---|
| `docs/` | Problem overview, setup guide, customization, notifications, and troubleshooting. |
| `personas/` | One markdown file per audience. Add, edit, or remove — no code changes needed. |
| `voices/` | Pre-built brand voice styles. Copy one to `config/voice.md` to get started. |
| `config/` | Your `team-config.yml` (deploy points, AI provider) and `voice.md` (brand voice) live here. |
| `examples/` | Sample config and a full end-to-end walkthrough. Start here. |
| `release-notes/` | Where Legibly commits generated markdown. Organised by environment. |
| `action/` | The GitHub Action source code (TypeScript). You don't need to touch this. |
| `prompts/` | The AI prompt templates Legibly uses internally. |

---

## End-to-End Example

See [`examples/e2e-example.md`](examples/e2e-example.md) for a complete walkthrough:

1. A team picks The Operator voice and copies it to `config/voice.md`
2. They configure deploy points: which branches, which environments, which personas
3. An engineer merges three commits to `main`
4. Legibly reads the commits, PR description, and Jira tickets and extracts the value signals
5. Three notes are generated and committed, one per configured persona

The final section shows the gap side-by-side: what the engineer wrote vs. what each
audience needed to hear. Same facts. Right signal for the right person.

---

## Quick Start

**Requirements:** Node.js 20+, a GitHub repo, an AI provider key or GitHub Copilot Enterprise access.

```bash
# 1. Fork this repo on GitHub

# 2. Copy and configure the sample config
cp examples/sample-team-config.yml config/team-config.yml

# 3. Set your team name, AI provider, and deploy points (branches → personas)

# 4. Add your AI provider key to GitHub Actions secrets (AI_API_KEY)
#    Jira secrets are optional — Legibly works without them

# 5. Test locally before pushing (see Local Development)

# 6. Push to a configured branch — Legibly runs automatically
```

See the [Setup Guide](docs/setup.md) for full configuration details.

---

## Personas

Personas are the core of Legibly. Each persona is a plain markdown file in the `personas/` folder that defines a specific audience: who they are, what they care about, how they want to be spoken to, and the exact structure of their release notes.

**No code changes are needed to manage personas.** Add a file, edit a file, delete a file.

### Built-in Personas

| File | Persona | Who they are | Typical environments |
|---|---|---|---|
| `vp.md` | The VP | C-suite or VP exec who owns the board and customer narrative. Reads the first bullet; if it doesn't connect to a business outcome, the email closes. No technical terms, ever. | Production |
| `customer.md` | The Customer | Power user who lives in the product daily. First question when an update lands: *did this break what I depend on?* Writes to felt experience, not implementation. | Production |
| `technical-user.md` | The Technical User | Senior engineer or admin keeping their systems working with this product. Scans for `Breaking:` first, then endpoint names, then metrics. Vague language means an untrustworthy note. | Staging, Production |
| `partner.md` | The Partner | Engineer at a company that has built an integration on top of this platform. A breaking change they miss becomes their customer's problem. Needs exact API surfaces and hard deprecation timelines. | Production |
| `internal.md` | The Internal User | QA lead or PM running the staging sign-off. Reading this to build a test plan. Every change is a test scenario. Needs Jira IDs, setup steps, and edge cases, not customer-facing framing. | Staging / UAT |

Each file includes writing instructions, an exact output template, and a good/bad example. For instructions on adding, editing, or removing personas, see [docs/customization.md](docs/customization.md).

---

## Brand Voice

If personas answer **who** you're writing for, brand voice answers **how you sound doing it.**

Your brand voice is a single file, `config/voice.md`, that applies universally to every persona on every run. It's the writing personality layer: tone, rhythm, banned phrases, formatting rules, how to translate technical metrics into plain language. One file controls all of it, across every audience, on every deployment.

### Pre-built voices

Legibly ships with six voices, each tuned for a different brand personality. Pick the one that sounds like you, copy it to `config/voice.md`, and you're set.

| File | Voice | Style | Best for | Sample line |
|---|---|---|---|---|
| `the-operator.md` | The Operator | Direct, accountable, metrics-first | Ops-heavy products, reliability platforms | *"Checkout errors: was 3.2%. Now 0.1%."* |
| `the-visionary.md` | The Visionary | Minimalist, poetic, human-centered | Consumer products, design-forward platforms | *"The wait is gone. Search is instant now."* |
| `the-storyteller.md` | The Storyteller | Warm, authentic, failure-honest | B2C, lifestyle brands, community products | *"We broke this last month. Here's what we learned."* |
| `the-customer-champion.md` | The Customer Champion | Principled, clear, customer-obsessed | Enterprise B2B, long-term relationships | *"Three enterprise teams flagged this in QBRs. It's resolved."* |
| `the-straight-shooter.md` | The Straight Shooter | Raw, fast, zero corporate | Developer tools, startup products | *"Search was broken for queries over 50 chars. Fixed. Go try it."* |
| `the-connector.md` | The Connector | Empathetic, research-grounded, warm | Healthcare, education, HR, community | *"A lot of you have been working around this for months. Here's what changed."* |

For instructions on building a custom voice from scratch, see [docs/customization.md](docs/customization.md).

---

## Docs

- [docs/overview.md](docs/overview.md) — Industry context: the gap between engineering velocity and communication capacity
- [docs/setup.md](docs/setup.md) — Setup Guide, Engineering Process, Local Development
- [docs/customization.md](docs/customization.md) — Personas and Brand Voice customization
- [docs/notifications.md](docs/notifications.md) — Output, Manual Runs, Notifications (Slack, Teams, Confluence, Webhook)
- [docs/mcp.md](docs/mcp.md) — MCP Skill: on-demand translation in Claude Desktop
- [docs/troubleshooting.md](docs/troubleshooting.md) — Troubleshooting

---

## License

MIT
