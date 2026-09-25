---
name: code-review
description: Review the proposed changes for one Backlog.md task against a fixed Git point along correctness, standards, and specification axes without modifying anything.
disable-model-invocation: true
---

# Code Review

Review the proposed implementation of exactly one Backlog task. The target may contain committed, staged, unstaged, renamed, deleted, and untracked work. Perform a static, read-only review and report evidence-backed findings; never modify or approve the work.

For AI-authored work, prefer a fresh Pi session in the same repository so the reviewer does not inherit the implementation agent's assumptions.

## Hard boundaries

- Require one explicit Backlog task ID and one explicit Git fixed point.
- Require the task to link to exactly one Backlog document whose type is `specification`.
- Do not guess a task from commit messages, a branch name, a recent document, or a numbered list.
- Do not guess the fixed point or fetch, pull, or update it.
- Do not edit source, tests, configuration, documentation, Backlog artifacts, or Git state.
- Do not run tests, builds, linters, typechecks, formatters, package managers, migrations, servers, or any command that may alter the worktree or external systems.
- Do not invoke other skills or spawn subagents in v1.
- Do not fix findings, update task status, check acceptance criteria, commit, or approve a commit.
- Do not repeatedly review until no findings remain.

## 1. Validate the inputs

Require an invocation equivalent to:

```text
/skill:code-review TASK-012 <fixed-point>
```

Then:

1. Verify that `backlog` is installed and initialized using read-only commands.
2. Run `backlog instructions overview` and follow its read-only guidance.
3. Read the task in full with `backlog task view <id> --json` or `--plain`.
4. For each Documentation entry that identifies a Backlog document, resolve it with `backlog doc view <id> --plain`. Treat paths and URLs as ancillary documentation, not as the source specification.
5. Require exactly one linked Backlog document of type `specification`; zero or multiple source specifications are an error.
6. Confirm the current directory is the intended Git worktree.
7. Resolve the supplied fixed point with `git rev-parse`; stop on a missing or ambiguous ref.
8. Record the current branch, `HEAD`, status, and fixed-point SHA.

The task may be active or terminal, but its identity and source specification must be unambiguous.

## 2. Freeze the proposed review target

If the supplied fixed point is an ancestor of `HEAD`, use it directly as the review base. Otherwise, compute the merge base between the fixed point and `HEAD` and disclose that resolved base.

Capture the complete proposed state relative to that base using read-only Git operations:

- Committed branch changes between the base and `HEAD`.
- Staged changes.
- Unstaged changes.
- Renames and deletions.
- Untracked, non-ignored files from `git ls-files --others --exclude-standard`.
- Diff statistics and the complete changed-path list.

A normal Git diff omits untracked files, so enumerate and read them explicitly. Do not review ignored build products unless the task deliberately tracks them.

Compute a read-only fingerprint from the tracked diff plus untracked path/content hashes. Do not create a temporary file in the repository. Stop if there are no reviewable implementation changes.

Backlog task metadata may appear because Backlog uses repository files and optional automatic commits. Use it for provenance, but do not treat expected Backlog-managed metadata as implementation code or a code-quality finding.

The diff locates the change; it is not the limit of investigation. Read full changed files and enough surrounding callers, tests, interfaces, schemas, and configuration to evaluate the behavior accurately.

## 3. Gather review authority

Read only relevant sources:

- The complete Backlog task and acceptance criteria.
- The complete linked specification.
- Applicable `CONTEXT.md` files and ADRs.
- Root and scoped `AGENTS.md` or `CLAUDE.md` guidance already available to the session.
- Repository standards such as `CONTRIBUTING.md`, `CODING_STANDARDS.md`, style guides, and testing guidance.
- Relevant implementation and tests.

Repository-specific standards override generic heuristics. Existing code is evidence of convention, not automatic proof that a pattern is correct.

Treat verification notes and final summaries as claims to inspect, not substitutes for evidence. This skill is static and does not rerun their commands.

## 4. Review along three separate axes

Complete the axes as distinct passes. Do not let a passing axis compensate for a failing one, and do not merge their findings into a single score.

### A. Correctness and risk

Look for concrete defects introduced or exposed by the proposed change:

- Incorrect behavior, state transitions, calculations, or control flow.
- Unhandled errors, null/empty/boundary cases, and resource lifecycle failures.
- Security, privacy, authorization, validation, and secret-handling problems.
- Concurrency, ordering, idempotency, transactional, and shutdown problems.
- Compatibility, migration, serialization, and public-contract regressions.
- Broken interactions with relevant callers or dependencies.
- Consequential behavior with no credible test coverage.

A finding must name a plausible execution path or invariant violation and explain its impact. Do not report vague possibilities, generic hardening wishes, or issues unchanged by the review target.

### B. Standards

First enforce documented repository standards. Every hard standards finding must cite the standards file and specific rule. Suppress a generic heuristic when the repository deliberately endorses the pattern. Skip matters that the repository's formatter or linter already enforces unless the proposed result shows the tooling is absent, bypassed, or misconfigured.

Use Matt Pocock's Fowler-based smell baseline as a set of judgment-call heuristics, never hard violations:

- **Mysterious Name:** a name does not reveal what the value or behavior means. Prefer a revealing name; inability to find one may indicate unclear design.
- **Duplicated Code:** the same logic shape appears in multiple changed locations. Consider extracting the shared concept.
- **Feature Envy:** behavior reaches into another object's data more than its own. Consider moving behavior toward the data it uses.
- **Data Clumps:** the same related fields or parameters repeatedly travel together. Consider representing the concept explicitly.
- **Primitive Obsession:** a primitive stands in for a consequential domain concept. Consider a focused type when it would enforce meaning.
- **Repeated Switches:** repeated conditionals branch on the same kind discriminator. Consider centralizing the variation.
- **Shotgun Surgery:** one logical change requires scattered edits because related responsibility is dispersed. Consider gathering what changes together.
- **Divergent Change:** one module changes for several unrelated reasons. Consider separating responsibilities.
- **Speculative Generality:** abstractions, parameters, or hooks serve no current requirement. Remove or inline them until needed.
- **Message Chains:** callers navigate a long internal object path. Hide the navigation behind an appropriate boundary.
- **Middle Man:** a type or function primarily delegates without adding meaning. Consider using the real target directly.
- **Refused Bequest:** an inheritor ignores much of the inherited contract. Prefer a more honest abstraction or composition.

Report a smell only when it is material in this diff. Name the smell, quote or cite the relevant hunk, explain the design pressure, and label it as a judgment call.

### C. Task and specification compliance

Compare the proposed behavior with both the task and its source specification. Report separately:

- Missing or partially implemented acceptance criteria or requirements.
- Behavior that appears implemented but contradicts the requirement.
- Unrequested behavior or scope creep.
- Violations of explicit invariants, exclusions, compatibility promises, or testing decisions.

Every finding must quote or precisely cite the controlling task criterion or specification passage. Do not invent a requirement from personal preference. The ticket owns its narrow slice; use the specification for broader meaning without grading this ticket on behavior assigned to another ticket.

## 5. Verify every candidate finding

Before reporting a finding:

1. Re-read the complete relevant hunk and surrounding implementation.
2. Confirm the cited current file and line location.
3. Confirm the behavior was introduced, changed, or made relevant by the review target.
4. Re-read the controlling standard, task criterion, or specification passage when applicable.
5. Trace enough callers or tests to rule out an existing safeguard.
6. Remove duplicates across axes while retaining the finding under the axis that owns it. Cross-reference rather than rerank when two axes genuinely have distinct concerns.
7. Downgrade or discard claims that remain speculative or unsupported.

Use severity consistently:

- **Critical:** likely data loss, security/privacy failure, broken core behavior, incompatible public behavior, or inability to satisfy the task.
- **Warning:** concrete defect, meaningful regression risk, material standards breach, or partial requirement.
- **Suggestion:** worthwhile non-blocking improvement supported by evidence.

Code-smell findings remain judgment calls regardless of severity.

## 6. Ensure the target did not move

Recompute the review-target fingerprint immediately before reporting. Also recheck `HEAD`, branch, status, and untracked paths.

If anything changed during review, do not present stale conclusions as a completed review. Report that the target moved and ask the user to rerun the skill against the stable state.

## 7. Report without approving

Use this structure and omit empty finding lists only by explicitly saying `No findings`:

```markdown
# Code Review: TASK-012

## Review target

- Task: <id and title>
- Specification: <document id and title>
- Fixed point: <user input> → <resolved base SHA>
- Head: <SHA and branch>
- Proposed state: <committed/staged/unstaged/untracked summary>

## Correctness and risk

### <Severity> — <finding title>
- Location: `path:line`
- Evidence: <specific behavior or execution path>
- Impact: <why it matters>
- Direction: <concise remediation direction, not an implementation patch>

## Standards

### <Severity> — <finding title>
- Location: `path:line`
- Authority: <standards file and rule, or named smell marked judgment call>
- Evidence: <specific conflict>
- Direction: <concise remediation direction>

## Task and specification compliance

### <Severity> — <finding title>
- Location: `path:line`
- Requirement: <quoted task criterion or specification passage>
- Evidence: <missing, incorrect, partial, or extra behavior>
- Direction: <concise remediation direction>

## Summary

- Correctness and risk: <count and worst severity>
- Standards: <count and worst severity>
- Task/specification: <count and worst severity>
- Review target remained unchanged: yes
```

Do not issue an overall pass/fail, merge axis scores, or state that the change is approved. A no-findings report means only that this static review found no supported issue. Findings are review leads for the user to evaluate, and the user alone decides whether to request changes or authorize a commit.
