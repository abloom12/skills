---
name: grilling
description: Stress-test and sharpen a software or product plan, design, decision, or idea through a structured interview that resolves implementation-blocking ambiguity. Use when the user wants to clarify, pressure-test, or work through an under-specified proposal before action, or when another skill requires the grilling protocol.
---

# Grilling

Reach shared understanding before action. Model the discussion internally as a decision tree and work its **frontier**: decisions ready now because their prerequisites are settled.

Be persistent about important ambiguity, not exhaustive about every imaginable branch. Keep the interview plain, concise, and matched to the user's language. A small request should produce a small interview.

Do not expose the internal tree, classifications, or ledger unless doing so helps resolve confusion. Do not begin downstream execution during the interview.

## Ownership and relevance

Ask a question only when all three are true:

1. Reasonable answers could materially change the outcome.
2. The decision must be made now for the requested outcome.
3. The user, rather than the agent, owns the decision.

If any test fails, resolve the matter from evidence, derive it, choose a routine reversible default, defer it, or exclude it instead of asking.

User-owned decisions include product behavior and scope; externally visible contracts with material semantic or compatibility consequences; data ownership, lifecycle, privacy, or security posture; compatibility and migration guarantees; consequential trade-offs; and architecture costly to reverse.

Visibility alone does not make a detail user-owned. Own facts, repository conventions, ordinary naming and placement, routine reversible presentation or format conventions, standard framework usage, and other low-risk implementation details. Disclose consequential defaults in the final summary without turning them into ceremonial questions.

A strong recommendation is not itself a reason to ask. If one answer follows from settled decisions, established safety requirements, repository evidence, or an ordinary low-risk default, record the consequence or default rather than requesting confirmation. Derive a rule only when no materially different alternative remains compatible with settled decisions. Never hide a genuinely material user-owned choice by calling it derived, agent-owned, deferred, or out of scope.

## Evidence

Investigate relevant workspace evidence with available tools before asking technical questions. Expand investigation only as the current frontier requires; never ask the user for facts you can discover safely.

If necessary evidence is inaccessible, say what you examined and request the exact evidence or access needed. Evidence or access requests are not decision questions: do not number them or attach a stance. Keep dependent branches open while continuing with unrelated frontier questions.

## Interview loop

### 1. Orient

Derive the subject and intended outcome from the request, prior conversation, and readily available context. If either is materially ambiguous, make it the root decision and ask it before expanding the tree.

Consider behavior, scope, interfaces, data, failure modes, compatibility, security, operations, and testing only where they could materially affect this subject. These are prompts for judgment, not a checklist to question the user about.

### 2. Normalize the frontier

Build and revise only relevant branches. Before each round:

1. Remove candidates that fail the ownership and relevance tests.
2. Collapse candidates asking the same underlying decision.
3. Hold any question whose terms, options, recommendation, or blocking status depend on an open branch.
4. Batch the ready independent questions that remain.

For each possible pair, consider materially different plausible answers. If either answer could change the other's framing, recommendation, or need to be asked, ask only the upstream question first. Ask one alone when its answer may reshape the tree. If the ready frontier is unusually large, use a coherent subset and say that more ready questions remain.

### 3. Ask the round

Each question covers one decision. Use short titles, familiar words, and only the context needed to answer. Define necessary specialist terms. Offer concrete options when useful, but never invent options merely to force multiple choice.

Do not recommend broad scope as a hedge against uncertainty. Judge breadth by the behavior and maintenance it adds. Recommend broader scope only when established user or repository evidence shows a narrower choice cannot satisfy the goal.

Use this format:

```markdown
❓ **Q1 — <short title>**

<direct question>

➡️ **<Recommendation | Default | Neutral>:** <answer>

<brief reason and material trade-off>
```

- **Recommendation:** Evidence or material trade-offs favor an answer, but the decision remains materially user-owned.
- **Default:** The decision remains user-owned and blocking; no answer dominates, but a reversible starting point is useful.
- **Neutral:** Preference or values decide and no honest recommendation exists.

Choose a stance only after the question passes the ownership and relevance tests. Then stop and wait for the user's response.

### 4. Incorporate

Accept natural language and shorthand. Treat accepted recommendations and defaults as settled decisions. Keep a compact, complete ledger of decisions, derived rules, agent-owned defaults, deferrals, exclusions, risks, and unresolved evidence.

Challenge assumptions, edge cases, and failure scenarios only when they could materially change the outcome. Surface genuinely incompatible requirements immediately; ask which takes precedence only when they cannot coexist. Treat differing repository behavior as evidence unless it makes a requirement impossible. Do not reopen settled decisions without new evidence or a real contradiction.

## Completion

Conclude when no known material, blocking, user-owned decision remains and every relevant branch is settled, derived, agent-owned, explicitly deferred, out of scope, or waiting on clearly identified evidence. Necessary missing evidence keeps its dependent branch unresolved. The intended outcome must be explainable without silent assumptions.

Before presenting shared understanding, reconcile it against the complete ledger. Include every material decision and consequential derived rule or default; do not rely on scattered earlier acknowledgments.

Present a concise summary using the applicable sections:

- Goal
- In scope
- Decisions
- Agent-owned defaults
- Deferred
- Out of scope
- Risks or missing evidence
- Suggested next step

End by asking:

> Have we reached shared understanding, or should I reopen any decision?

If the user stops early, provide the same summary and mark unresolved blocking decisions.

## Confirmation and boundaries

Confirmation is the downstream-action gate. If the user already requested a follow-on action, proceed after confirmation without asking again. If no follow-on action was requested, confirmation ends the interview and does not authorize implementation.

In standalone use, do not edit project files or publish documentation. A composing skill may explicitly authorize updates limited to decision artifacts such as a glossary or ADR; this never authorizes implementation or unrelated changes. Destructive, irreversible, or external actions may still require separate approval.
