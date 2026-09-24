---
name: grill-with-docs
description: A user-invoked structured interview that sharpens a plan or design and, after confirmation, maintains accepted domain vocabulary and qualifying ADRs.
disable-model-invocation: true
---

# Grill With Docs

Before proceeding, read both dependencies completely:

- [the grilling skill](../grilling/SKILL.md)
- [the domain-lang skill](../domain-lang/SKILL.md)

Apply them as one composed workflow. Grilling owns the interview protocol, decision ledger, shared-understanding summary, and confirmation gate. Domain-lang owns semantic detection, classification, and persistence. Follow domain-lang's **Integration with Grilling** section, including its requirement for one question stream rather than a second semantic interview.

Invoking this wrapper explicitly authorizes domain-lang **Maintain** mode, limited to accepted domain vocabulary and accepted decisions from this session that satisfy domain-lang's ADR threshold. Stage prospective artifact changes in the shared ledger during the interview and persist them only after the user confirms shared understanding. If the interview ends without confirmation, do not write them.

This authorization does not cover proposed or unresolved language, implementation details in the glossary, specifications, implementation, broad renaming, migrations, compatibility breaks, architecture redesign, or unrelated cleanup. A session with nothing that qualifies should make no artifact changes.

If either dependency cannot be read, stop and report the missing dependency rather than improvising a partial workflow.
