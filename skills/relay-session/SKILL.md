---
name: relay-session
description: Use at the beginning of an implementation session in a Relay-managed repository or when resuming work across coding harnesses.
---

# Relay Session

Resume or prepare the next implementation action from repository state, not
from prior conversation. Read `../../docs/PROTOCOL.md` before mutating records.

## Startup decision

1. Read `AGENTS.md`, handoff, TODO, backlog, and referenced specs.
2. If integrity fails, report `inconsistent` and stop.
3. If handoff is valid, report its task and resume its stated next step.
4. If handoff is empty and TODO has pending subtasks, report `ready`. When
   implementation is requested, select the next unblocked subtask and write a
   valid `in_progress` handoff before editing implementation files.
5. If TODO is empty and backlog has pending entries, report `backlog` and
   suggest a bounded task or wait for the user to select one.
6. Otherwise report `idle`.

## Completion discipline

For a completed subtask, append the changelog entry with evidence, mark the
TODO item `done`, then clear handoff. Do not clear TODO until every subtask is
done; only then mark the parent backlog task `done`.

## Boundary

Do not silently choose a backlog task when the user has not asked to start
work. Use `relay-status` when only a read-only diagnosis is requested.
