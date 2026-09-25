# Context and Glossary Format

Use existing project conventions when they exist. This reference supplies defaults only.

## Single semantic context

Default to a root `CONTEXT.md`:

```markdown
# Project Language

One or two sentences describing the problem space covered by this vocabulary.

## Language

**Viewer**:
A person who can read a note but cannot modify it. A viewer need not be a workspace member.

**Collaborator**:
A person who can modify a note.
_Avoid_: Viewer, when edit permission is required
```

## Entry rules

- The minimum entry is a term and a discriminating meaning.
- Keep definitions concise, usually one or two sentences.
- Describe domain meaning rather than classes, tables, services, routes, or storage.
- Include behavior when it is what distinguishes the term.
- Include only project-specific concepts that meet the skill's admission policy.
- Group terms under subheadings only when a useful cluster has emerged.

Optional fields:

```markdown
**Share recipient**:
A person accessing a note through a share link rather than workspace membership.
_Aliases_: Link viewer
_Avoid_: Collaborator, because recipients cannot edit
_Example_: A signed-out person opening an unlisted link
_Context_: Sharing
_Status_: Accepted
_Related_: Viewer, Workspace member
```

Do not add optional fields ceremonially. An avoid-list entry should explain a real ambiguity, not enforce stylistic preference.

Accepted terms belong in the normative language section. Keep unaccepted proposals in an audit report unless the user explicitly authorizes a clearly labeled proposal section or artifact.

## Multiple semantic contexts

Use multiple context files only when evidence shows independently meaningful vocabularies or ownership boundaries. If the project already has a context map, follow it. Otherwise a root `CONTEXT-MAP.md` may use:

```markdown
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md): receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md): issues invoices and records payment obligations

## Language relationships

- **Ordering `Customer` → Billing `Account holder`**: the same organization viewed under different responsibilities
- **Ordering `Order accepted` → Billing `Invoice requested`**: translation between domain events at the boundary
```

Do not introduce bounded contexts merely to organize files. Record translations only when differing terms or meanings cross a real boundary.

## Updating entries

- Preserve existing style and placement where practical.
- Change normative meaning only after authorized acceptance.
- When replacing accepted language, preserve deprecation or supersession context if consumers still depend on it.
- Avoid unrelated glossary cleanup during a scoped update.
