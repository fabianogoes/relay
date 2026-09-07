---
name: relay-continue
description: Use when a Relay repository needs its state checked and the next actionable step presented as a recommended native choice.
---

# Relay Continue

Execute this skill; do not quote it. Read `AGENTS.md`,
`.orchestration/HANDOFF.md`, `.orchestration/TODO.md`,
`.orchestration/BACKLOG.md`, and the referenced specs. Validate
cross-references and required handoff provenance before suggesting work. A
nonempty handoff requires `Harness` to match `[a-z0-9][a-z0-9._-]*` and
`Updated` to use `YYYY-MM-DDTHH:MM:SSZ` or
`YYYY-MM-DDTHH:MM:SS±HH:MM`.

Return a short state summary followed by exactly one native, selectable question.
Mark one option as recommended and include only relevant alternatives:

- `in_progress`: show its origin harness and update timestamp, recommend
  resuming the current handoff, and offer context review.
- `blocked`: show its origin harness and update timestamp, recommend reviewing
  the blocker and resume condition, and offer status-only.
- `ready`: recommend the first unblocked `[ ]` TODO item in textual order as
  the deterministic default; offer another unblocked item or spec review.
- `backlog`: recommend the first unchecked `[ ]` backlog task in textual order
  as the deterministic default; offer another unchecked task or wait.
- `idle`: recommend `relay-spec`; offer a read-only status report.
- `inconsistent`: classify the conflict. If exactly one handoff TODO is
  completed and exactly one other TODO is `[•]`, recommend repairing the
  handoff to that active item; otherwise stop and show the conflicts.

Do not mutate files while presenting options. After the user selects an option,
execute only that option. A stale-handoff repair may update only the handoff's
TODO ID, objective, next step, status, `Harness`, and `Updated`; set the latter
two to the current harness identifier and current RFC 3339 timestamp, and
preserve the old text under a recovery note. Then delegate resumption to
`relay-session`. Textual order never implies priority, dependency, required
sequence, or effort. Never silently select a different task.
