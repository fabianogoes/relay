# Relay Protocol

This document is the version-one on-disk contract. Relay keeps durable intent
and execution state in Markdown so different harnesses can read the same work
without shared chat history.

## Files and ownership

| Path | Purpose | Mutation rule |
| --- | --- | --- |
| `.specs/S-001-<slug>.md` | Detailed intent and acceptance | Created by `relay-spec`; updated only when the specification changes. |
| `.orchestration/BACKLOG.md` | Independently selectable work | Append checklist tasks from a spec; mark a task `done` only when its TODO is complete. |
| `.orchestration/TODO.md` | Current task's executable subtasks | Replaced when a backlog task is selected; cleared only when every item is `done`. |
| `.orchestration/HANDOFF.md` | Exactly one current or resumable subtask | Written before work starts; cleared after the completion record exists. |
| `.orchestration/CHANGELOG.md` | Completed work and evidence | Append-only. |

## Allowed statuses

`backlog`, `ready`, `in_progress`, `blocked`, `done`, and `idle` are English
status values. `inconsistent` is a derived diagnostic and must not be written
as a work status.

## Specification template

```markdown
# S-001 - <Specification title>

## Problem
<Who needs what and why.>

## Scope
<Included behavior and technical constraints.>

## Non-goals
<Explicit exclusions.>

## Decisions
<Decision, rationale, and alternatives rejected.>

## Acceptance criteria
- [ ] <Observable result>

## Backlog candidates
- B-001: <Independent outcome>
- B-002: <Another independent outcome>
```

## Backlog template

```markdown
# Backlog

- [ ] B-001 - <Independent outcome> (spec: `.specs/S-001-<slug>.md`)
- [ ] B-002 - <Another independent outcome> (spec: `.specs/S-001-<slug>.md`)
```

Use `[ ]` for `backlog` and `[x]` for `done`. Keep outcome and acceptance
details in the source spec; each entry must remain independently selectable and
point to exactly one spec.

## TODO template

```markdown
# Active task: B-001

- [ ] T-001 - <Small executable outcome>
- [•] T-002 - <Current executable outcome>
- [!] T-003 - <Blocked executable outcome>
- [x] T-004 - <Completed executable outcome>
```

When there is no selected task, use this exact empty state:

```markdown
# Active task

No active task.
```

## Handoff template

```markdown
# Handoff

- Status: in_progress
- Backlog: B-001
- TODO: T-001
- Spec: .specs/S-001-<slug>.md
- Updated: 2026-09-05

## Objective
<What this subtask must achieve.>

## Next step
<The next concrete action.>

## Context
<Decisions, files inspected, command output, or blocker details needed to resume.>
```

Use `Status: blocked` only when `Context` states the blocker and the condition
needed to resume. An empty handoff is:

```markdown
# Handoff

No active handoff.
```

## Changelog template

```markdown
# Change log

## 2026-09-05 - T-001 - <Subtask title>
- Backlog: B-001
- Spec: .specs/S-001-<slug>.md
- Result: <What changed.>
- Evidence: <Test, inspection, commit, or other verifiable result.>
- Decisions: <Decision retained for future sessions, or none.>
```

## Transition rules

1. `relay-spec` writes one spec and one or more `backlog` entries.
2. Selecting a backlog checklist item creates its `TODO.md` with compact
   checklist subtasks.
3. Before a subtask begins, write a handoff referencing the TODO ID, backlog
   ID, and spec path; the session is then `in_progress`.
4. To complete a subtask, append its changelog record, set its TODO marker to
   `[x]`, then clear the handoff.
5. After all TODO items are `done`, mark the backlog task `done` and replace
   TODO with its empty state.

## Integrity checks

Treat the state as `inconsistent` when any condition below fails:

- A nonempty handoff does not name one pending TODO item.
- Handoff, TODO, and backlog records do not agree on the same backlog ID.
- The handoff's spec path is missing or differs from the task's spec path.
- More than one current handoff record exists.
- A TODO item is removed from handoff before its completed result is appended
  to the changelog.
- A backlog task is `done` while an active TODO item for it is not `done`.
- A checklist item uses an unknown marker, or a completed item is not `[x]`.
