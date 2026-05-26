# AGENTS.md

Agent contract for `Legibly`. Follows the agentskills.io standard.

## What this repo is

Public Node.js CLI + GitHub-Action that reads merges and generates audience-specific plain-language release notes, committed back to the consumer's repo. MIT-licensed.

## Tasks welcomed

- Bug fixes with test coverage
- New audience templates (with Brad's approval on the taxonomy)
- New CI-system integrations (GitLab CI, Bitbucket Pipelines patterns are precedent)
- Documentation in `docs/`
- Test additions

## Tasks refused (hard constraints)

- **Never commit secrets** (`.env*`, `*.key`, `*.pem`, GitHub tokens — block).
- **Never modify the commit-back contract** (Legibly writes release notes back to the consumer's repo) without a deprecation path and explicit Brad approval.
- **Never push to `main` directly** — PR-only.
- **Never force-push.**
- **Never add audiences that drift from the editorial discipline** (engineer / PM / customer / executive). Bespoke audiences require a separate discussion.
- **Never bundle features that belong to the consumer's CI runner.** Legibly is intentionally narrow.
- **Stop on uncertainty.**

## Test command

```bash
npm test
```

## Lint / format command

```bash
npm run lint
```

(If the script doesn't exist, defer to whatever CI uses.)

## How to ship a change

1. Branch from `main` as `<your-id>/<short-feature>`
2. TDD-style; CI exists and gates merge
3. PR to `main`
4. Wait for human approval
5. Squash-merge

## Pre-commit hooks (run automatically)

- detect-secrets
- check-added-large-files
- check-yaml, check-json
- end-of-file-fixer, trailing-whitespace
- detect-private-key
- check-merge-conflict
