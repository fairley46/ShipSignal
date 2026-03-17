# MCP Skill — Legibly in Claude Desktop

The MCP skill exposes Legibly's translation pipeline conversationally, inside Claude Desktop or any MCP-compatible client. Same prompt assembly, same AI providers, same personas and voice as the GitHub Action — but on demand, before a merge, mid-review, or during standup prep.

**Two delivery modes, one translation brain.**

| | GitHub Action | MCP Skill |
|---|---|---|
| When it runs | Automatically on every merge | On demand, whenever you ask |
| Input | Live git diff + CI env vars | PR URL, pasted description, optional diff |
| Output | Markdown files committed to repo | Text returned in the conversation |
| Writes files | Yes | Never |

---

## Requirements

- Node.js 20+
- Claude Desktop (or any MCP-compatible host)
- Legibly repo cloned locally and configured (`config/team-config.yml` set up)
- An AI provider key (`AI_API_KEY`) — same key your GitHub Action uses

---

## Setup

### 1. Build the action package

```bash
cd action
npm install
npm run build
```

Confirm `dist/mcp.js` exists:

```bash
ls action/dist/mcp.js
```

### 2. Configure Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add the `legibly` server. Create the file if it doesn't exist.

```json
{
  "mcpServers": {
    "legibly": {
      "command": "node",
      "args": ["/absolute/path/to/your/repo/action/dist/mcp.js"],
      "env": {
        "LEGIBLY_REPO_ROOT": "/absolute/path/to/your/repo",
        "AI_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

Replace `/absolute/path/to/your/repo` with the actual path where you cloned Legibly. Do not use `~` or relative paths — Claude Desktop requires absolute paths.

**Optional env vars:**

```json
{
  "mcpServers": {
    "legibly": {
      "command": "node",
      "args": ["/absolute/path/to/your/repo/action/dist/mcp.js"],
      "env": {
        "LEGIBLY_REPO_ROOT": "/absolute/path/to/your/repo",
        "AI_API_KEY": "sk-ant-...",
        "GITHUB_TOKEN": "ghp_...",
        "JIRA_BASE_URL": "https://yourorg.atlassian.net",
        "JIRA_USER_EMAIL": "you@yourcompany.com",
        "JIRA_API_TOKEN": "your-jira-token"
      }
    }
  }
}
```

`GITHUB_TOKEN` is needed for the `pr_url` input (fetches the PR body from GitHub). `JIRA_*` is optional — the skill works without it.

### 3. Restart Claude Desktop

Quit and reopen Claude Desktop. The Legibly skill will appear as an available tool.

### 4. Verify

Ask Claude: **"What personas does Legibly know about?"**

You should get a list of all personas from your `config/team-config.yml`.

---

## Available Tools

### `list-personas`

Lists every persona configured in `team-config.yml`, the environments each appears in, and a one-line description from the persona file.

**When to use:** before translating, to check what persona names are available.

**Example prompt:**
> What personas does Legibly know about?

**Example output:**
```
**Legibly Personas**

**vp**
  Environments: production, hotfix
  C-suite and VP-level stakeholders. Business outcomes, risk, and customer impact only.

**customer**
  Environments: production, hotfix
  Day-to-day users of the product. Non-technical. They care about whether things work.

**partner**
  Environments: production
  Integration partners and API consumers who have built on top of this platform.
```

---

### `translate`

Translates a PR into release notes for a specific persona. Uses your configured AI provider, voice, and prompt — the same pipeline the GitHub Action uses.

**Inputs:**

| Field | Required | Notes |
|---|---|---|
| `persona` | Yes | Name from `list-personas` |
| `pr_url` | One of these | GitHub PR URL — fetches the body via API. Needs `GITHUB_TOKEN`. |
| `pr_description` | One of these | Paste the PR body directly. No token needed. |
| `environment` | No (default: `production`) | `production`, `staging`, `hotfix`, `canary` |
| `diff` | No | Output of `git diff HEAD~1 HEAD --stat --unified=0` |
| `commit_messages` | No | Output of `git log --oneline -20` |
| `sha` | No | Commit SHA for frontmatter metadata |
| `branch` | No | Branch name for frontmatter metadata |

At least one of `pr_url` or `pr_description` is required.

---

## Usage Patterns

### Quickest path — paste a PR description

Open a PR on GitHub, copy the description, then ask:

> Translate this for the customer persona:
>
> [paste PR description]

Claude will call `translate` with your pasted text and the customer persona.

### With a PR URL

If `GITHUB_TOKEN` is set in your Claude Desktop config:

> Translate https://github.com/your-org/your-repo/pull/456 for the vp persona.

Legibly fetches the PR body automatically.

### With extra context (richer output)

More context → sharper notes. Run these in your terminal before asking Claude:

```bash
git diff HEAD~1 HEAD --stat --unified=0
git log --oneline -20
```

Then paste the output alongside your request:

> Translate this PR for the technical-user persona.
>
> **PR description:**
> Refactored the search indexer to use incremental builds. Cold start time drops from
> 45s to 4s. Memory usage reduced by 60% at peak. No API changes.
>
> **Diff:**
> [paste diff output]
>
> **Commits:**
> [paste git log output]

### Staging or hotfix framing

> Translate this for the internal persona using staging environment framing.
>
> [PR description]

The `environment` field changes how the AI frames the changes — staging emphasizes what to validate, hotfix leads with what was broken and what's now resolved.

### Compare personas side by side

> Translate this PR for the vp persona and then for the customer persona.
>
> [PR description]

Claude will make two separate `translate` calls and return both.

---

## Troubleshooting

**"Legibly MCP: failed to load config"**

`LEGIBLY_REPO_ROOT` is either missing or points to a directory that doesn't have `config/team-config.yml`. Verify the path is absolute and correct.

**"Error: persona 'X' not found"**

The persona name doesn't match any file in `personas/`. The error message lists available options. Use `list-personas` first to check names.

**"Error generating release notes: 401"**

`AI_API_KEY` is missing or invalid. Set it in your Claude Desktop `env` config.

**PR URL fetch returns "Pull request description unavailable"**

`GITHUB_TOKEN` is not set or doesn't have `repo` read access. Either add the token to your Claude Desktop config or paste the PR description directly.

**The server doesn't appear in Claude Desktop**

Verify the path in `args` is absolute and that `dist/mcp.js` exists. Quit and fully reopen Claude Desktop after any config change.

**Output looks vague**

Same root cause as the GitHub Action: vague PR descriptions produce vague notes. The MCP skill translates whatever it's given. Give it more specific input and the output sharpens. See [Engineering Process](setup.md#engineering-process).

---

## Rebuilding After Changes

If you update personas, voice, or config — no rebuild needed. Those files are read at call time.

If you update action source code (`.ts` files), rebuild:

```bash
cd action && npm run build
```

Then restart Claude Desktop to pick up the new `dist/mcp.js`.
