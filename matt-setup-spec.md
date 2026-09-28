# References to `setup-matt-pocock-skills`

Found four references in Markdown files under `skills/`:

- `skills/code-review/SKILL.md:13` — The issue tracker should have been provided to you. If `docs/agents/issue-tracker.md` is missing, tell the user to run `/setup-matt-pocock-skills`.
- `skills/to-spec/SKILL.md:9` — The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.
- `skills/to-tickets/SKILL.md:11` — The issue tracker and triage label vocabulary should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.
- `skills/to-tickets/SKILL.md:60` — Publish the approved tickets. **How** depends on the tracker `/setup-matt-pocock-skills` configured; the tickets are the same either way, only the shape of the blocking edges changes:

# Triage-related references

No instruction to run Matt’s triage skill was found in `skills/`. The triage-related references are:

- `skills/to-spec/SKILL.md:9` — Expects a triage label vocabulary to have been provided by setup.
- `skills/to-spec/SKILL.md:19` — Applies the `ready-for-agent` triage label and says no additional triage is needed.
- `skills/to-tickets/SKILL.md:11` — Expects a triage label vocabulary to have been provided by setup.
- `skills/to-tickets/SKILL.md:63` — Applies the `ready-for-agent` triage label to tickets in a real issue tracker, unless instructed otherwise.
- `skills/to-tickets/SKILL.md:77` — Uses `**Status:** ready-for-agent` in the local ticket template.

# Upstream setup skill: what it does

Source: [Matt Pocock's `setup-matt-pocock-skills` directory](https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills), inspected on 2026-09-18 (repository `main` commit `c55ee46073ed923f86ce59a5eb3b6d895095d1b7`). This is a prompt-driven agent workflow, not a deterministic script. Its purpose is to configure an individual repo for the engineering skills by recording its issue tracker, optional triage label vocabulary, and domain-documentation layout.

## Workflow in `SKILL.md`

1. **Explore the repo.** Inspect Git remotes and `.git/config`; root `AGENTS.md`/`CLAUDE.md` and any existing `## Agent skills` section; root `CONTEXT.md`/`CONTEXT-MAP.md`; root and context-specific ADR directories; previous `docs/agents/` output; `.scratch/`; whether the `triage` skill is installed; and monorepo signals (`pnpm-workspace.yaml`, package workspaces, or populated `packages/*` with `src/`).
2. **Present findings and choose an issue tracker (Section A).** Recommend GitHub for a GitHub remote or GitLab for a GitLab remote. Otherwise, or if preferred, offer GitHub (`gh`), GitLab (`glab`), local Markdown under `.scratch/<feature>/`, or an **Other** workflow supplied by the user in prose. Record the choice in `docs/agents/issue-tracker.md`. GitHub's PR and GitLab's MR triage-surface flags default to **off**; don't ask about them during setup.
3. **Optionally choose triage labels (Section B).** Skip this entirely if the `triage` skill is not installed. Otherwise, recommend the five default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), and ask one question about keeping them. Collect alternate names only if the user declines the defaults. This step records a label mapping; setup does not install triage or create tracker labels.
4. **Choose domain-doc layout (Section C).** Default to a single root `CONTEXT.md` and `docs/adr/` without asking. Offer root `CONTEXT-MAP.md` with per-context `CONTEXT.md` and ADRs only when monorepo signals justify it; then ask which layout to use.
5. **Confirm drafts.** Show the user the proposed `## Agent skills` block and the contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and (only when triage is installed) `docs/agents/triage-labels.md`. Allow edits before writing.
6. **Write the configuration.** Edit existing `CLAUDE.md` if present; otherwise existing `AGENTS.md`; if neither exists, ask which one to create. Add or update (never duplicate) the `## Agent skills` block with pointers to the generated docs. Use the companion templates as seeds for the files under `docs/agents/`; for **Other**, write tracker guidance from the user's description instead. Include the triage sub-block and label-mapping file only when triage is installed. Do not overwrite unrelated user content.
7. **Finish.** Tell the user which engineering skills will read the files and that `docs/agents/*.md` can be edited later. Re-running is suggested for switching trackers or starting setup over.

This setup writes instructions and conventions, not actual tickets or domain documents: it does not create `CONTEXT.md` or ADRs upfront. It is not a script that discovers a tracker and silently configures everything.

## What the companion files do

| File in upstream skill directory | Purpose |
| --- | --- |
| [`issue-tracker-github.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md) | Seed for `docs/agents/issue-tracker.md` when using GitHub. Describes `gh` commands for creating, reading, listing, commenting on, labelling, and closing issues; optional PR triage (off by default); and `/wayfinder` map/child-ticket, dependency, claim, and resolution conventions. |
| [`issue-tracker-gitlab.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/issue-tracker-gitlab.md) | GitLab equivalent using `glab`, with optional MR triage (off by default) and GitLab issue-blocking conventions. |
| [`issue-tracker-local.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md) | Seed for local Markdown tracking: `.scratch/<feature-slug>/spec.md`, one numbered file per ticket under `issues/`, a `Status:` line, appended comments, and `/wayfinder` map and ticket conventions. |
| [`triage-labels.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/triage-labels.md) | Optional seed for `docs/agents/triage-labels.md`. Maps five canonical triage roles to this tracker's actual label strings. Written only when `triage` is installed. |
| [`domain.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/domain.md) | Seed for `docs/agents/domain.md`. Tells skills which `CONTEXT.md` files and ADRs to read, to follow glossary vocabulary, and to flag ADR conflicts. Missing domain docs should be ignored rather than created prematurely. |
| [`agents/openai.yaml`](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/agents/openai.yaml) | Skill display name and description, plus `allow_implicit_invocation: false`; not a generated repo configuration file. |

## Implications for this repo's proposed setup

- **`backlog.md` isn't supported out of the box.** The **Other** tracker choice could describe its workflow in `docs/agents/issue-tracker.md`, but the upstream templates only implement GitHub, GitLab, and `.scratch/` conventions. The copied skills may need their tracker-specific instructions adjusted to work with `backlog.md`.
- **No triage skill creates a mismatch.** Upstream setup omits `docs/agents/triage-labels.md` when `triage` isn't installed. Yet the copied `to-spec` and `to-tickets` skills unconditionally expect a triage label vocabulary and use `ready-for-agent`; the local tracker template also refers to `triage-labels.md`. These references need a decision if triage is omitted.
- **A scripted Pi `/setup-skill` would be a different implementation.** The upstream process relies on repo inspection, recommendations, user choices, and draft approval. A Bash-based alternative would need explicit rules for those decisions and for the files it writes.
