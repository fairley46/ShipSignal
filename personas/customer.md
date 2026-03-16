# Persona: The Customer

Day-to-day users of the product. Non-technical. They care about whether things work,
whether anything broke, and whether something they've been waiting for finally shipped.

---

## Who They Are

A power user who lives in this product for hours every day. They know the product
deeply — not because they're technical, but because it's their main tool. They have
workflows. Habits. Ways of doing things. When something changes, their first question
is: *did this break what I depend on?* Their second — once they're sure they're safe —
is genuine curiosity about what's new.

## When They Read This

At their desk, between tasks, two minutes to spare. They clicked through from an
in-app banner or email subject line. Their primary feeling is mild anxiety: *please
don't let this have broken the thing I use every day.* Once they confirm they're safe,
they'll actually read.

## What They Need

- Did anything change that affects how I do my work?
- Is there anything I need to do?
- Was something I've been dealing with finally fixed?

## What to Leave Out

- Technical explanations of how anything works
- Infrastructure, backend, or API changes with no UI impact
- Anything about teams, architecture, or implementation
- Internal ticket numbers

---

## Writing Instructions

- **Use "you" throughout.** Speak directly to the person, not about them.
- **Describe changes as experienced, not implemented.** "Pages load faster" not "latency reduced."
- **Acknowledge fixes with empathy first.** "An issue that was causing X is resolved."
- **Say when no action is needed.** They worry about action items. Reassure them explicitly.
- **Keep each point to 1-2 sentences.** They are skimming.
- **No jargon, no acronyms, no internal names.**

## Output Structure

```
## What's new — [readable date, e.g. "March 16, 2026"]

**New this week:**
- [What you can now do, written as a user action or experience]

**Faster and more reliable:**
- [What got better — described as felt experience, not technical metric]

**Fixed:**
- [What was broken, described as the user experienced it, now resolved]

**Nothing you need to do.** *(include this line if no action required)*
```

## Good Example

> ## What's new — March 16, 2026
>
> **New this week:**
> - You can now schedule exports to run automatically on a daily or weekly cadence.
>   Set it once under Settings > Exports.
>
> **Faster and more reliable:**
> - Your dashboard loads noticeably faster — most of you will see it in under a
>   second instead of three or four. Especially noticeable right after login.
>
> **Fixed:**
> - An issue causing some exports to come through blank or incomplete is resolved.
>
> **Nothing you need to do.** These changes are live automatically.

## Bad Example

> Dashboard rendering was improved via async data fetching and component memoization.
> Export pipeline race condition resolved. Scheduled task feature added with cron config.

**Why this fails:** The customer can't tell if their workflow is affected. Nothing is
written for them. They'll skim, find nothing recognizable, and close the email.
