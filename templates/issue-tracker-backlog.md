# Issue tracker: Backlog.md

Specifications are Backlog.md documents of type `specification`. Implementation tickets are Backlog.md tasks. Use
the `backlog` CLI for every Backlog read and write; do not edit its Markdown files directly.

Before working with Backlog, run `backlog instructions overview`. Before creating or updating tasks, also run
`backlog instructions task-creation`. Respect the project's Backlog configuration, including its storage location,
task ID prefix, defaults, and commit behaviour. Do not make a separate Git commit for a Backlog operation.

If the `backlog` CLI is unavailable or this repo is not initialized, stop and tell the user. Do not run `backlog init`.

## Specifications

- Search for related documents with focused `backlog doc search "<query>"` commands. Read likely matches with
  `backlog doc view <id> --plain`.
- Do not update a document based on a fuzzy search result alone. Update only a document explicitly identified by
  the user or unambiguously identified in the current conversation.
- After the user approves a new spec, run `backlog doc create "<title>" --type specification --plain`. Capture
  both the returned document ID and its file path. Set the full approved body with `backlog doc update <id> --content <markdown>`.
- For an approved update, use `backlog doc update <id>` with the approved changes.
- Verify the saved spec with `backlog doc view <id> --plain`.
- Pass Markdown as a safely quoted argument; never interpolate untrusted or multiline text into an unquoted shell
  command.

## Tickets

- Search for overlapping work before creating tasks. Use `backlog search`, `backlog task list`, and `backlog task view <id> --plain` to inspect likely matches.
- Publish only an approved ticket breakdown. Create tasks in blocker-first order so dependency IDs exist before
  they are referenced.
- Create each ticket with `backlog task create`, its approved title and description, one `--ac` per acceptance
  criterion, `--doc "<spec-file-path>"` when it came from a Backlog spec, and `--dep <blocker-task-id>` for each
  direct blocker.
- `--doc` takes a documentation file path or URL. Use the document path returned by `backlog doc create` or found via
  `backlog doc search`; do not assume its document ID is a file path. Do not assume a fixed Backlog directory or task ID prefix.
- Let Backlog apply the project's default status, assignment, and Definition of Done unless the user approved
  overrides.
- Verify created tasks with `backlog task view <id> --plain` or `--json`. If creation fails partway through,
  report what was already created and stop rather than blindly retrying.

## Fetching work

- To fetch a ticket, use `backlog task view <id> --plain`.
- To fetch a specification document, use `backlog doc view <id> --plain`.
