---
name: relay-session
description: Use at the beginning of an implementation session in a Relay-managed repository or when resuming work across coding harnesses.
---

# Relay Session

Execute this skill; do not quote it. Read state, then act only when the user
requests implementation.

Read `AGENTS.md`, handoff, TODO, backlog, and referenced specs. If references
disagree, or a nonempty handoff has missing or malformed provenance, report
`inconsistent` and stop, pointing to `relay-continue` for a deterministic
stale-handoff recovery when applicable. Otherwise:

- valid handoff: resume it (`in_progress` or `blocked`);
- empty handoff with an available TODO item: report `ready`, honor an
  explicitly selected available item, or use the first available item in
  textual order as the deterministic default; then change it to `[•]` and write
  one valid `in_progress` handoff before editing;
- empty TODO with pending backlog: report `backlog` and wait for selection;
- no pending work: report `idle`.

An item is available when it is `[ ]` and every ID in its `needs` is `[x]`.
TODO order never implies priority, dependency, sequence, or effort, and the user
may select any available item. Every creation or mutation of a nonempty handoff
sets `Harness` to the current harness as a stable lowercase identifier matching
`[a-z0-9][a-z0-9._-]*`, and `Updated` to the current RFC 3339 timestamp in
`YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS±HH:MM` form. Update both fields
together; do not infer them from filesystem metadata.

When a subtask finishes, append its changelog record with `Criteria` naming the
acceptance criteria it advanced, or `none` when truthful, mark its TODO item
`[x]`, clear handoff, and clear TODO only after all its items finish. Before
marking the last pending backlog entry of a spec `done`, confirm every criterion
of that spec is named by some changelog record; when one is not, leave the entry
pending with `[!]` and a blocked handoff naming what is missing. Set `[!]` and a
blocked handoff with current provenance whenever work cannot continue. Do not
silently pick backlog work.
