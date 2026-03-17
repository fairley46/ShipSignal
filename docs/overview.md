# The Problem Legibly Solves

## Engineering velocity has escaped communication capacity

Software teams are shipping code faster than at any point in history. AI coding tools have fundamentally changed the math on developer output. But the communication layer (explaining what shipped, to whom, in language they understand) is still done largely by hand. The result is a widening gap: enormous engineering output that reaches customers slowly, partially, or not at all.

---

## The data

### Engineering is accelerating

- GitHub Copilot users write code **55% faster** in controlled studies; AI now accounts for **46% of the average developer's code** — [Second Talent](https://www.secondtalent.com/resources/github-copilot-statistics/)
- McKinsey research puts generative AI productivity improvement in software engineering at **20–45%** — [McKinsey](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/unleashing-developer-productivity-with-generative-ai)
- **63% of organizations** report shipping code faster since adopting AI tools — [Harness State of AI in Software Engineering](https://www.harness.io/the-state-of-ai-in-software-engineering)
- Elite DORA performers deploy **multiple times per day** — [DORA 2024 Report](https://dora.dev/guides/dora-metrics-four-keys/)

### Communication hasn't kept up

- Microsoft's Time Warp study (2024) found developers spend roughly **12% of actual work time on communication and meetings** — more than they spend writing code (~11%) — [Microsoft Research](https://www.microsoft.com/en-us/research/wp-content/uploads/2024/11/Time-Warp-Developer-Productivity-Study.pdf)
- Atlassian's Developer Experience Report (2025): **50% of developers lose 10+ hours per week** to non-coding tasks including finding information and context switching — [Atlassian](https://www.atlassian.com/blog/developer/developer-experience-report-2025)
- Sonar research found developers spend only **32% of their time writing new or improved code**; 23% goes to meetings, management, and operational tasks — [Sonar](https://www.sonarsource.com/blog/how-much-time-do-developers-spend-actually-writing-code/)
- Harness describes this as the **AI Velocity Paradox**: AI accelerates code creation, but downstream processes (communication, testing, compliance) haven't matured at the same pace, throttling the realized productivity gains — [Harness](https://www.harness.io/blog/the-ai-velocity-paradox)

### The result: shipped value disappears into the void

- Pendo's 2024 Global Product Benchmarks (across 6,800 customers) found users engage with only **6.4% of product features** — for every 100 features shipped, 93.6 go largely unnoticed — [Pendo / Mind the Product](https://www.mindtheproduct.com/users-engage-with-6-of-product-features-product-benchmark-findings/)
- Multiple industry analyses estimate **80% of software features** are rarely or never used — [reference](https://medium.com/@mohammedalaa/80-of-features-in-products-are-rarely-or-never-used-heres-why-6dcdf0204acf)

A note on these numbers: feature engagement is not the same as feature awareness. Users can't engage with features they don't know exist. These figures are an upper bound on the communication problem, not a precise measurement of it. But they're directionally consistent: a large share of shipped value never reaches customers.

The root cause isn't quality. It's timing and translation. As one analysis puts it: "Requests take months to reach customers while their needs and market conditions have changed" — [Whatfix](https://whatfix.com/blog/feature-discovery/).

### Release communication is broken as a practice

The practice of communicating releases hasn't scaled alongside shipping velocity:

- Release notes are described as "merely an afterthought for many SaaS businesses" — [Amoeboids](https://amoeboids.com/blog/5-best-practices-for-saas-changelogs/)
- Writing multiple audience-specific versions of release notes "is not scalable for a PM or PMM" — [LaunchNotes](https://www.launchnotes.com/blog/how-to-write-great-product-release-notes-the-ultimate-guide)

When release communication is done well, it improves feature adoption, reduces support load, and strengthens retention. The problem isn't that teams don't want to do it. The manual labor required doesn't fit into a workflow that ships daily.

---

## What this means in practice

A team running at AI velocity ships multiple times a day. Each merge contains real value: a bug fixed, a workflow improved, a performance regression resolved. Engineers know what they built. The product owner knows why it matters. But someone still has to sit down, read the diff, decode the commit message, figure out what the customer cares about, and write three or four different versions of the same update: one for the VP, one for the customer, one for the technical user.

That work compounds. At one deploy per week it's manageable. At five deploys per day it's a second job. At AI velocity (where a single session can produce what used to take a sprint), the gap between what ships and what gets communicated becomes a fire.

The communication bottleneck isn't just a productivity problem. It's the mechanism by which engineered value fails to become customer value.

---

## Legibly's answer

Legibly automates the translation layer. On every merge, it reads the diff and commit context, extracts the value signal, and generates audience-specific release notes for each configured persona, committed to your repo automatically. No manual writing. No communication gap. See the [README](../README.md) for how it works, configuration details, and quick start.

---

## Sources

- [GitHub Copilot statistics — Second Talent](https://www.secondtalent.com/resources/github-copilot-statistics/)
- [Unleashing developer productivity with generative AI — McKinsey](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/unleashing-developer-productivity-with-generative-ai)
- [State of AI in Software Engineering — Harness](https://www.harness.io/the-state-of-ai-in-software-engineering)
- [DORA Metrics: Four Keys — dora.dev](https://dora.dev/guides/dora-metrics-four-keys/)
- [Time Warp: Developer Productivity Study — Microsoft Research (2024)](https://www.microsoft.com/en-us/research/wp-content/uploads/2024/11/Time-Warp-Developer-Productivity-Study.pdf)
- [Developer Experience Report 2025 — Atlassian](https://www.atlassian.com/blog/developer/developer-experience-report-2025)
- [How much time do developers spend actually writing code? — Sonar](https://www.sonarsource.com/blog/how-much-time-do-developers-spend-actually-writing-code/)
- [The AI Velocity Paradox — Harness](https://www.harness.io/blog/the-ai-velocity-paradox)
- [Users engage with 6% of product features — Mind the Product / Pendo](https://www.mindtheproduct.com/users-engage-with-6-of-product-features-product-benchmark-findings/)
- [80% of features are rarely or never used — Medium](https://medium.com/@mohammedalaa/80-of-features-in-products-are-rarely-or-never-used-heres-why-6dcdf0204acf)
- [Feature discovery and adoption — Whatfix](https://whatfix.com/blog/feature-discovery/)
- [5 best practices for SaaS changelogs — Amoeboids](https://amoeboids.com/blog/5-best-practices-for-saas-changelogs/)
- [How to write great product release notes — LaunchNotes](https://www.launchnotes.com/blog/how-to-write-great-product-release-notes-the-ultimate-guide)
