---
name: to-tickets
description: Turn an approved Backlog.md specification into a reviewed set of tracer-bullet Backlog tasks with explicit dependencies.
disable-model-invocation: true
---

# To Tickets

Turn one approved Backlog.md specification document into implementation-ready tickets. Draft and review the complete decomposition first; create or update Backlog tasks only after explicit approval.

A Backlog **task** is a ticket in this workflow.

## Boundaries

- A Backlog specification document is mandatory. Do not work directly from a conversation, informal plan, ordinary Markdown file, or todo list.
- Do not invent missing requirements or use ticket decomposition to finish product design.
- Do not add speculative implementation plans, predicted file lists, layer-by-layer instructions, or code snippets to tickets.
- Do not implement, start, or complete the published tasks.
- Approval of the source specification does not approve the ticket breakdown. Ticket publication has its own gate.

## 1. Verify Backlog.md

Before decomposing anything:

1. Verify that the `backlog` executable is available.
2. Verify that Backlog.md is initialized for the current project with a read-only command such as `backlog config list`.
3. Run `backlog instructions overview`.
4. Run `backlog instructions task-creation` and follow it completely before creating or updating tasks.

If Backlog.md is missing or uninitialized, stop without changing the repository. Tell the user to install or initialize it themselves. Never run `backlog init`.

Use the Backlog CLI for every Backlog read and write. Respect project configuration, including statuses, task types, assignment defaults, Definition of Done, ID formatting, and commit behavior.

## 2. Require and read the source specification

Use a document ID supplied by the user or the unambiguous specification document just published by `to-spec` in the current conversation. Outside that unambiguous handoff, require the user to identify the source document; never guess the latest document.

Read it in full with:

```text
backlog doc view <id> --plain
```

Verify that its type is `specification`. If no qualifying document is available, stop and tell the user to run `to-spec`. If the document contains material contradictions or gaps that prevent safe decomposition, identify them and stop; do not repair the specification inside this skill.

Read relevant accepted vocabulary and ADRs when needed to interpret the spec consistently. Explore the codebase only enough to understand existing boundaries, likely verification seams, and whether a preparatory refactor is genuinely necessary.

## 3. Search existing tasks

Follow Backlog's search-first guidance. Use focused `backlog search`, filtered `backlog task list`, and `backlog task view` commands to find likely overlapping work. Read likely matches in full.

Do not silently duplicate, replace, or modify an existing task. Carry each material overlap into the review with a recommendation to:

- Reuse the task unchanged,
- Update it to match the proposed slice,
- Keep it and create distinct work, or
- Exclude duplicate work.

An existing task may be changed or linked to the specification only after that exact action is approved.

## 4. Draft tracer-bullet tickets

Decompose the specification into the smallest useful set of **tracer-bullet** vertical slices.

Each ordinary ticket must:

- Deliver a narrow but complete path through every layer needed for one behavior.
- Be independently demonstrable or verifiable when complete.
- Fit within one fresh agent context window.
- Own the acceptance criteria that grade its behavior.
- Carry enough intent and context for a fresh worker without copying the whole specification.

Do not split work into horizontal layer tickets such as schema, API, UI, and tests when none delivers behavior alone.

### Exceptions

A focused preparatory refactor may precede a slice only when it creates a necessary safe seam and has a concrete independently verifiable result.

For a wide mechanical refactor whose blast radius cannot remain green as a vertical slice, use expand–migrate–contract:

1. Expand by adding the new form beside the old.
2. Migrate callers in independently safe batches.
3. Contract by removing the old form after all migrations.

Use an integration branch and final integrate-and-verify ticket only when individual migration batches cannot remain green.

### Dependencies

Give every ticket only its genuine direct blockers. Avoid redundant transitive dependencies and cycles. A ticket with no blockers belongs to the initial frontier and can start immediately.

Order the draft topologically, with blockers before the tickets they unblock.

### Task type

Infer exactly one type for each ticket from its primary delivered outcome. Use only a type configured in the repository, and prefer established repository conventions when they differ from the defaults below:

- `feature` for new user-facing behavior.
- `bug` for correcting behavior.
- `enhancement` for improving supported behavior.
- `chore` for maintenance, dependencies, tooling, migrations, or CI.
- `docs` for documentation-only work.
- `spike` for investigation.
- `task` as the honest fallback when no more specific type dominates.

Do not choose a type from incidental work inside the ticket. For example, documentation included in a behavioral slice does not make that ticket `docs`. If the honest type is not configured and no configured fallback fits, carry the type as unresolved into review instead of inventing or silently omitting it.

### Assignment preview

Read the configured `defaultAssignee` and show the effective assignment it would give each new ticket. Display `Unassigned` when no default is configured. This is a preview, not a reason to infer an owner or pass `--assignee`; normally let Backlog apply its configured default during creation.

For an existing task, show its current assignees and preserve them unless the exact assignment change is separately proposed and approved.

### Ticket content

Each proposed ticket contains:

- **Title:** short and outcome-oriented.
- **Type:** one configured task type inferred from the primary outcome.
- **Effective assignee:** the configured default for a new task, or the current assignment for an existing task.
- **What it delivers:** the behavior and necessary context, not an implementation checklist.
- **Acceptance criteria:** specific observable conditions.
- **Blocked by:** proposed ticket numbers or approved existing task IDs that genuinely gate it.
- **Specification:** the source Backlog document ID.
- **Existing-task action:** only when an overlap was found.

Acceptance criteria must:

- Be false before the ticket's implementation begins.
- Be verifiable within that ticket's scope.
- Describe behavior or a concrete safe-refactor result rather than private implementation steps.
- Not depend on unfinished behavior owned by another ticket unless that ticket is declared as a blocker.

Do not include an implementation plan, modified-file prediction, or code snippet. Implementation research belongs to `plan-task` after the user selects a ready task.

## 5. Review gate

Present the complete proposed set as a numbered list. For every ticket show all ticket content above, including full acceptance criteria and blocking edges. Also show:

- The initial dependency frontier.
- Any proposed reuse or modification of existing tasks.
- Whether a prefactor or wide-refactor exception was used and why.

Ask the user to review:

- Whether each ticket delivers a demonstrable result.
- Whether each proposed type matches the primary delivered outcome; allow the user to change it to another configured type.
- Whether granularity is too coarse or too fine.
- Whether tickets should be merged or split.
- Whether every blocking edge is genuine.
- Whether overlap handling is correct.

Iterate without writing to Backlog. After material revisions, present the complete revised set. Do not publish with an unresolved or unconfigured type. Publish only after explicit approval of the complete decomposition and every proposed existing-task change.

## 6. Publish through Backlog

After approval, re-read the configured types and `defaultAssignee`. If either would invalidate an approved type or change the reviewed effective assignment, return to review rather than silently publishing different metadata.

Publish in topological order so blocker IDs exist before dependent tasks are created.

For each new task, use `backlog task create` with:

- The approved title and description,
- `--type <approved-type>`,
- One `--ac` value per approved acceptance criterion,
- `--depends-on` for approved blocker task IDs,
- `--doc <spec-id>` for the source specification.

Normally omit `--assignee` so Backlog applies the reviewed `defaultAssignee`. Omit status, plan, notes, final summary, and modified-file options unless the approved ticket explicitly requires a non-default metadata value. This preserves repository defaults and does not signal that execution has begun.

For an approved existing-task update, read the task again immediately before changing it. Preserve fields not covered by the approval. Use `backlog task edit`, including `--type` when an approved type change is part of the action; never edit its Markdown file directly. Be careful that replacement-style CLI options may overwrite existing lists.

After each write, capture the returned task ID. Substitute real IDs into later dependencies. If a write fails, stop, report all tasks already created or updated and the exact failed operation, and do not continue into dependent work or create replacements blindly.

## 7. Verify and stop

Read every created or updated task with `backlog task view <id> --plain` or `--json`. Confirm its content, stored type, effective assignees, specification link, and direct dependencies match the approved draft.

Report:

- Task IDs, titles, types, and effective assignees,
- Direct blocking edges,
- The initial dependency frontier,
- Any approved existing tasks reused or changed.

Stop after publication. Do not read task-execution instructions, change task status, assign work, create implementation plans, or begin implementation. The next optional step is `/skill:plan-task <task-id>` for one ready task; do not invoke it automatically.
