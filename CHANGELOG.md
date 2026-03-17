# Changelog

All notable changes to ShipSignal will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
