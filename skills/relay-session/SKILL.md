---
name: relay-session
description: Use at the beginning of an implementation session in a Relay-managed repository or when resuming work across coding harnesses.
---

# Relay Session

Execute this skill; do not quote it. Read state, then act only when the user
requests implementation.

Read `AGENTS.md`, handoff, TODO, backlog, and referenced specs. If references
disagree, or a nonempty handoff has missing or malformed `Harness` or `Updated`
provenance, report `inconsistent` and stop; tell the user to run
`relay-continue` for a deterministic stale-handoff recovery when applicable.
Otherwise:

- valid handoff: resume it (`in_progress` or `blocked`);
- empty handoff with an available TODO item: report `ready`, honor an
  explicitly selected available item, or use the first available item in
  textual order as the deterministic default; then change it to `[•]` and write
  one valid `in_progress` handoff before editing;
- empty TODO with pending backlog: report `backlog` and wait for selection;
- no pending work: report `idle`.

An item is available when it is `[ ]` and every ID in its `needs` is `[x]`.
TODO textual order never implies priority, dependency, required sequence, or
effort, and the user may select any available item. Every creation or
mutation of a nonempty handoff must set `Harness` to the stable lowercase
identifier of the current harness, matching `[a-z0-9][a-z0-9._-]*`, and
`Updated` to the current RFC 3339 timestamp in
`YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS±HH:MM` form. Update both fields
together; do not infer them from filesystem metadata.

When a subtask finishes, append changelog evidence, mark its TODO item `[x]`,
clear handoff, and clear TODO only after all its items finish. Set `[!]` and a
blocked handoff with current provenance when work cannot continue. Do not
silently pick backlog work.
