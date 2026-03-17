# MCP Skill

The MCP skill exposes Legibly's translation pipeline conversationally, inside any MCP-compatible client. Same prompt assembly, same AI providers, same personas and voice as the GitHub Action, but on demand: before a merge, mid-review, or during standup prep.

**Two delivery modes, one translation brain.**

| | GitHub Action | MCP Skill |
|---|---|---|
| When it runs | Automatically on every merge | On demand, whenever you ask |
| Input | Live git diff + CI env vars | PR URL, pasted description, optional diff |
| Output | Markdown files committed to repo | Text returned in the conversation |
| Writes files | Yes | Never |

---

## Three things you control per translation

Every `translate` call has three axes. Mix and match freely.

### 1. Audience: `persona`

Who are you writing for? Use `list-personas` to see what's configured.

```
customer       non-technical users; felt experience, not implementation
vp             executives; business outcomes and risk only
technical-user engineers and admins; metrics, endpoints, breaking changes
partner        integration partners; API surfaces and deprecation timelines
internal       QA and PMs; test scenarios, Jira IDs, edge cases
```

### 2. Tone: `voice`

How should it sound? Use `list-voices` to see the six pre-built options. Omit to use your configured default (`config/voice.md`).

```
the-operator           direct, metrics-first, accountability-driven
the-visionary          minimalist, human-centered, poetic
the-storyteller        warm, authentic, failure-honest
the-customer-champion  principled, clarity-obsessed, customer-first
the-straight-shooter   raw, fast, zero corporate
the-connector          empathetic, research-grounded, community-oriented
```

### 3. Framing: `environment`

How should the changes be positioned? Defaults to `production`.

```
production  delivered value, present tense, customers can use it today
staging     what's being validated before production; Jira IDs appropriate
hotfix      lead with what broke and what's now resolved; direct about severity
canary      gradual rollout; changes not yet universally available
```

---

## Requirements

- Node.js 20+
- Any MCP-compatible client (Claude Desktop, opencode, Cursor, Zed, Windsurf, etc.)
- Legibly repo cloned locally and configured (`config/team-config.yml` set up)
- An AI provider key (`AI_API_KEY`), the same one your GitHub Action uses

---

## Setup

### 1. Build

```bash
cd action
npm install
npm run build
```

Confirm `dist/mcp.js` exists:

```bash
ls action/dist/mcp.js
```

### 2. Register as an MCP server

The server command is always the same regardless of client:

```
node /absolute/path/to/repo/action/dist/mcp.js
```

**Required env vars:**

| Variable | Notes |
|---|---|
| `LEGIBLY_REPO_ROOT` | Absolute path to the repo root. Missing = startup crash. |
| `AI_API_KEY` | Your AI provider key (Anthropic, OpenAI, Azure). Not needed for GitHub Copilot provider. |

**Optional env vars:**

| Variable | Notes |
|---|---|
| `GITHUB_TOKEN` | Needed for `pr_url` input (fetches PR body from GitHub API). |
| `JIRA_BASE_URL` / `JIRA_USER_EMAIL` / `JIRA_API_TOKEN` | Same as the Action. No-ops gracefully if absent. |

---

### Client config examples

#### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "legibly": {
      "command": "node",
      "args": ["/absolute/path/to/repo/action/dist/mcp.js"],
      "env": {
        "LEGIBLY_REPO_ROOT": "/absolute/path/to/repo",
        "AI_API_KEY": "sk-ant-...",
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

Restart Claude Desktop after editing.

#### opencode

```toml
[mcp.legibly]
command = "node"
args = ["/absolute/path/to/repo/action/dist/mcp.js"]

[mcp.legibly.env]
LEGIBLY_REPO_ROOT = "/absolute/path/to/repo"
AI_API_KEY = "sk-ant-..."
GITHUB_TOKEN = "ghp_..."
```

#### Cursor

In Cursor settings, under **MCP Servers**:

```json
{
  "legibly": {
    "command": "node",
    "args": ["/absolute/path/to/repo/action/dist/mcp.js"],
    "env": {
      "LEGIBLY_REPO_ROOT": "/absolute/path/to/repo",
      "AI_API_KEY": "sk-ant-..."
    }
  }
}
```

#### Any other client

Same pattern: command `node`, args pointing to `dist/mcp.js`, env with `LEGIBLY_REPO_ROOT` and `AI_API_KEY`. Check your client's docs for where to put it.

### 3. Verify

Ask your client: **"What personas does Legibly know about?"**

You should get a list of all personas from your `config/team-config.yml`.

---

## Available Tools

### `list-personas`

Lists every persona configured in `team-config.yml`, the environments each appears in, and a one-line description from the persona file.

### `list-voices`

Lists all pre-built voices in the `voices/` directory with a one-line description of each. Pass a voice name to `translate` via the `voice` parameter to override your default `config/voice.md` for a single translation.

### `translate`

Translates a PR into release notes. Combines your chosen persona, voice, and environment to produce a single tailored note.

| Field | Required | Notes |
|---|---|---|
| `persona` | Yes | Who to write for. Use `list-personas`. |
| `pr_url` | One of these | GitHub PR URL. Needs `GITHUB_TOKEN`. |
| `pr_description` | One of these | Paste the PR body directly. |
| `voice` | No | Override the default voice for this translation. Use `list-voices`. |
| `environment` | No (default: `production`) | `production`, `staging`, `hotfix`, `canary` |
| `diff` | No | `git diff HEAD~1 HEAD --stat --unified=0` |
| `commit_messages` | No | `git log --oneline -20` |
| `sha` / `branch` | No | Metadata for generated frontmatter |

---

## Usage Patterns

### Quickest path: paste and pick

> Translate this for the customer persona:
>
> [paste PR description]

### Full three-axis control

> Translate this for the vp persona, using the-straight-shooter voice, with hotfix framing.
>
> [paste PR description]

### With a PR URL

> Translate https://github.com/your-org/your-repo/pull/456 for the technical-user persona.

### With extra context for richer output

```bash
git diff HEAD~1 HEAD --stat --unified=0
git log --oneline -20
```

> Translate this PR for the partner persona. Here's the diff and commits:
>
> [paste both]

### Compare personas

> Translate this for the vp persona and then for the customer persona.
>
> [PR description]

Two `translate` calls, both results returned.

### Try a different voice

> Translate this for the customer persona using the-storyteller voice.
>
> [PR description]

---

## Troubleshooting

**"Legibly MCP: failed to load config"**: `LEGIBLY_REPO_ROOT` is missing or doesn't point to a directory with `config/team-config.yml`.

**"Error: persona 'X' not found"**: Use `list-personas` to see valid names.

**"Error: voice 'X' not found"**: Use `list-voices` to see valid names. Omit `voice` to use your default.

**"Error generating release notes: 401"**: `AI_API_KEY` is missing or invalid.

**PR URL fetch returns "Pull request description unavailable"**: `GITHUB_TOKEN` is not set or lacks `repo` read access. Paste the description directly instead.

**Tools don't appear in your client**: Verify the path is absolute, `dist/mcp.js` exists, and you've restarted the client after config changes.

**Output looks vague**: Same cause as the Action. Vague PR descriptions produce vague notes. See [Engineering Process](setup.md#engineering-process).

---

## Rebuilding After Changes

Personas, voices, config: no rebuild needed. Those files are read at call time.

Action source code (`.ts` files): rebuild and restart your client:

```bash
cd action && npm run build
```
