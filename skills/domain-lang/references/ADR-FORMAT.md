# Language Decision ADR Format

Follow existing repository ADR conventions when present. This reference supplies a compact fallback only.

## Eligibility

Propose an ADR only when the decision is simultaneously:

1. Hard to reverse
2. Surprising without context
3. The result of a genuine trade-off

Passing the threshold permits a proposal, not file creation. The decision must be accepted and persistence authorized first.

## Default location and numbering

If the repository has no ADR convention, use `docs/adr/` and sequential filenames:

```text
0001-distinguish-viewers-from-collaborators.md
0002-ordering-owns-customer-order-status.md
```

Scan existing ADR filenames for the highest number and increment it. Create the directory lazily.

## Compact template

```markdown
# Distinguish viewers from collaborators

We use “viewer” for a person with read-only note access and “collaborator” only for a person who can modify the note. We chose separate terms because permissions and audit behavior differ, even though both can access note content.
```

Most language ADRs need only a title and one short paragraph covering context, decision, and reasoning.

## Optional information

Add only when it preserves material context:

- Status: proposed, accepted, deprecated, or superseded
- Considered alternatives
- Non-obvious consequences
- Boundary or owner
- Superseding ADR reference

Do not use an ADR for a glossary definition alone, an obvious consequence, a reversible naming preference, or a decision without meaningful alternatives.
