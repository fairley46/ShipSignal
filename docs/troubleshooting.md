# Troubleshooting

**`Persona file not found: personas/X.md`**
A persona listed in `team-config.yml` doesn't have a corresponding file in `personas/`. Either create the file or remove the persona name from the `deploy_points[].personas` list.

**Workflow triggered but no notes generated (no error)**
Your branch pattern in `deploy_points[].branch_pattern` likely doesn't match the branch you pushed to. Check that `main` is listed for pushes to main, `release/*` for release branches, etc. Use a `workflow_dispatch` run with an explicit environment override to test.

**`No deploy point configured for environment: X`**
The detected environment doesn't match any `deploy_points[].environment` in your config. Check your branch pattern matches the branch you pushed to, or use a `workflow_dispatch` run with an explicit environment override.

**`Unknown ai_provider.type`**
The `ai_provider.type` in `team-config.yml` isn't one of the supported values. Supported: `anthropic`, `github-copilot`, `openai`, `azure-openai`.

**AI call fails with 401 / authentication error**
Your `AI_API_KEY` secret is missing, expired, or set incorrectly. For GitHub Copilot Enterprise, confirm your `GITHUB_TOKEN` has Copilot API access enabled at the org level.

**Jira tickets not appearing in generated notes**
Check that `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, and `JIRA_API_TOKEN` are all set. Verify commit messages reference ticket IDs matching the pattern `PROJ-123` where `PROJ` matches your `jira_project_key`. Jira errors are non-fatal. The run continues without ticket context rather than failing.

**Bot commit fails with `refusing to allow... without workflow scope`**
The `GITHUB_TOKEN` in your Actions environment doesn't have permission to push to a protected branch. Either loosen branch protection rules to allow the Legibly bot, or set the workflow to write to a separate branch.

**Output is vague or missing metrics**
The quality of generated notes depends on the quality of inputs. Legibly translates what it's given. It cannot invent specifics that aren't in the PR description or commit messages. See [Engineering Process](setup.md#engineering-process) for a checklist and before/after examples of what makes a difference.

**Notification workflow runs but nothing is sent**
Either there's no `notify` block in `team-config.yml` for that environment, or the persona name in the workflow input doesn't match any note file in `release-notes/{environment}/`. Check that the file exists and that the persona name matches exactly.

**Slack or Teams message not arriving**
Confirm the webhook URL secret is set in your repo and uncommented in the `env:` block of `notify.yml`. Test the webhook URL directly with a `curl -X POST` to confirm it's still active. Slack and Teams webhook URLs can expire or be revoked.

**Confluence update failing with 403**
The API token doesn't have permission to edit the target page. Confirm the token belongs to a user with edit access to that specific page. Confluence space permissions and page-level restrictions are evaluated separately.

**Confluence update failing with 409**
A version conflict. The page was updated between Legibly's GET and PUT. Re-run the notification workflow; it will fetch the current version and retry cleanly.
