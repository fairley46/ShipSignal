# ShipSignal

Automated release notes that express engineering value in a product owner voice.

On every merge or push, ShipSignal reads your git diff, PR description, and Jira tickets — then uses AI to generate persona-tailored release notes committed back to your repo as markdown.

**The problem it solves:** Engineering teams ship value constantly and almost never articulate it in a way customers understand. With agentic development, teams ship even faster — but the communication layer hasn't kept up. ShipSignal automates that translation so product owners can focus on customer conversations, not changelog writing.

---

## How it works

1. Push or merge to a configured branch
2. The GitHub Action reads the diff, PR description, and linked Jira tickets
3. AI generates release notes tailored to each configured persona
4. Notes are committed back to `release-notes/` as markdown files

---

## Setup

### 1. Copy the sample config

```bash
cp examples/sample-team-config.yml config/team-config.yml
```

Edit `config/team-config.yml` to configure your:
- Team name and Jira project key
- Deploy points (which branches map to which environments)
- Personas (which audiences get notes for each environment)
- AI provider

### 2. Configure your AI provider

Set your provider in `config/team-config.yml` under `ai_provider.type`:

| Provider | Type | Secret needed |
|---|---|---|
| Anthropic | `anthropic` | `AI_API_KEY` |
| GitHub Copilot Enterprise | `github-copilot` | `GITHUB_TOKEN` (with Copilot API access) |
| OpenAI | `openai` | `AI_API_KEY` |
| Azure OpenAI | `azure-openai` | `AI_API_KEY` + azure config |

### 3. Add secrets to GitHub

Go to your repo **Settings > Secrets and variables > Actions** and add:

- `AI_API_KEY` — your AI provider key (not needed for GitHub Copilot Enterprise)
- `JIRA_BASE_URL` — e.g. `https://yourorg.atlassian.net`
- `JIRA_USER_EMAIL` — Jira account email
- `JIRA_API_TOKEN` — Jira API token from [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens)

For org-wide rollout, set these as **organization secrets** so all repos inherit them.

### 4. Customize voice and personas

- **`config/voice.md`** — Universal brand voice, banned phrases, tone rules. Owned by the product team.
- **`personas/*.md`** — One file per audience. Add, edit, or remove files freely. No code changes needed.

---

## Personas

| File | Audience | Used for |
|---|---|---|
| `executive.md` | C-suite / VPs | Production releases |
| `end-user.md` | Day-to-day users | Production releases |
| `technical-user.md` | Engineers / admins | Staging + production |
| `partner.md` | Integration partners | Production releases |
| `internal.md` | QA / product team | Staging / UAT |

To add a new persona, create a new `.md` file in `personas/` following the existing format, then add it to the relevant `deploy_points[].personas` list in `team-config.yml`.

---

## Output

Generated files land in `release-notes/{environment}/` with the naming pattern:

```
release-notes/production/2026-03-16-a3f7b2c1-end-user.md
release-notes/staging/2026-03-15-f4a921bc-internal.md
```

Each file includes YAML frontmatter (date, environment, persona, commit, branch) followed by the generated content in the persona's defined structure.

---

## Manual runs

Trigger manually via GitHub Actions UI with optional overrides:

- **environment** — override the detected environment (e.g. `production`)
- **personas** — comma-separated override (e.g. `executive,end-user`)

---

## Forking for your team

1. Fork this repo
2. Set your `ai_provider.type` in `config/team-config.yml`
3. Update `config/voice.md` to match your brand voice
4. Adjust personas in `personas/` for your audience
5. Add your secrets and push

---

## License

MIT
