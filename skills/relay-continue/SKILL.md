---
name: relay-continue
description: Use when a Relay repository needs its state checked and the next actionable step presented as a recommended native choice.
---

# Relay Continue

Execute this skill; do not quote it. Read `AGENTS.md`, `.orchestration/HANDOFF.md`,
`.orchestration/TODO.md`, `.orchestration/BACKLOG.md`, and the referenced specs.
Validate cross-references before suggesting work.

Return a short state summary followed by exactly one native, selectable question.
Mark one option as recommended and include only relevant alternatives:

- `in_progress`: recommend resuming the current handoff; offer context review.
- `blocked`: recommend reviewing the blocker and resume condition; offer status-only.
- `ready`: recommend the first unblocked `[ ]` TODO item; offer spec review.
- `backlog`: recommend the highest-priority unchecked `[ ]` backlog task; offer another task or wait.
- `idle`: recommend `relay-spec`; offer a read-only status report.
- `inconsistent`: classify the conflict. If exactly one handoff TODO is
  completed and exactly one other TODO is `[•]`, recommend repairing the
  handoff to that active item; otherwise stop and show the conflicts.

Do not mutate files while presenting options. After the user selects an option,
execute only that option. A stale-handoff repair may update only the handoff's
TODO ID, objective, next step, status, and date; preserve the old text under a
recovery note. Then delegate resumption to `relay-session`. Never silently
select a different task.
