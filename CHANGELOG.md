# Changelog

All notable changes to Legibly will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-03-20

### Added

- CI-agnostic support — Legibly now runs on GitHub Actions, GitLab CI, Bitbucket Pipelines, and any CI system that can execute Node.js
- `ci-platform.ts` module — central platform detection and env var abstraction; maps GitHub, GitLab, Bitbucket, and generic CI variables to a common shape
- GitLab MR metadata fetch — optional enrichment via `GITLAB_API_TOKEN`
- Bitbucket PR metadata fetch — optional enrichment via `BITBUCKET_ACCESS_TOKEN`
- Drop-in `.gitlab-ci.yml` — test, generate, and notify stages for GitLab CI
- Drop-in `bitbucket-pipelines.yml` — typecheck, generate, and notify steps for Bitbucket Pipelines
- Setup guides: `docs/gitlab-setup.md`, `docs/bitbucket-setup.md`, `docs/other-ci-setup.md`
- Generic CI path — any other CI system (Azure DevOps, CircleCI, Jenkins) works by setting `BRANCH`, `SHA`, and `AI_API_KEY`

### Changed

- `git.ts` now reads branch and SHA from the active CI platform instead of hardcoded GitHub env vars
- `github.ts` API calls are skipped gracefully when not running on GitHub Actions
- `index.ts` routes PR/MR metadata fetch by detected platform
- README updated to reflect CI-agnostic support throughout

---

## [1.0.0] — 2026-03-17

### Added

- GitHub Action that triggers on merge/push to configured branches
- AI-powered release note generation via Anthropic Claude or OpenAI
- Jira integration — pulls linked ticket context to enrich notes
- Per-persona output — generate audience-specific notes from one deployment
- Built-in personas: customer, VP, partner, internal engineering
- Persona template (`personas/TEMPLATE.md`) for adding custom audiences
- Brand voice system (`config/voice.md`) — control tone, rules, banned phrases
- Four built-in voices: The Operator, The Advocate, The Architect, The Scout
- Multi-environment support: production, staging, hotfix
- Configurable deploy points — map branches to environments and persona sets
- Markdown output committed directly to `release-notes/{environment}/`
- Local development mode with `.env.local` support
- Full end-to-end example (`examples/e2e-example.md`)
