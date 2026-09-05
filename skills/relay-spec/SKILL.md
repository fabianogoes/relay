---
name: relay-spec
description: Use when an idea needs structured discovery before it becomes one or more independently selectable Relay backlog tasks.
---

# Relay Specification

Turn an ambiguous request into a reviewable specification and independently
selectable backlog tasks. Read `../../docs/PROTOCOL.md` before writing state.

## Interview

Ask one decision-oriented question at a time. Use the harness's native choice
or question UI when available; provide a recommendation and concise options,
but do not implement a custom interface. Continue until the problem, scope,
non-goals, technical decisions, acceptance criteria, and task boundaries are
clear enough to act on.

Summarize the answers before writing. Ask for confirmation when a material
assumption remains or the proposed backlog boundaries change the user's goal.

## Output

1. Create `.specs/<slug>.md` using the specification template.
2. Append one or more `backlog` entries to `BACKLOG.md`. Each entry must name
   the spec path, deliver an independent outcome, and have its own acceptance
   condition.
3. Report the created spec and backlog IDs.

## Boundary

Do not create TODO items, write `HANDOFF.md`, or implement any backlog task.
The specification session ends after the backlog is durable and reviewed.
