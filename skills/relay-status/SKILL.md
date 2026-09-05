---
name: relay-status
description: Use when a Relay-managed repository needs its current operational state summarized without changing any tracked work records.
---

# Relay Status

Read and validate Relay state without mutation. Read `../../docs/PROTOCOL.md`
before interpreting records.

## Read order

Read `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `BACKLOG.md`, and only the source
specs referenced by active records. Do not infer state from chat history.

## Report

State exactly one of `in_progress`, `blocked`, `ready`, `backlog`, `idle`, or
the diagnostic `inconsistent`, then report:

- the active backlog, TODO, and spec IDs when present;
- the next action or the blocker;
- any failed integrity check with the conflicting paths and IDs.

## Boundary

Do not repair files, select work, clear handoff, or alter statuses. Use
`relay-session` or an explicit user instruction for mutations.
