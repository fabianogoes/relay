---
name: relay-session
description: Use at the beginning of an implementation session in a Relay-managed repository or when resuming work across coding harnesses.
---

# Relay Session

Execute this skill; do not quote it. Read state, then act only when the user
requests implementation.

Read `AGENTS.md`, handoff, TODO, backlog, and referenced specs. If references
disagree, report `inconsistent` and stop. Otherwise:

- valid handoff: resume it (`in_progress` or `blocked`);
- empty handoff with an unchecked TODO item: report `ready`, then write one valid
  `in_progress` handoff before editing;
- empty TODO with pending backlog: report `backlog` and wait for selection;
- no pending work: report `idle`.

When a subtask finishes, append changelog evidence, mark its TODO item
`Status: done` and `[x]`, clear handoff, and clear TODO only after all its
items finish. Do not silently pick backlog work.
