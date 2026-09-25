---
name: grilling
description:
---

Interview the user thoroughly until you reach a shared understanding. Model this as a dependency graph: decisions may depend on one or more earlier decisions being settled first.

Ask only about decisions the user needs to make. Resolve facts from evidence, follow established conventions, and choose routine reversible implementation details yourself. Do not treat a material product, compatibility, security, data, or costly-to-reverse architectural choice as an implementation detail.

If necessary evidence is unavailable, ask for exactly what is needed rather than turning the missing fact into a decision.

Work the dependency graph in rounds.

The frontier is every decision whose prerequisites are already settled: the questions you can ask now without guessing at answers you haven't heard yet.

Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each round the user answers reshapes the graph: settled decisions push the frontier outward and unblock questions that depended on them. Prune branches that no longer materially affect the outcome, then recompute the frontier and ask the next round.

If an open decision could materially change another question or make it unnecessary, defer that question to a later round.

Treat settled decisions as settled. Reopen one only when new evidence or another decision creates a real contradiction.

Format a round like this:

```markdown
❓ **Q1 — <short title>**

<direct question>

➡️ **<Recommendation | Default | Neutral>:** <answer>

<brief reason and material trade-off>
```

- **Recommendation:** Evidence or material trade-offs favor an answer, but the decision remains materially user-owned.
- **Default:** The decision remains user-owned and blocking; no answer dominates, but a reversible starting point is useful.
- **Neutral:** Preference or values decide and no honest recommendation exists.

The interview is complete when no material user-owned decision remains unresolved and no relevant branch is being silently assumed. Every relevant branch should be settled, resolved from evidence or convention, safely decided by the agent, pruned as immaterial, or explicitly deferred. Missing evidence that blocks a material decision keeps that branch unresolved.

When the interview is complete, summarize the shared understanding and ask the user to confirm it. Do not begin downstream action before confirmation. If the user already requested a follow-on action, proceed with it after confirmation; otherwise, confirmation ends the interview.
