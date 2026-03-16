# ShipSignal

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

> Engineering teams are shipping faster than ever. The communication layer hasn't kept up.

---

## Table of Contents

- [The Problem](#the-problem)
- [What ShipSignal Does](#what-shipsignal-does)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Setup Guide](#setup-guide)
- [Local Development](#local-development)
- [Personas](#personas)
  - [Built-in Personas](#built-in-personas)
  - [Adding a Persona](#adding-a-persona)
  - [Editing a Persona](#editing-a-persona)
  - [Removing a Persona](#removing-a-persona)
- [Brand Voice](#brand-voice)
- [Output](#output)
- [Manual Runs](#manual-runs)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## The Problem

Agentic development has changed the game. Engineers are shipping at a pace that was impossible two years ago — features, fixes, and optimizations that used to take sprints now land in hours. Jira is still a place to track work, but an engineer can do the work of an entire sprint in a single session.

The problem is that none of that velocity shows up in the customer conversation.

Product owners are still manually reading through PRs, decoding commit messages, and translating technical changes into language that customers can understand and care about. That's not a product owner problem — it's a structural gap. The communication layer was built for a world where teams shipped every two weeks. It hasn't scaled to a world where teams ship continuously, at 10x the pace.

The result: engineering teams are creating enormous value, and almost none of it gets communicated. Customers don't know what changed. Stakeholders can't see the progress. The PO spends time writing changelogs instead of talking to customers.

**ShipSignal closes that gap.** It automates the translation from technical work to customer value — so the communication layer moves at the speed of code.

---

## What ShipSignal Does

On every merge or push, ShipSignal:

1. Reads the git diff, commit messages, and PR description
2. Pulls linked Jira ticket context via the Jira API
3. Uses AI to extract the value signal — metrics, improvements, fixes, new capabilities
4. Generates release notes tailored to each configured audience (persona)
5. Commits the notes back to your repo as markdown files

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

**Two configuration surfaces — that's it:**

- **`config/voice.md`** — your brand voice, writing rules, banned phrases. Owned by product.
- **`personas/*.md`** — one file per audience. Add, edit, or remove. No code changes needed.

Everything else is automatic.

---

## Quick Start

**Requirements:** Node.js 20+, a GitHub repo, an AI provider key or GitHub Copilot Enterprise access.

```bash
# 1. Fork this repo on GitHub

# 2. Copy and configure the sample config
cp examples/sample-team-config.yml config/team-config.yml

# 3. Set your team name, Jira project key, AI provider, and deploy points

# 4. Add secrets to GitHub Actions (AI_API_KEY, JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN)

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

| Secret | Description |
|---|---|
| `AI_API_KEY` | Your AI provider API key (not needed for GitHub Copilot Enterprise) |
| `JIRA_BASE_URL` | Your Jira instance URL, e.g. `https://yourorg.atlassian.net` |
| `JIRA_USER_EMAIL` | Email address associated with your Jira account |
| `JIRA_API_TOKEN` | Jira API token — generate at [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens) |

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

ShipSignal ships with 5 ready-to-use personas in the `personas/` directory. Each one is a
character-driven profile — not a demographic, but a specific person in a specific moment,
with a clear job to do when they open the release note.

**`vp.md` — The VP**
C-suite or VP-level exec who owns the board and customer narrative. They've been
blindsided by engineering surprises before. They read the first bullet — if it doesn't
connect to a business outcome, they close the email. 3-4 bullets max. Every point
must tie to revenue, risk, retention, or customer impact. No technical terms.

**`customer.md` — The Customer**
A power user who lives in the product every day. Non-technical, but knows the product
deeply. Their first question when an update lands: *did this break what I depend on?*
Write to the felt experience — "loads faster" not "latency reduced." Use "you." Say
when nothing needs to change.

**`technical-user.md` — The Technical User**
A senior engineer or admin responsible for keeping their team's systems working with
this product. They scan for "Breaking:" first, then endpoint names, then metrics.
Vague language signals an untrustworthy note. Specific numbers and exact API references
signal one they can act on and share with their team.

**`partner.md` — The Partner**
A senior engineer at a company that has built an integration on top of this platform.
When the platform ships a breaking change they don't catch, their customers file tickets
against *their* product. They need explicit backward-compat declarations, exact API
surfaces, and hard deprecation timelines — not vague notices.

**`internal.md` — The Internal User**
A QA lead or product manager running the staging sign-off. They're reading this note
to build their test plan for the day. Every change is a test scenario. Every high-risk
flag is somewhere to spend more time. Frame changes as what to validate, not what was
delivered. Include Jira ticket IDs. List setup dependencies before anything else.

---

Each persona file includes writing instructions, an exact output template, and a
good/bad example so anyone on the team can generate or review notes for that audience.
Use `personas/TEMPLATE.md` as a starting point to build your own.

See `examples/sample-output-end-user.md` for a sample of generated output.

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

## Voice Library

ShipSignal ships with 6 sample voices in the `voices/` directory — communication
archetypes built from some of the most distinctive communication styles in business.
Each one is a complete drop-in for `config/voice.md`, or a source of individual
principles you can blend into your own.

**`the-operator.md` — The Operator**
Direct, accountable, metrics-first. This voice leads with numbers, names problems
without softening them, and closes with what was done. No throat-clearing. No vague
enthusiasm. Built for ops-heavy products, reliability platforms, and teams that have
built trust through consistency and accountability.
> *"Checkout errors: was 3.2%. Now 0.1%. Here's what we fixed."*

**`the-visionary.md` — The Visionary**
Minimalist, poetic, human-centered. This voice strips language to its essentials and
frames every change as a step toward something larger. Short sentences. Big ideas.
Built for consumer products, design-forward platforms, and teams with a strong point
of view about what they're building and why.
> *"The wait is gone. Search is instant now."*

**`the-storyteller.md` — The Storyteller**
Warm, authentic, failure-honest. This voice doesn't hide the hard parts. It names
what went wrong, what was learned, and what's different now. Built for B2C products,
lifestyle brands, and community-driven teams where authenticity and earned trust
are part of the product value.
> *"We broke this last month. Here's what we learned and what we shipped to fix it."*

**`the-customer-champion.md` — The Customer Champion**
Principled, clear, customer-obsessed. This voice connects every change back to a
specific customer problem. No update is announced without a reason. Built for
enterprise B2B products and long-term customer relationships where trust is built
over years, not campaigns.
> *"Three enterprise teams flagged this in QBRs. It's resolved."*

**`the-straight-shooter.md` — The Straight Shooter**
Raw, fast, zero corporate. This voice treats customers like adults and gets to the
point in the first sentence. No hedging, no softening, no filler. Built for developer
tools, startup products, and audiences that have zero tolerance for PR language.
> *"Search was broken for queries over 50 characters. Fixed. Go try it."*

**`the-connector.md` — The Connector**
Empathetic, research-grounded, warm. This voice names the experience customers were
having before the fix — not just the fix itself. It validates the struggle before
announcing the solution. Built for healthcare, education, HR, and community products
where the customer's emotional experience is central to the value being delivered.
> *"A lot of you have been working around this for months. We heard it. Here's what changed."*

---

To use a voice:
```bash
cp voices/the-operator.md config/voice.md
```

Or blend elements from multiple voices into a single `config/voice.md`. See `voices/README.md` for guidance.

---

## Brand Voice

`config/voice.md` is the universal style guide applied to every persona on every run. Think of it as the floor — personas build on top of it.

It defines:

- **Core principles** — how to frame value, language level, specificity requirements
- **Banned phrases** — words and constructions that should never appear in output
- **Formatting rules** — headers, bullets, metric formatting, date formatting
- **Metric translation guide** — how to convert technical numbers into customer language
- **Sensitive information rules** — what to never expose (infra topology, vulnerability details, internal ticket IDs)

Update `config/voice.md` whenever your brand voice evolves, a new communications standard is adopted, or you find patterns in output that need correcting across all personas at once.

---

## Output

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

---

## Manual Runs

Trigger ShipSignal manually from the GitHub Actions UI under **Actions > Generate Release Notes > Run workflow**.

Optional inputs:

| Input | Description | Example |
|---|---|---|
| `environment` | Override the detected environment | `production` |
| `personas` | Comma-separated persona override | `vp,customer` |

Useful for re-generating notes after updating a persona file, or for previewing a new persona against a recent commit before wiring it into the pipeline.

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

---

## License

MIT
