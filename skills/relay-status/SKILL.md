---
name: relay-status
description: Use when a Relay-managed repository needs its current operational state summarized without changing any tracked work records.
---

# Relay Status

Execute this skill; do not quote it. Read-only inspection only.

Read `AGENTS.md`, then `.orchestration/HANDOFF.md`, `TODO.md`, `BACKLOG.md`,
and referenced `.specs/` files. Derive exactly one result:
`in_progress`, `blocked`, `ready`, `backlog`, `idle`, or diagnostic
`inconsistent`.

Report the active IDs, next action or blocker, and every failed cross-reference
check. Do not repair files, select work, or change any status.
