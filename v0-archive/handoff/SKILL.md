---
name: handoff
description: Compact a long-running conversation into a temporary handoff document so a fresh agent session can continue with the important context, decisions, open questions, and artifact references.
license: MIT (see LICENSE)
disable-model-invocation: true
---

# Handoff

Create a concise continuity document for a fresh agent session. This skill is for long-running conversations such as think tanks, design exploration, and extended decision-making—not for pausing midway through another skill's active workflow.

The handoff is temporary and non-normative. It summarizes the conversation; it does not replace specifications, plans, ADRs, tickets, source files, or other records of authority.

## Boundaries

- Write exactly one handoff Markdown file in the operating system's temporary directory.
- Do not modify the current workspace, source files, project documentation, Backlog tasks, Git state, settings, or durable planning artifacts.
- Do not invoke another skill or continue downstream work.
- Do not create a transcript. Preserve only the context a capable fresh agent needs.
- Do not duplicate material already captured in a specification, plan, ADR, ticket, commit, diff, or other accessible artifact. Reference it by path, ID, or URL and explain its relevance briefly.
- Do not present proposals, guesses, or unresolved ideas as settled decisions.
- Do not claim work, research, validation, or approval that did not occur.
- Redact secrets, credentials, authentication material, private tokens, and unnecessary personally identifiable information. Normalize paths under the user's home directory to `~/...` when practical.
- Do not add a review or approval gate. The handoff is an easily replaced temporary aid, not a source of authority.

## 1. Determine the next-session focus

If the user supplied text after `/skill:handoff`, treat it as the next session's intended focus and tailor the document to it.

If no focus was supplied, infer the most likely continuation goal from the current conversation. Ask a question only when multiple materially different continuation goals remain equally plausible; otherwise choose the narrowest useful focus and disclose it in the handoff.

## 2. Gather continuity context

Reconcile the full available conversation before writing. Capture only what remains useful in a fresh context window:

- The subject, purpose, and desired next-session outcome.
- Settled decisions, constraints, definitions, and explicit exclusions.
- The key reasoning needed to avoid reopening settled ground.
- Material alternatives that were rejected and why, when forgetting them would cause churn.
- Open questions, unresolved risks, missing evidence, and blockers.
- Work already completed and any relevant verification actually performed.
- The exact next action that would move the discussion forward.
- Existing artifacts that hold authoritative or detailed information.

Use read-only inspection only when necessary to identify or accurately reference an artifact already discussed. Do not broaden into new research or resume the underlying work.

## 3. Write the handoff

Use this structure, omitting inapplicable sections except **Suggested skills**, which is always required:

```markdown
# Handoff: <concise subject>

## Next-session objective

<What the fresh session should accomplish.>

## Context

<Minimum background needed to orient without the old conversation.>

## Settled decisions

- <Decision and concise rationale when it matters.>

## Rejected alternatives

- <Alternative> — <why it was rejected.>

## Open questions

- <Unresolved question, risk, blocker, or missing evidence.>

## Completed work

- <What was completed and what evidence supports that claim.>

## Relevant artifacts

- `<path, ID, or URL>` — <why the next agent should read it.>

## Suggested skills

- `/skill:<name>` — <when and why to invoke it in the next session.>

## Recommended next step

<One concrete first action for the fresh session.>
```

Keep the document compact but sufficient. Prefer precise bullets over narrative chronology. Include decision rationale only when it prevents likely re-litigation. If no installed skill is relevant, write `- None.` under **Suggested skills** rather than inventing one.

Do not include the raw conversation, internal reasoning, routine tool output, temporary dead ends, redundant status narration, or large excerpts from referenced artifacts.

## 4. Save outside the workspace

Determine the operating system's temporary directory safely, preferring the environment's standard temp-directory mechanism rather than assuming `/tmp`. Create a unique filename in this form:

```text
pi-handoff-YYYYMMDD-HHMMSS-<short-topic-slug>.md
```

Write the document directly with an available file-writing tool. Do not interpolate the handoff body into a shell command. Ensure the chosen path is outside the current workspace and does not overwrite an existing file.

Read the saved file back and verify that:

- It is understandable without the original conversation.
- Settled, rejected, and unresolved material remain distinct.
- Referenced artifacts are precise enough to locate.
- Sensitive information is absent.
- The next-session objective and first action are explicit.

If writing or verification fails, report the failure and do not fall back to saving inside the workspace.

## 5. Report the continuation instructions

Return:

- The exact absolute handoff path.
- A one-sentence summary of its intended next-session focus.
- An instruction to start a fresh Pi session with `/new` (or start `pi` in the intended working directory from another terminal).
- This ready-to-copy prompt with the actual path substituted:

```text
Read the handoff at <absolute-path> completely, then continue with its next-session objective. Treat referenced artifacts as authoritative over the handoff summary.
```

Remind the user that the OS may eventually clean temporary files. Stop without continuing the underlying conversation or invoking a suggested skill.
