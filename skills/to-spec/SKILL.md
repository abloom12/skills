---
name: to-spec
description: Turn a settled conversation into a reviewed Backlog.md specification document without reopening the requirements.
disable-model-invocation: true
---

# To Spec

Synthesize decisions already made into a high-quality specification, obtain approval of the complete draft, and only then publish it as a Backlog.md specification document.

This is a synthesis workflow, not a requirements interview. It may follow `grill-with-docs`, but does not require it.

## Boundaries

- Do not invent decisions, requirements, user stories, or implementation details to make the document look complete.
- Do not start a grilling interview.
- If a material contradiction or unresolved decision prevents a truthful specification, stop without drafting or publishing. Identify the exact blockers and suggest `grill-with-docs`.
- Do not implement the specification, create implementation tasks, or modify unrelated files.
- Approval of a testing seam is not approval of the final specification. Publication requires approval of the complete draft.

## 1. Verify Backlog.md

Before planning or writing:

1. Verify that the `backlog` executable is available.
2. Verify that Backlog.md is initialized for the current project by running a read-only configuration command such as `backlog config list`.
3. Run `backlog instructions overview` and follow it.

If Backlog.md is missing or uninitialized, stop without changing the repository. Tell the user to install or initialize it themselves and then rerun this skill. Never run `backlog init`.

Use the Backlog CLI for every Backlog read and write. Respect the repository's Backlog configuration and do not commit separately; Backlog owns any configured commit behavior.

## 2. Establish the settled source

Use the current conversation and any source the user explicitly supplied. Confirm from the available context that the subject, intended outcome, material behavior, constraints, and exclusions are sufficiently settled.

This does not require a preceding `grill-with-docs` invocation or a formal confirmation marker. It does require enough settled information to avoid silent assumptions. Routine, reversible engineering choices may remain agent-owned.

If material decisions remain open, report them concisely and stop. Do not turn them into assumptions or questions inside this skill.

## 3. Gather relevant evidence

Explore only as much of the repository as needed to represent the current state accurately:

- Read the relevant root or context-specific `CONTEXT.md` files when present and use their accepted vocabulary.
- Read applicable ADRs under `docs/adr/` or an established project-specific location.
- Inspect relevant code, tests, interfaces, and project guidance.
- Treat absent domain artifacts as normal; do not create them.
- Surface a conflict with accepted vocabulary or an ADR rather than silently overriding it.

Search Backlog for related specification documents using focused `backlog doc search` queries. Read likely matches in full with `backlog doc view <id> --plain`.

If the user supplied a document ID, treat it as an update candidate and read it in full. Otherwise, never select an update target from a fuzzy match alone.

## 4. Choose testing seams

Describe the highest practical public seam through which the change's behavior can be tested. Prefer an existing seam to a new one and prefer fewer seams when they provide sufficient confidence.

Ask the user to decide only when the seam choice would materially affect architecture, externally observable coverage, cost, or another consequential trade-off. When an established repository seam clearly applies, choose it as an agent-owned default and disclose it in the draft instead of asking ceremonially.

If a seam decision is needed, ask that one focused question, wait for the answer, and then continue. Do not expand it into a requirements interview.

## 5. Draft the specification

Use the project's accepted language. Include only applicable sections and omit empty ceremonial sections.

```markdown
# <Specification title>

## Problem

The problem or need from the affected user's or system's perspective.

## Intended Outcome

The behavior or result the completed work must produce.

## User Stories

Numbered user stories when the work is genuinely user-facing. Do not force user stories onto refactors, migrations, infrastructure, or architectural work.

## Requirements and Invariants

Observable requirements, domain rules, contracts, constraints, and invariants. Use this section instead of artificial user stories for technical work.

## Implementation Decisions

Only decisions already settled or safely derived from repository evidence: affected modules, public interfaces, architecture, schemas, contracts, interactions, and compatibility behavior. Do not include predicted file paths or speculative code.

## Testing Decisions

The agreed or agent-owned testing seams, expected externally observable coverage, and relevant prior art in the repository. Do not specify tests of private implementation details.

## Out of Scope

Explicit exclusions and deferred work.

## Further Notes

Only material context that does not belong above.
```

A prototype snippet may be included only when it records a settled decision more precisely than prose. Trim it to the decision-bearing portion and identify it as prototype-derived.

Reconcile the draft against the complete settled conversation before presenting it. Every material accepted decision and consequential derived rule must appear, and nothing may appear merely because the template offered a place for it.

## 6. Review gate

Present the complete draft before writing to Backlog. Also present the intended publication action:

- Create a new specification document, or
- Update a specific existing document.

When a related document exists but the correct action is not explicit, ask whether to update it or create a new one. Never overwrite based only on similarity.

Invite corrections and wait. After a material revision, present the complete revised draft again. Do not publish until the user explicitly approves both the content and the create-or-update action.

## 7. Publish and verify

After approval:

- For a new document, use `backlog doc create <title> --type specification --plain`, capture the returned document ID, then set its complete body with `backlog doc update <id> --content <markdown>`.
- For an approved update, use `backlog doc update <id>` with the approved title, type, and complete body as needed.
- Pass multiline Markdown safely; do not place untrusted or multiline content into an unquoted shell argument.
- Verify the persisted result with `backlog doc view <id> --plain`.

If creation succeeds but population or verification fails, report the partially created document and retry only the failed safe operation. Do not create a duplicate.

Report the final document ID, title, and path. Stop there. The next optional step is `to-tickets`; do not invoke it automatically.
