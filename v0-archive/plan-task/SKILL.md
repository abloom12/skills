---
name: plan-task
description: Research, review, and save an approved implementation plan for exactly one ready Backlog.md task on a user-prepared feature branch, without implementing it.
disable-model-invocation: true
---

# Plan Task

Produce the implementation plan for exactly one explicitly named Backlog task. Research the current system, develop the plan with the user, and write it to the task only after explicit approval.

One invocation, one task, one approved plan. Planning is the only job.

## Hard boundaries

- Require one explicit Backlog task ID. Never infer or select a task.
- Require the task to link to exactly one Backlog document whose type is `specification`.
- Require every dependency to be resolved and complete before planning.
- Do not accept a specification, conversation, ordinary file, todo list, or informal request in place of a task.
- Do not change task status, assignees, acceptance criteria, dependencies, documentation links, notes, final summary, or any other task field besides the implementation plan.
- Do not write the plan to Backlog until the user explicitly approves the complete draft.
- Do not implement, edit source files, run code generators, or modify repository configuration or documentation.
- Do not commit, merge, rebase, reset, stash, cherry-pick, amend, force, tag, switch/create/delete branches, push, pull, or clean the working tree.
- Do not invoke `implement`, `code-review`, `tdd`, or another skill.
- Never edit Backlog-managed Markdown directly; use the Backlog CLI.
- Do not broaden scope, alter requirements, or use the plan to repair an incomplete specification or ticket.
- Do not put the planning conversation, approval history, a Git commit SHA, or other process metadata into the saved plan.

## 1. Verify the invocation and Backlog

Before planning:

1. Require exactly one unambiguous task ID such as `TASK-012`. If it is absent, malformed, or ambiguous, stop and request the full ID.
2. Verify that `backlog` is installed.
3. Verify that Backlog is initialized with a read-only command such as `backlog config list`.
4. Run and follow:
   - `backlog instructions overview`
   - `backlog instructions task-execution`
5. Read the task in full with `backlog task view <id> --json` or `--plain`.
6. Verify that every dependency is resolved and complete, the task is eligible to start, and its status is not terminal. Unknown or ambiguous dependency IDs are blockers; do not guess.
7. For each Documentation entry that identifies a Backlog document, resolve it with `backlog doc view <id> --plain`. Treat paths and URLs as ancillary documentation, not as the source specification. Exactly one linked Backlog document must have type `specification`; zero or multiple source specifications are an error.
8. Read any existing implementation plan. Treat it as a draft to reassess against the current system, not as authority or permission to overwrite it.

This specialized planning workflow intentionally does not perform the task-execution guide's status, assignment, plan-persistence, or implementation steps. If Backlog is missing or uninitialized, stop without changing the repository. Tell the user to install or initialize it; never run `backlog init`.

A task that fails the specification-link contract must return to `to-spec` or `to-tickets`. Do not repair planning artifacts inside this skill.

## 2. Verify the Git workspace

Use only read-only Git commands:

1. Confirm the current directory is inside a Git worktree.
2. Require a clean working tree, including no staged, unstaged, or untracked files.
3. Require a named branch; refuse detached HEAD.
4. Determine the repository's default branch when possible from local Git metadata. Refuse the detected default branch and the conventional protected names `main`, `master`, and `trunk`.

The user owns branch creation and selection. Do not offer to prepare or repair the branch. Do not record the current commit in the plan.

Before research, report the task ID and title, source specification, and current branch. The explicit invocation authorizes planning to begin; do not add a ceremonial approval gate.

## 3. Research the implementation context

Treat the task and specification as normative scope. Read only what is relevant to planning the task, including:

- Repository guidance and standards.
- Applicable root or context-specific `CONTEXT.md` files.
- Applicable ADRs under `docs/adr/` or the project's established location.
- Relevant implementation, tests, public interfaces, schemas, configuration, and dependency documentation.
- Focused recent history when it explains the current design or likely integration seams.

Trace each acceptance criterion to the current behavior and identify the concrete seams through which it can be implemented and verified. Base the approach on current evidence rather than file predictions or assumptions inherited from ticket creation.

Use accepted domain language. Surface a conflict with the specification, glossary, ADR, task, or current system instead of silently choosing a new product or architectural direction.

Proceed without interrupting the user for routine, reversible engineering choices. Ask a focused question only when planning exposes:

- A material product, architecture, security, privacy, compatibility, or migration decision not settled by the task or specification.
- A genuine scope change.
- Missing evidence or access required for a credible plan.
- A contradiction that makes an acceptance criterion impossible as written.

Do not save a plan while a material decision or contradiction remains unresolved. Do not edit the task or specification to resolve it.

## 4. Draft the plan

Write a concise, actionable plan that a fresh implementation agent can execute in one context. Include only applicable sections:

```markdown
## Approach

<The chosen design and how it fits the current system.>

## Implementation Steps

1. <Ordered behavior-oriented change naming concrete modules, interfaces, or files when supported by evidence.>
2. <Tests and documentation stay with the behavior they verify.>

## Acceptance Criteria Coverage

- <Criterion> — <implementation and objective verification seam>

## Final Verification

- `<exact command>` — <what it proves>
```

The plan must:

- Stay within the task and specification.
- State the chosen approach rather than list unresolved alternatives.
- Name concrete code areas and interfaces when research supports them.
- Order changes so the implementation can remain testable in focused slices.
- Include required tests and documentation alongside the behavior they support.
- Map every acceptance criterion to objective evidence.
- Include exact applicable verification commands supported by the repository.
- Mention material risks, migration steps, or manual checks only when they genuinely apply.
- Avoid copying the full task, speculative abstractions, code dumps, and private implementation-test details.
- Contain only the implementation plan, not the planning transcript, approval record, timestamps, branch name, or commit SHA.

When revising an existing plan, produce one complete replacement draft. Do not present a patch or append contradictory addenda.

## 5. Review gate

Present the complete proposed plan and say whether it will create the task's first plan or replace its existing plan. Ask the user to review the approach, sequence, scope, acceptance-criterion coverage, and verification.

Iterate without writing to Backlog. After every material revision, present the complete revised plan. Approval of an idea, partial section, or earlier version is not approval of the current complete draft.

Persist only after explicit approval of the complete plan and the create-or-replace action.

## 6. Persist and verify

Immediately before writing:

1. Re-read the task and source specification.
2. Recheck dependencies, task eligibility, current branch, and clean worktree.
3. Confirm the task, specification, and relevant implementation evidence have not materially changed since approval. If they have, invalidate the approval, revise the plan, and return to the review gate.

Write the exact approved plan with:

```text
backlog task edit <id> --plan <approved-markdown>
```

Pass multiline Markdown safely. Change no other task field. Do not create an explicit Git commit; allow Backlog to apply the repository's configured automatic commit behavior.

Read the task again with `backlog task view <id> --plain` and verify that the persisted Implementation Plan exactly matches the approved draft and all other task content remains intact. If the write or verification fails, report the exact state and do not create a replacement task or attempt unrelated repairs.

Report the task ID, title, and that its approved implementation plan was saved. Mention any Backlog-managed commit reported by the CLI. Stop without changing status, beginning implementation, or selecting another task. The next optional step is `/skill:implement <task-id>`; do not invoke it automatically.
