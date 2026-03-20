# Output, Manual Runs, and Notifications

## Output

**By default, Legibly does one thing: it commits markdown files to your repo.**

On every merge or push to a configured branch, the `release-notes.yml` workflow runs automatically, generates notes for each persona, and commits them back to the repo as a `Legibly[bot]` commit. No manual step required. The committed markdown is the primary output. Everything else (notifications, downstream tooling) is optional and built on top of it.

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
generated_by: Legibly
---
```

If a push contains no user-visible changes (pure internal refactor, dependency bumps with no impact), Legibly skips file generation for that run.

**File retention**

By default Legibly keeps the 50 most recent files per persona per environment folder. After each write it scans the folder, sorts files oldest-first (the `YYYY-MM-DD` prefix makes this free), and deletes anything beyond the limit. Git history preserves deleted files.

Configure this with `max_files_per_persona` in the `output` block:

```yaml
output:
  max_files_per_persona: 50   # default; keep the last 50 deploys per audience
  # max_files_per_persona: 0  # set to 0 to keep everything (no pruning)
```

For 3 personas × 3 environments the default cap is 450 files total.

To send these notes to Slack, Teams, Confluence, or a custom endpoint, see [Notifications](#notifications). That step is always manual: you read the committed files first, then decide to send.

---

## Manual Runs

Trigger note generation manually from your CI platform:

- **GitHub Actions**: Actions > Generate Release Notes > Run workflow
- **GitLab CI**: Pipelines > Run pipeline, set `DEPLOY_ENVIRONMENT` and optionally `PERSONA_OVERRIDE` as variables
- **Bitbucket Pipelines**: Pipelines > Run pipeline on the target branch
- **Other CI**: Run `node action/dist/index.js` directly with `DEPLOY_ENVIRONMENT` set

Optional environment variables:

| Variable | Description | Example |
|---|---|---|
| `DEPLOY_ENVIRONMENT` | Override the detected environment | `production` |
| `PERSONA_OVERRIDE` | Comma-separated persona override | `vp,customer` |

Useful for re-generating notes after updating a persona file, or for previewing a new persona against a recent commit before wiring it into the pipeline.

This triggers **note generation only**. It writes and commits markdown files. To send notifications, see [Notifications](#notifications).

---

## Notifications

Notifications are optional additions on top of the primary output: markdown files committed to your repo. The committed markdown is always the source of truth. Notifications exist to close the gap between "the note exists in the repo" and "the right people know about it."

Three distinct feedback loops are supported: instant communication (Slack, Teams), documentation systems (Confluence), and custom webhooks (email relays, Zapier, Make, or your own serverless function). Each hook is opt-in, per-persona, and gated behind an explicit manual step.

**Critical constraint: review before sending.** The `notify.yml` workflow is manually triggered. The engineer merges, reads the committed markdown, and only then goes to Actions → "Send Notifications" → Run workflow. The manual trigger is the review step. AI-generated content is never sent automatically.

---

### Configuration

Add a `notify` block to any `deploy_points` entry in `team-config.yml`. Keys are persona names or `"*"` (wildcard for all personas in that deploy point). Values are arrays, so a single persona can fan out to multiple channels.

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

Values prefixed with `$` (e.g., `$SLACK_CUSTOMER_WEBHOOK`) are resolved from environment variables at runtime. Secrets never live in the config file. For `confluence`, `username_secret` and `token_secret` are the **names** of the environment variables, not the values.

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

Both use Incoming Webhooks, no OAuth app setup required.

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

Appends the release note to an existing Confluence page, prepended at the top (newest-first). The page must already exist. Legibly updates it, it does not create it.

**Setup:**

1. Find the page ID in the URL: `...atlassian.net/wiki/spaces/SPACE/pages/98765432/Page+Title`
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

A generic HTTP POST that covers email relays, Zapier, Make, and any custom endpoint. Legibly sends a standard JSON payload:

```json
{
  "persona": "customer",
  "environment": "production",
  "release_date": "2026-03-17",
  "commit": "a3f7b2c1",
  "branch": "main",
  "content": "## What's new...",
  "generated_by": "Legibly"
}
```

Use cases:
- **Email**: point at a SendGrid, Resend, or Postmark relay endpoint
- **Zapier / Make**: use a webhook trigger, then route to any downstream service
- **Custom**: your own serverless function, internal API, or notification service

```yaml
notify:
  vp:
    - type: webhook
      url: $EMAIL_RELAY_WEBHOOK
      headers:
        Authorization: Bearer $EMAIL_RELAY_TOKEN
        X-Source: Legibly
```

All header values are also resolved from environment variables when prefixed with `$`.
