# Contributing to ShipSignal

Thanks for your interest in improving ShipSignal. There are three ways to contribute —
and two of them require no code at all.

---

## Adding a Persona

Personas define who receives release notes and what they care about. Anyone can add one.

1. Copy `personas/TEMPLATE.md` to `personas/your-persona-name.md`
2. Fill in the sections: role description, what they care about, what to omit, example tone
3. Open a pull request — no code changes required

Good candidates: security team, board, press/PR, sales, internal engineering.

---

## Adding or Editing a Voice

Voices define your brand's writing style. They live in `voices/`.

1. Copy an existing voice file (e.g., `voices/the-operator.md`) to a new file
2. Update the name, description, rules, and banned phrases
3. Open a pull request

Tip: keep voices opinionated. Vague style guides produce vague output.

---

## Code Contributions

For bug fixes, new features, or changes to the action:

1. Fork the repo
2. `cd action && npm install`
3. Make your changes in `action/src/`
4. Run `npm run typecheck` — must pass
5. Run `npm run lint` — must pass
6. Open a pull request with a clear description of what changed and why

### What we're looking for

- Bug fixes with a clear reproduction case
- Support for additional AI providers
- Improvements to the prompt pipeline
- New config options with clear use cases

### What to avoid

- Large refactors without prior discussion — open an issue first
- Changes to existing personas or voices without a strong reason — these are opinionated by design

---

## Questions?

Open an issue. We'd rather answer a question than have a confused contributor.
