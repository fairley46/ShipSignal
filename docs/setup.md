# Setup Guide

## Step 1: Configure your team

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

Configure your deploy points: which branches map to which environments, and which personas fire for each:

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

## Step 2: Choose your AI provider

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

## Step 3: Add secrets

Add the following secrets to your CI system:

| Secret | Required | Description |
|---|---|---|
| `AI_API_KEY` | Yes (unless using GitHub Copilot) | Your AI provider API key |
| `JIRA_BASE_URL` | Optional | Your Jira instance URL, e.g. `https://yourorg.atlassian.net` |
| `JIRA_USER_EMAIL` | Optional | Email address associated with your Jira account |
| `JIRA_API_TOKEN` | Optional | Jira API token, generate one at [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens) |

Legibly works without Jira. If the secrets aren't set, it skips ticket enrichment and generates notes from the git diff and commit messages alone.

**Where to add secrets by platform:**

- **GitHub Actions**: Settings > Secrets and variables > Actions. Can be set at repo or org level.
- **GitLab CI**: Settings > CI/CD > Variables. See [docs/gitlab-setup.md](gitlab-setup.md).
- **Bitbucket Pipelines**: Repository settings > Repository variables. See [docs/bitbucket-setup.md](bitbucket-setup.md).
- **Other CI**: Set as environment variables in your pipeline config. See [docs/other-ci-setup.md](other-ci-setup.md).

**Committing generated notes back to the repo** requires your CI bot to have write access to the branch. On GitHub Actions this means `contents: write` permission (already set in the workflow file). On GitLab and Bitbucket, the access token you provide needs repository write scope — see the platform-specific setup guides for details.

---

## Step 4: Customize your voice

Open `config/voice.md` and update it to match your brand. This file defines:

- Core writing principles (lead with value, active voice, specificity)
- Banned phrases (no "leverages", no "seamless", no "game-changing")
- Formatting rules
- How to handle metrics, security fixes, and sensitive information

This file is owned by the product team. No engineering changes needed to update it.

---

## You're set

Push to a configured branch. Legibly will generate a release note for each persona in that deploy point and commit the files to `release-notes/{environment}/` automatically. No further action required.

Before your first merge, read [Engineering Process](#engineering-process). The quality of generated notes depends entirely on what your team puts into PR descriptions and commit messages. Two minutes there will pay off on every deploy.

To optionally send those notes to Slack, Teams, Confluence, or a webhook, see [docs/notifications.md](notifications.md).

---

## Engineering Process

Legibly's output quality is entirely dependent on what goes into PRs and commits. The AI translates your inputs. It cannot invent specifics that aren't there.

### PR descriptions are the main input

Legibly reads the PR description first. If the description is vague, the notes will be vague.

| PR description | What Legibly generates |
|---|---|
| `fixes stuff` | Vague, unusable notes |
| `Resolved a session timeout bug causing users to be logged out after 30 min of inactivity` | Sharp, specific notes for every persona |

Signal doesn't need to be polished. It needs to be specific.

### Commit messages fill the gaps

Legibly reads the last 20 commit messages. They supplement the PR description, especially when a PR contains multiple distinct changes.

| Commit message | Value to Legibly |
|---|---|
| `fix auth bug` | Nothing useful |
| `fix JWT expiry not refreshing on mobile after background resume` | Translatable. Audience, symptom, and trigger all present. |

### Writing PRs with an AI coding agent

If you're using an AI coding tool (Claude, Copilot, Cursor, or similar) to write code, you have an advantage most teams miss: the agent that wrote the code already knows exactly what it changed and why. Use that context.

Before closing the session, ask your agent to write the PR description. It has the full picture — the reasoning, the tradeoffs, the specific metrics, the files touched. A one-line prompt like *"write a detailed PR description covering what changed, why, and what the user-visible impact is"* will produce input that Legibly can translate into sharp, specific release notes.

The alternative is writing the description yourself after the fact, from memory, which is where vague language creeps in.

**The full loop when coding agentically:**

```
Agent writes code
        ↓
Agent writes PR description (from session context)
        ↓
Legibly generates release notes (from PR description + diff)
        ↓
Committed to repo automatically — zero communication overhead
```

This is the highest-leverage path. The description quality is what determines the output quality at every stage downstream.

---

### Code review is intentionally out of scope

Legibly does not review code, validate accuracy, or verify that what was described actually shipped. This is a deliberate design decision, not a gap.

The engineer is the accuracy gate. Legibly's job is translation, not auditing. It takes what you put into the PR description and commit messages at face value and renders it for each audience. That separation keeps Legibly fast, predictable, and easy to trust — you control the inputs, it controls the presentation.

Wrong or vague inputs produce wrong or vague notes, just in cleaner language. The checklist below is the mechanism for keeping inputs honest.

### Short checklist

Before merging:

- [ ] PR title names the user-facing change, not the implementation (`Fix session timeout on mobile` not `Update JWT refresh handler`)
- [ ] PR description has 2–3 sentences: what changed, why it matters, who it affects
- [ ] Commit messages reference what broke or improved, not just what file was touched

Teams that follow this consistently get release notes that could be sent directly to customers. Teams that don't get notes that need editing.

---

## Local Development

Test your configuration and personas locally before pushing to CI.

**Setup:**

```bash
cp .env.local.example .env.local
# Fill in your values. At minimum set AI_API_KEY and DEPLOY_ENVIRONMENT.
```

**Run:**

```bash
cd action
npm install
npm run dev
```

`DRY_RUN=true` is set in `.env.local.example` by default. Legibly will generate notes and print them to your terminal without writing any files or committing anything.

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

## MCP Skill

The same translation pipeline is available on demand inside any MCP-compatible client (Claude Desktop, opencode, Cursor, Zed, etc.). Useful for translating PRs before a merge, mid-review, or during standup prep, without waiting for CI.

**Quick setup:**

```bash
cd action
npm install
npm run build   # produces dist/mcp.js
```

Then add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "legibly": {
      "command": "node",
      "args": ["/absolute/path/to/repo/action/dist/mcp.js"],
      "env": {
        "LEGIBLY_REPO_ROOT": "/absolute/path/to/repo",
        "AI_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

Restart your client. Ask: **"What personas does Legibly know about?"** to verify.

→ [Full MCP guide](mcp.md)
