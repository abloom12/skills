---
name: implement
description: Implement exactly one Backlog.md task from its approved implementation plan on a user-prepared feature branch, verify it, and wait for explicit approval before committing.
disable-model-invocation: true
---

# Implement

Implement exactly one explicitly named Backlog task from its approved Implementation Plan. This skill is the user's authorization to write code for that task only. It is not authorization to select another task, plan the task, implement a whole specification, or continue through the dependency frontier.

One invocation, one task, one user-controlled commit gate.

## Hard boundaries

- Require one explicit Backlog task ID. Never infer or select a task.
- Require the task to link to exactly one Backlog document whose type is `specification`.
- Require a non-empty, user-approved Implementation Plan already persisted on the task. If it is missing, unapproved, or materially stale, stop and direct the user to `plan-task`.
- Treat the task and specification as normative scope. The plan controls the approved implementation approach but cannot override either source.
- Never create, replace, append to, or otherwise modify the task's Implementation Plan.
- Do not accept a specification, conversation, ordinary file, todo list, or informal request as the implementation source.
- Do not invoke `code-review`, `tdd`, or any other skill.
- Do not start another task, even when this task's completion unblocks it.
- Do not broaden scope, alter requirements, or change acceptance criteria to match the implementation.
- Do not commit until the user explicitly approves the current proposed changes.
- Never merge, rebase, reset, stash, cherry-pick, amend, force, tag, switch/create/delete branches, push, pull, or clean the working tree.
- Never edit Backlog-managed Markdown directly; use the Backlog CLI.
- Never discard user or agent work to recover from a failure.

## 1. Verify the invocation and Backlog

Before changing anything:

1. Require exactly one unambiguous task ID such as `TASK-012`. If it is absent, malformed, or ambiguous, stop and request the full ID.
2. Verify that `backlog` is installed.
3. Verify that Backlog is initialized with a read-only command such as `backlog config list`.
4. Run and follow:
   - `backlog instructions overview`
   - `backlog instructions task-execution`
5. Read the task in full with `backlog task view <id> --json` or `--plain`.
6. Verify that every dependency is resolved and complete, the task is eligible to start, and its status is not terminal. Unknown or ambiguous dependency IDs are blockers; do not guess.
7. For each Documentation entry that identifies a Backlog document, resolve it with `backlog doc view <id> --plain`. Treat paths and URLs as ancillary documentation, not as the source specification. Exactly one linked Backlog document must have type `specification`; zero or multiple source specifications are an error.
8. Require a non-empty Implementation Plan that the user has approved. If no approved plan is persisted, stop and tell the user to run `/skill:plan-task <task-id>`.

If Backlog is missing or uninitialized, stop without changing the repository. Tell the user to install or initialize it; never run `backlog init`.

A task that fails the specification-link contract must return to `to-spec` or `to-tickets`. A task that lacks an approved plan must return to `plan-task`. Do not repair either planning artifact inside this skill.

## 2. Verify the Git workspace

Use Git read-only commands for this preflight:

1. Confirm the current directory is inside a Git worktree.
2. Require a clean working tree, including no staged, unstaged, or untracked files.
3. Require a named branch; refuse detached HEAD.
4. Determine the repository's default branch when possible from local Git metadata. Refuse the detected default branch and the conventional protected names `main`, `master`, and `trunk`.
5. Capture the exact starting commit with `git rev-parse HEAD`. Keep this immutable **implementation fixed point** for the entire run.

The user owns branch creation and selection. Do not offer to prepare or repair the branch.

Before writing code, report the task ID and title, source specification, current branch, and captured fixed point. The explicit skill invocation authorizes work to begin; do not add a ceremonial approval gate here.

## 3. Orient and validate the approved plan

Use the task and specification as normative scope and the persisted Implementation Plan as the approved approach. Also read:

- Relevant repository guidance and standards.
- Applicable root or context-specific `CONTEXT.md` files.
- Applicable ADRs under `docs/adr/` or the project's established location.
- Relevant implementation, tests, interfaces, recent changes, and dependency documentation.

Use accepted domain language. Surface a conflict with the specification, glossary, ADR, or current system rather than silently choosing a new product or architectural direction.

Before changing task status or source files, research the current code and validate that the approved plan still fits it. Trace every acceptance criterion through the planned changes and verification seams. The plan may contain ordinary low-level details that need routine adjustment, but its material approach, scope, and verification strategy must remain valid.

If the plan is materially stale, incomplete, or inconsistent with the task, specification, accepted architecture, or current system, stop and explain the exact conflict. Tell the user to rerun `/skill:plan-task <task-id>`; do not revise or overwrite the plan inside this skill.

After the plan validates, move the task to the repository's configured active status through `backlog task edit`. Preserve an existing assignee and do not invent an identity when none is configured.

Proceed without interrupting the user for routine, reversible choices within the approved plan. Stop if implementation exposes:

- A material change to the approved implementation approach or verification strategy.
- A material product, architecture, security, privacy, compatibility, or migration decision not settled by the task, specification, and plan.
- A genuine scope change.
- Missing evidence or access required to proceed safely.
- A contradiction that makes the acceptance criteria impossible as written.

Do not edit the plan, specification, or acceptance-criterion text to resolve such a problem. Report whether the task needs a revised plan through `plan-task` or a requirements correction through `to-spec` or `to-tickets`.

## 4. Implement one task

Follow the approved plan in focused, testable slices while staying inside the task boundary. Routine local adjustments are allowed when they do not materially change the approved approach; do not update the plan from this skill.

### Testing rhythm

- Follow the testing seams recorded in the specification.
- Prefer observable behavior at an existing public seam over private implementation tests.
- Where practical, establish a failing test or characterization first, make the smallest change that passes, then refactor while green.
- Run the most relevant individual test files after meaningful changes.
- Run relevant package- or project-level typechecking regularly.
- Run focused lint or other cheap checks when the repository supports them.
- Never weaken, delete, skip, or rewrite a valid test merely to obtain a passing result.

Keep tests and required documentation in the same task slice. Do not create follow-up tasks or start related work without user approval.

Record only useful progress, changed decisions, blockers, or validation evidence in the task's implementation notes. Avoid noisy step-by-step narration. Use `backlog task edit`; Backlog owns any configured automatic commits.

## 5. Perform final verification

Before presenting the work for review:

1. Re-read the task, specification, and approved Implementation Plan.
2. Confirm the completed approach still matches the approved plan and map every acceptance criterion to objective evidence.
3. Run every applicable repository-level verification command, including the full test suite, typecheck, lint, build, and task-specific checks when the repository defines them.
4. Exercise user-visible or interactive behavior through an appropriate automated seam or document the exact manual verification still required.
5. Inspect the complete proposed diff from the captured fixed point, including staged, unstaged, deleted, renamed, and untracked files.
6. Remove accidental artifacts and confirm every remaining change belongs to this task. Never remove unfamiliar work; starting clean means uncertainty is a reason to stop and report it.

Do not claim an acceptance criterion from code presence, grep output, or intent alone. If required verification fails or cannot run, append concise evidence to the task notes, leave the task active, leave source changes uncommitted, and stop. Do not mark the task complete.

## 6. User review and commit gate

Present:

- The task and delivered behavior.
- Changed files, significant design choices, and adherence to the approved plan, including any routine local adjustments.
- Acceptance-criterion evidence.
- Exact verification commands and results.
- Any residual risks or manual checks.
- The current `git status` and a concise diff summary.

Leave all implementation changes uncommitted. Print the exact optional fresh-session review command using the captured fixed point:

```text
/skill:code-review <task-id> <implementation-fixed-point>
```

Explain that the reviewer must run from the same repository while the working tree remains unchanged. Do not invoke the skill yourself.

Wait for the user's explicit approval to commit the current snapshot. Silence, a passing test suite, or a favorable review is not approval.

If the user requests changes, modify only this task, rerun affected focused checks and all applicable final verification, present the revised complete summary, and wait again. If anything changes after approval but before staging, invalidate the approval and present the new snapshot.

## 7. Commit the approved implementation

After explicit approval:

1. Recheck that the branch, task, fixed point, and proposed changes are unchanged from the approved snapshot.
2. Inspect for unrelated files, generated artifacts, credentials, secrets, and unexpectedly large or binary content.
3. Stage only the approved task-related paths. Do not use an indiscriminate staging command when explicit paths can be named.
4. Create one ordinary implementation commit using the task ID and outcome, for example:

   ```text
   TASK-012 Add workout session creation
   ```

5. Do not bypass hooks. If staging, hooks, or commit creation fails, leave the task active, preserve the working tree, and report the failure. Do not amend, reset, or retry by weakening verification.

Backlog may create its own bookkeeping commits when `autoCommit` is configured. Those are distinct from the one implementation commit. Do not push.

## 8. Finalize the Backlog task

Only after the implementation commit succeeds:

1. Run and follow `backlog instructions task-finalization`.
2. Re-read the task.
3. Check only acceptance criteria proven by the recorded objective evidence.
4. Check only Definition of Done items actually satisfied.
5. Append concise validation notes when they preserve useful evidence.
6. Write a final summary naming what changed and the verification performed.
7. Move the task to the configured terminal status.
8. Verify the persisted task with `backlog task view <id> --plain`.

If finalization fails after the implementation commit, do not alter or replace the commit. Report the successful commit and the incomplete task metadata so the safe finalization operation can be retried. When Backlog `autoCommit` is disabled and finalization leaves only Backlog metadata uncommitted, report that state instead of creating an unapproved extra commit.

Report the implementation commit, final task status, verification evidence, and any Backlog-managed commits or remaining metadata changes. Stop. Do not inspect the frontier or suggest that another ticket has been authorized.
