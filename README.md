# ShipSignal

![CI](https://github.com/fairley46/ShipSignal/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js >=20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

> A GitHub Action that reads every merge, generates audience-specific release notes using AI, and commits them to your repo automatically. No manual writing. No communication gap.

---

## Table of Contents

- [See It in Action](#see-it-in-action)
- [The Problem](#the-problem)
- [What ShipSignal Does](#what-shipsignal-does)
- [How It Works](#how-it-works)
- [End-to-End Example](#end-to-end-example)
- [Quick Start](#quick-start)
- [Setup Guide](#setup-guide)
- [Local Development](#local-development)
- [Personas](#personas)
  - [Built-in Personas](#built-in-personas)
  - [Adding a Persona](#adding-a-persona)
  - [Editing a Persona](#editing-a-persona)
  - [Removing a Persona](#removing-a-persona)
- [Brand Voice](#brand-voice)
  - [Use a pre-built voice](#use-a-pre-built-voice)
  - [Build your own](#build-your-own)
- [Output](#output)
- [Manual Runs](#manual-runs)
- [Notifications](#notifications)
  - [Configuration](#configuration)
  - [Slack and Microsoft Teams](#slack-and-microsoft-teams)
  - [Confluence](#confluence)
  - [Custom webhook](#custom-webhook)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## See It in Action

**What the engineer committed:**
> "Resolve race condition in payment processor. Lock TTL extended from 3.0s to 8.0s.
> Async validation pipeline reduces p99 checkout from 4.1s to 0.8s. Export jobs
> backgrounded to worker queue."

**What ShipSignal generated for the VP:**
> "Checkout reliability incident resolved. p99 latency down 80% to under a second.
> A potential double-charge bug was caught and fixed before customer impact."

**What ShipSignal generated for the customer:**
> "Checkout is fast now — under a second. Exports no longer block your browser.
> We fixed a bug that could charge you twice. Nothing you need to do."

**What ShipSignal generated for the technical user:**
> "Payment lock TTL extended 3s → 8s (resolves race under high concurrency). Async
> validation pipeline: p99 4.1s → 0.8s. Export jobs moved to worker queue — no longer
> blocking the request thread. No API or schema changes."

Same commit. Three different notes. Each one says exactly what that audience needs to hear — and nothing they don't. Committed to your repo automatically on every merge.

---

## The Problem

Engineers are shipping faster than ever — but the communication layer hasn't kept up. Product owners still spend hours manually reading PRs, decoding commit messages, and translating technical changes into language that customers can understand. That's not a scalable job. The result: enormous engineering value that never gets communicated. Customers don't know what changed. Stakeholders can't see the progress.

**ShipSignal closes that gap.** It automates the translation from technical work to customer value — so the communication layer moves at the speed of code.

---

## What ShipSignal Does

On every merge or push, ShipSignal:

1. Reads the git diff, commit messages, and PR description
2. Pulls linked Jira ticket context (optional — works without Jira)
3. Uses AI to extract the value signal — metrics, improvements, fixes, new capabilities
4. Generates a separate release note for each configured **persona** — a named audience like `vp`, `customer`, or `technical-user`, each with its own framing and structure
5. Commits the notes to your repo as markdown files automatically

The product owner's job shifts from **writing** to **talking to customers**. The communication still happens — it just doesn't require a human to produce it.

---

## How It Works

```
merge / push to configured branch
        ↓
GitHub Action fires
        ↓
reads: git diff + commits + PR description + Jira tickets
        ↓
AI extracts value signals (metrics, changes, fixes, improvements)
        ↓
generates notes per persona (vp, customer, partner, etc.)
        ↓
commits markdown files to release-notes/{environment}/
```

Content customization happens in two places:

- **`config/voice.md`** — your brand voice, writing rules, banned phrases. Owned by product.
- **`personas/*.md`** — one file per audience. Add, edit, or remove. No code changes needed.

Everything else is automatic.

---

## End-to-End Example

See [`examples/e2e-example.md`](examples/e2e-example.md) for a complete walkthrough:

1. A team picks The Operator voice and copies it to `config/voice.md`
2. They configure deploy points — which branches, which environments, which personas
3. An engineer merges three commits to `main`
4. ShipSignal reads the commits, PR description, and Jira tickets and extracts the value signals
5. Three notes are generated and committed — one per configured persona

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
#    Jira secrets are optional — ShipSignal works without them

# 5. Test locally before pushing (see Local Development)

# 6. Push to a configured branch — ShipSignal runs automatically
```

See the [Setup Guide](#setup-guide) for full configuration details.

---

## Setup Guide

### Step 1 — Configure your team

Copy the sample config:

```bash
cp examples/sample-team-config.yml config/team-config.yml
```

Set your team name and Jira project key:

```yaml
team:
  name: "Platform Team"
  jira_project_key: "PLAT"
```

Configure your deploy points — which branches map to which environments, and which personas fire for each:

```yaml
deploy_points:
  - environment: production
    branch_pattern: "main"
    personas: [vp, customer, partner]

  - environment: staging
    branch_pattern: "release/*"
    personas: [internal, technical-user]
```

---

### Step 2 — Choose your AI provider

Set `ai_provider.type` in `team-config.yml`:

| Provider | `type` value | Secret required |
|---|---|---|
| Anthropic | `anthropic` | `AI_API_KEY` |
| GitHub Copilot Enterprise | `github-copilot` | `GITHUB_TOKEN` with Copilot API access |
| OpenAI | `openai` | `AI_API_KEY` |
| Azure OpenAI | `azure-openai` | `AI_API_KEY` + `azure_endpoint` + `azure_deployment` |

```yaml
ai_provider:
  type: anthropic
  model: claude-sonnet-4-6
```

---

### Step 3 — Add secrets

Go to **Settings > Secrets and variables > Actions** in your repo and add:

| Secret | Required | Description |
|---|---|---|
| `AI_API_KEY` | Yes (unless using GitHub Copilot) | Your AI provider API key |
| `JIRA_BASE_URL` | Optional | Your Jira instance URL, e.g. `https://yourorg.atlassian.net` |
| `JIRA_USER_EMAIL` | Optional | Email address associated with your Jira account |
| `JIRA_API_TOKEN` | Optional | Jira API token — generate at [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens) |

ShipSignal works without Jira. If the secrets aren't set, it skips ticket enrichment and generates notes from the git diff and commit messages alone.

The workflow requires these permissions (already set in the workflow file — no action needed):
- `contents: write` — to commit generated notes back to the repo
- `pull-requests: read` — to read PR descriptions

If your repo has branch protection on `main`, you'll need to allow the ShipSignal bot to bypass it, or configure a dedicated bot token with write access.

**Secret management options:**

- **Repo-level** — Settings > Secrets and variables > Actions (default)
- **Org-level** — Org Settings > Secrets — set once, inherited by all repos. Best for org-wide rollouts.
- **Environments** — Scope secrets to specific environments (production vs staging) with optional approval gates
- **External** — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault — for teams with existing secret management infrastructure

---

### Step 4 — Customize your voice

Open `config/voice.md` and update it to match your brand. This file defines:

- Core writing principles (lead with value, active voice, specificity)
- Banned phrases (no "leverages", no "seamless", no "game-changing")
- Formatting rules
- How to handle metrics, security fixes, and sensitive information

This file is owned by the product team. No engineering changes needed to update it.

---

### You're set

Push to a configured branch. ShipSignal will generate a release note for each persona in that deploy point and commit the files to `release-notes/{environment}/` automatically. No further action required.

To optionally send those notes to Slack, Teams, Confluence, or a webhook, see [Notifications](#notifications).

---

## Local Development

Test your configuration and personas locally before pushing to CI.

**Setup:**

```bash
cp .env.local.example .env.local
# Fill in your values — at minimum set AI_API_KEY and DEPLOY_ENVIRONMENT
```

**Run:**

```bash
cd action
npm install
npm run dev
```

`DRY_RUN=true` is set in `.env.local.example` by default — ShipSignal will generate notes and print them to your terminal without writing any files or committing anything.

**Other useful commands:**

```bash
npm run typecheck   # type-check without building
npm run lint        # run ESLint
npm run build       # compile TypeScript to dist/
```

**Testing a new persona locally:**

1. Create your persona file in `personas/`
2. Add it to `deploy_points[].personas` in `config/team-config.yml`
3. Set `PERSONA_OVERRIDE=your-persona-name` in `.env.local`
4. Run `npm run dev` and review the output before pushing

---

## Personas

Personas are the core of ShipSignal. Each persona is a plain markdown file in the `personas/` folder that defines a specific audience — who they are, what they care about, how they want to be spoken to, and the exact structure of their release notes.

**No code changes are needed to manage personas.** Add a file, edit a file, delete a file.

---

### Built-in Personas

| File | Persona | Who they are | Typical environments |
|---|---|---|---|
| `vp.md` | The VP | C-suite or VP exec who owns the board and customer narrative. Reads the first bullet — if it doesn't connect to a business outcome, the email closes. No technical terms, ever. | Production |
| `customer.md` | The Customer | Power user who lives in the product daily. First question when an update lands: *did this break what I depend on?* Writes to felt experience, not implementation. | Production |
| `technical-user.md` | The Technical User | Senior engineer or admin keeping their systems working with this product. Scans for `Breaking:` first, then endpoint names, then metrics. Vague language means an untrustworthy note. | Staging, Production |
| `partner.md` | The Partner | Engineer at a company that has built an integration on top of this platform. A breaking change they miss becomes their customer's problem. Needs exact API surfaces and hard deprecation timelines. | Production |
| `internal.md` | The Internal User | QA lead or PM running the staging sign-off. Reading this to build a test plan. Every change is a test scenario. Needs Jira IDs, setup steps, and edge cases — not customer-facing framing. | Staging / UAT |

Each file includes writing instructions, an exact output template, and a good/bad example.
Add your own by copying `personas/TEMPLATE.md` — no code changes needed.

---

### Adding a Persona

1. Copy the template as a starting point:

```bash
cp personas/TEMPLATE.md personas/enterprise-admin.md
```

2. Fill in each section — who they are, when they read this, what they need, what to
   leave out, writing instructions, output structure, and a good/bad example. The
   template includes guidance in each section to help you get specific.

3. Add the persona name to the relevant `deploy_points[].personas` list in `config/team-config.yml`:

```yaml
deploy_points:
  - environment: production
    personas: [vp, customer, partner, enterprise-admin]
```

4. Test locally with `PERSONA_OVERRIDE=enterprise-admin npm run dev` before pushing.

---

### Editing a Persona

Open the file in `personas/` and update it directly. Changes take effect on the next pipeline run. Common edits:

- **Tone shifts** — update the Tone section and the Good/Bad examples
- **Structure changes** — update the Output Structure template
- **Scope changes** — add or remove items from Writing Instructions
- **Audience changes** — if a persona's audience definition evolves, update the Audience Description

The product team can own and evolve these files independently of the engineering team.

---

### Removing a Persona

1. Delete the file from `personas/`
2. Remove the persona name from `deploy_points[].personas` in `config/team-config.yml`

---

## Brand Voice

If personas answer **who** you're writing for, brand voice answers **how you sound doing it.**

Your brand voice is a single file — `config/voice.md` — that applies universally to every persona on every run. It's the writing personality layer: tone, rhythm, banned phrases, formatting rules, how to translate technical metrics into plain language. One file controls all of it, across every audience, on every deployment.

You have two options: start from a pre-built voice and get running today, or build your own from scratch.

---

### Use a pre-built voice

ShipSignal ships with six voices, each tuned for a different brand personality. Pick the one that sounds like you, copy it to `config/voice.md`, and you're set. Edit it freely — they're starting points, not rules.

| File | Voice | Style | Best for | Sample line |
|---|---|---|---|---|
| `the-operator.md` | The Operator | Direct, accountable, metrics-first | Ops-heavy products, reliability platforms | *"Checkout errors: was 3.2%. Now 0.1%."* |
| `the-visionary.md` | The Visionary | Minimalist, poetic, human-centered | Consumer products, design-forward platforms | *"The wait is gone. Search is instant now."* |
| `the-storyteller.md` | The Storyteller | Warm, authentic, failure-honest | B2C, lifestyle brands, community products | *"We broke this last month. Here's what we learned."* |
| `the-customer-champion.md` | The Customer Champion | Principled, clear, customer-obsessed | Enterprise B2B, long-term relationships | *"Three enterprise teams flagged this in QBRs. It's resolved."* |
| `the-straight-shooter.md` | The Straight Shooter | Raw, fast, zero corporate | Developer tools, startup products | *"Search was broken for queries over 50 chars. Fixed. Go try it."* |
| `the-connector.md` | The Connector | Empathetic, research-grounded, warm | Healthcare, education, HR, community | *"A lot of you have been working around this for months. Here's what changed."* |

```bash
cp voices/the-operator.md config/voice.md
```

---

### Build your own

If your brand has an established style, write `config/voice.md` from scratch. The file has a defined structure — see `voices/README.md` for guidance — but the content is entirely yours.

A complete `config/voice.md` defines:

- **Core principles** — how to frame value, language level, specificity requirements
- **Banned phrases** — words and constructions that should never appear in output
- **Formatting rules** — headers, bullets, metric formatting, date formatting
- **Metric translation guide** — how to convert technical numbers into customer language
- **Sensitive information rules** — what to never expose (infra topology, vulnerability details, internal ticket IDs)

Update `config/voice.md` whenever your brand voice evolves, a new communications standard is adopted, or you find patterns in the output that need correcting across all personas at once.

---

## Output

**By default, ShipSignal does one thing: it commits markdown files to your repo.**

On every merge or push to a configured branch, the `release-notes.yml` workflow runs automatically, generates notes for each persona, and commits them back to the repo as a `ShipSignal[bot]` commit. No manual step required. The committed markdown is the primary output — everything else (notifications, downstream tooling) is optional and built on top of it.

Generated files land in:

```
release-notes/{environment}/{YYYY-MM-DD}-{sha8}-{persona}.md
```

Examples:
```
release-notes/production/2026-03-16-a3f7b2c1-vp.md
release-notes/production/2026-03-16-a3f7b2c1-customer.md
release-notes/staging/2026-03-15-f4a921bc-internal.md
release-notes/hotfix/2026-03-14-8de3c12a-customer.md
```

Each file includes YAML frontmatter for downstream tooling:

```yaml
---
release_date: 2026-03-16
environment: production
persona: customer
commit: a3f7b2c1
branch: main
generated_by: ShipSignal
---
```

If a push contains no user-visible changes — pure internal refactor, dependency bumps with no impact — ShipSignal skips file generation for that run.

To send these notes to Slack, Teams, Confluence, or a custom endpoint, see [Notifications](#notifications). That step is always manual — you read the committed files first, then decide to send.

---

## Manual Runs

Trigger note generation manually from the GitHub Actions UI under **Actions > Generate Release Notes > Run workflow**.

Optional inputs:

| Input | Description | Example |
|---|---|---|
| `environment` | Override the detected environment | `production` |
| `personas` | Comma-separated persona override | `vp,customer` |

Useful for re-generating notes after updating a persona file, or for previewing a new persona against a recent commit before wiring it into the pipeline.

This triggers **note generation only** — it writes and commits markdown files. To send notifications, see [Notifications](#notifications).

---

## Notifications

Notifications are optional additions on top of the primary output — markdown files committed to your repo. The committed markdown is always the source of truth. Notifications exist to close the gap between "the note exists in the repo" and "the right people know about it."

Three distinct feedback loops are supported: instant communication (Slack, Teams), documentation systems (Confluence), and custom webhooks (email relays, Zapier, Make, or your own serverless function). Each hook is opt-in, per-persona, and gated behind an explicit manual step.

**Critical constraint: review before sending.** The `notify.yml` workflow is manually triggered. The engineer merges, reads the committed markdown, and only then goes to Actions → "Send Notifications" → Run workflow. The manual trigger is the review step — AI-generated content is never sent automatically.

---

### Configuration

Add a `notify` block to any `deploy_points` entry in `team-config.yml`. Keys are persona names or `"*"` (wildcard for all personas in that deploy point). Values are arrays — a single persona can fan out to multiple channels.

```yaml
deploy_points:
  - environment: production
    branch_pattern: "main"
    personas: [vp, customer, partner]
    notify:
      customer:
        - type: slack
          webhook_url: $SLACK_CUSTOMER_WEBHOOK
      vp:
        - type: webhook
          url: $EMAIL_RELAY_WEBHOOK
          headers:
            Authorization: Bearer $EMAIL_RELAY_TOKEN
      partner:
        - type: teams
          webhook_url: $TEAMS_PARTNER_WEBHOOK
      "*":
        - type: confluence
          base_url: https://yourco.atlassian.net/wiki
          page_id: "98765432"
          username_secret: CONFLUENCE_USER
          token_secret: CONFLUENCE_TOKEN
```

Values prefixed with `$` (e.g., `$SLACK_CUSTOMER_WEBHOOK`) are resolved from environment variables at runtime — secrets never live in the config file. For `confluence`, `username_secret` and `token_secret` are the **names** of the environment variables, not the values.

Add the corresponding secrets to the `notify.yml` workflow env block:

```yaml
# In .github/workflows/notify.yml, under the "Send notifications" step env:
SLACK_CUSTOMER_WEBHOOK: ${{ secrets.SLACK_CUSTOMER_WEBHOOK }}
CONFLUENCE_USER: ${{ secrets.CONFLUENCE_USER }}
CONFLUENCE_TOKEN: ${{ secrets.CONFLUENCE_TOKEN }}
```

Notification failures are caught and logged as warnings. They never fail the workflow. The committed markdown is always the authoritative record.

---

### Slack and Microsoft Teams

Both use Incoming Webhooks — no OAuth app setup required.

**Slack:**

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From scratch
2. Enable "Incoming Webhooks" → Add New Webhook to Workspace → pick a channel
3. Copy the webhook URL → add as a repo secret (e.g., `SLACK_CUSTOMER_WEBHOOK`)

```yaml
notify:
  customer:
    - type: slack
      webhook_url: $SLACK_CUSTOMER_WEBHOOK
```

**Microsoft Teams:**

1. In the target channel → Connectors → "Incoming Webhook" → Configure → copy the URL
2. Add as a repo secret (e.g., `TEAMS_PARTNER_WEBHOOK`)

```yaml
notify:
  partner:
    - type: teams
      webhook_url: $TEAMS_PARTNER_WEBHOOK
```

---

### Confluence

Appends the release note to an existing Confluence page, prepended at the top (newest-first). The page must already exist — ShipSignal updates it, it does not create it.

**Setup:**

1. Find the page ID — it's in the URL: `...atlassian.net/wiki/spaces/SPACE/pages/98765432/Page+Title`
2. Generate an Atlassian API token at [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Add two secrets: `CONFLUENCE_USER` (your Atlassian email) and `CONFLUENCE_TOKEN` (the API token)

```yaml
notify:
  "*":
    - type: confluence
      base_url: https://yourco.atlassian.net/wiki
      page_id: "98765432"
      username_secret: CONFLUENCE_USER   # env var name, not the value
      token_secret: CONFLUENCE_TOKEN     # env var name, not the value
```

`"*"` as the key means this hook fires for every persona in the deploy point. Each run prepends a new section to the page headed with the persona name and date.

---

### Custom webhook

A generic HTTP POST that covers email relays, Zapier, Make, and any custom endpoint. ShipSignal sends a standard JSON payload:

```json
{
  "persona": "customer",
  "environment": "production",
  "release_date": "2026-03-17",
  "commit": "a3f7b2c1",
  "branch": "main",
  "content": "## What's new...",
  "generated_by": "ShipSignal"
}
```

Use cases:
- **Email** — point at a SendGrid, Resend, or Postmark relay endpoint
- **Zapier / Make** — use a webhook trigger, then route to any downstream service
- **Custom** — your own serverless function, internal API, or notification service

```yaml
notify:
  vp:
    - type: webhook
      url: $EMAIL_RELAY_WEBHOOK
      headers:
        Authorization: Bearer $EMAIL_RELAY_TOKEN
        X-Source: ShipSignal
```

All header values are also resolved from environment variables when prefixed with `$`.

---

## Troubleshooting

**`Persona file not found: personas/X.md`**
A persona listed in `team-config.yml` doesn't have a corresponding file in `personas/`. Either create the file or remove the persona name from the `deploy_points[].personas` list.

**Workflow triggered but no notes generated — no error**
Your branch pattern in `deploy_points[].branch_pattern` likely doesn't match the branch you pushed to. Check that `main` is listed for pushes to main, `release/*` for release branches, etc. Use a `workflow_dispatch` run with an explicit environment override to test.

**`No deploy point configured for environment: X`**
The detected environment doesn't match any `deploy_points[].environment` in your config. Check your branch pattern matches the branch you pushed to, or use a `workflow_dispatch` run with an explicit environment override.

**`Unknown ai_provider.type`**
The `ai_provider.type` in `team-config.yml` isn't one of the supported values. Supported: `anthropic`, `github-copilot`, `openai`, `azure-openai`.

**AI call fails with 401 / authentication error**
Your `AI_API_KEY` secret is missing, expired, or set incorrectly. For GitHub Copilot Enterprise, confirm your `GITHUB_TOKEN` has Copilot API access enabled at the org level.

**Jira tickets not appearing in generated notes**
Check that `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, and `JIRA_API_TOKEN` are all set. Verify commit messages reference ticket IDs matching the pattern `PROJ-123` where `PROJ` matches your `jira_project_key`. Jira errors are non-fatal — the run continues without ticket context rather than failing.

**Bot commit fails with `refusing to allow... without workflow scope`**
The `GITHUB_TOKEN` in your Actions environment doesn't have permission to push to a protected branch. Either loosen branch protection rules to allow the ShipSignal bot, or set the workflow to write to a separate branch.

**Output is vague or missing metrics**
The quality of generated notes depends on the quality of inputs. Write descriptive PR descriptions and include performance data in commit messages or Jira ticket descriptions. The AI extracts what it's given — if the signal isn't there, the output reflects that.

**Notification workflow runs but nothing is sent**
Either there's no `notify` block in `team-config.yml` for that environment, or the persona name in the workflow input doesn't match any note file in `release-notes/{environment}/`. Check that the file exists and that the persona name matches exactly.

**Slack or Teams message not arriving**
Confirm the webhook URL secret is set in your repo and uncommented in the `env:` block of `notify.yml`. Test the webhook URL directly with a `curl -X POST` to confirm it's still active — Slack and Teams webhook URLs can expire or be revoked.

**Confluence update failing with 403**
The API token doesn't have permission to edit the target page. Confirm the token belongs to a user with edit access to that specific page. Confluence space permissions and page-level restrictions are evaluated separately.

**Confluence update failing with 409**
A version conflict — the page was updated between ShipSignal's GET and PUT. Re-run the notification workflow; it will fetch the current version and retry cleanly.

---

## License

MIT
