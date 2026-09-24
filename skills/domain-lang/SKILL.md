---
name: domain-lang
description: Sharpen and maintain project-specific domain language when terms are introduced or changed, conflicting meanings affect behavior, data, interfaces, ownership, compatibility, or tests, or the user requests a semantic audit or glossary update. Do not use merely to read existing vocabulary or review general naming and style.
---

# Domain Lang

Act as the project's semantic steward. Detect material ambiguity, test important distinctions, and preserve explicitly accepted meanings without imposing full Domain-Driven Design.

Do not activate merely to consume an existing glossary. Reading accepted vocabulary is an ordinary project habit; this skill is for auditing, changing, or sharpening the language.

## Modes

Infer the narrowest applicable mode:

- **Observe:** During relevant work, watch for material semantic ambiguity or drift. Intervene only when it could change the outcome. Do not edit language artifacts.
- **Audit:** Inspect the requested task, subsystem, or boundary and report findings. This is the default for an explicit review and does not authorize edits.
- **Maintain:** Create or update language artifacts only when maintenance is explicitly authorized and the affected meaning has been accepted by an authorized person.

When the mode is unclear, audit and report rather than persist.

## Materiality

Intervene only when a term or distinction could materially affect:

- Product behavior or domain rules
- Data meaning, identity, lifecycle, or ownership
- APIs, events, commands, interfaces, or cross-system contracts
- Permissions, responsibility, or authority
- Compatibility or migration behavior
- Tests whose assertions depend on domain meaning

Ignore harmless synonyms, local wording preferences, and general programming terms unless they create one of those consequences. Do not manufacture semantic work from every noun.

## Authority and evidence

Before declaring a conflict, inspect only the evidence relevant to it:

- Existing glossaries, `CONTEXT.md`, or context maps
- ADRs and project guidance
- Relevant implementation and tests
- API schemas, events, and external contracts
- Documentation and recurring cross-boundary usage

Facts and discoverable project conventions are agent-owned. Do not ask the user for evidence available in the workspace. If necessary evidence is inaccessible, identify exactly what is missing and keep dependent conclusions unresolved.

Treat code and documentation as evidence, not automatic semantic authority. A mismatch may be a bug, legacy behavior, migration, compatibility constraint, stale documentation, or an intended model change.

Classify meanings internally as:

- **Accepted:** explicitly agreed normative vocabulary
- **Proposed:** a candidate meaning awaiting authorized acceptance
- **Conflict:** incompatible material usages
- **Harmless variation:** different wording without a material distinction
- **Drift:** implementation or documentation no longer aligns with accepted meaning
- **Unresolved:** a material semantic decision or missing evidence remains

Evidence may support a proposal but cannot silently redefine accepted vocabulary. New or changed normative meanings require explicit agreement from an authorized person. If authority is unknown and persistence matters, keep the meaning proposed. Accepted vocabulary remains normative until explicitly reconsidered.

## Workflow

1. **Orient:** Establish the current task, relevant subsystem, and semantic boundary.
2. **Discover:** Find existing language conventions and the evidence needed for the current concern.
3. **Detect:** Identify overloaded terms, conflicting meanings, missing distinctions, or cross-boundary drift.
4. **Filter:** Discard findings that fail the materiality test.
5. **Stress-test:** When useful, apply one small concrete scenario or edge case that discriminates between plausible meanings.
6. **Classify:** Distinguish accepted language, proposals, conflicts, harmless variation, drift, and unresolved decisions.
7. **Resolve:** Apply accepted language, report drift, propose a meaning, request exact missing evidence, or hand off a material user-owned decision to grilling.
8. **Persist if authorized:** Update the relevant artifact only after acceptance and within the authorized scope.
9. **Align in-scope work:** Keep new or already in-scope code, tests, interfaces, and documentation consistent without expanding into unrelated remediation.

Do not turn scenarios into an exhaustive interrogation. One discriminating scenario is preferable to a catalog of edge cases.

## Glossary policy

Admit a term only when it is project-specific and at least one is true:

- It recurs enough that inconsistent meaning is likely.
- It crosses a subsystem, team, API, event, or documentation boundary.
- It is materially confusable with another relevant concept.

The minimum useful entry is a canonical term and a concise discriminating meaning. Definitions may include behavior when behavior distinguishes the concept, but must exclude implementation mechanics.

Aliases, terms to avoid, examples, context, status, and related terms are optional. Use them only when they prevent real confusion. Different contexts may legitimately use different terms when the boundary and translation are explicit.

Respect existing artifact conventions first. If none exist and persistence is authorized, default to a root `CONTEXT.md` for a single semantic context and create it lazily with the first accepted term. Introduce a context map or context-specific files only when evidence shows independently meaningful vocabularies or ownership boundaries; never create bounded contexts merely to organize documentation.

Before writing a glossary or context artifact, read [references/CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md).

## ADR policy

A language-related decision may justify an ADR only when all three are true:

1. **Hard to reverse:** changing it later has meaningful cost.
2. **Surprising without context:** a future reader would reasonably wonder why it was chosen.
3. **Genuine trade-off:** materially plausible alternatives existed and were deliberately rejected.

Meeting the threshold permits an ADR proposal, not creation. Create or update one only after the decision is accepted and persistence is authorized. Follow existing repository conventions. If none exist, read [references/ADR-FORMAT.md](references/ADR-FORMAT.md).

## Focused audit

Default to the current task and relevant subsystem or boundary. Expand only when evidence shows the same material concern crosses farther.

Report with only applicable sections:

- Scope and evidence examined
- Accepted-language conflicts
- Unresolved distinctions
- Implementation or documentation drift
- Proposed vocabulary updates
- Material risks or missing evidence
- Suggested next step

Clearly label accepted meanings, proposals, and unresolved questions. Omit empty sections and do not invent findings to fill the report.

## Integration with Grilling

Domain-lang identifies semantic concerns; grilling owns the interview protocol for material unresolved decisions.

When both are in use:

- Submit only concerns that pass this skill's materiality filter.
- Let grilling apply its ownership and relevance tests before asking anything.
- Maintain one question stream, one decision ledger, one shared-understanding summary, and one confirmation gate.
- Do not start a second semantic interview.
- Persist accepted vocabulary after confirmation only when maintenance was already authorized.

When used alone, report a material unresolved user-owned decision and suggest a focused grilling handoff rather than conducting an open-ended requirements interview.

## Boundaries and completion

Do not authorize full DDD, schema design, architecture redesign, broad renaming, data migration, compatibility breaks, unrelated cleanup, or implementation. Glossary or ADR authorization covers only the specified decision artifacts.

A task is complete when material in-scope findings are classified; accepted meanings, proposals, conflicts, and missing evidence are distinguishable; no material semantic ambiguity is silently assumed; and any persistence was both accepted and authorized.

Stop at that point. Do not continue reviewing merely to find optional wording improvements.
