---
name: relay-status
description: Use when a Relay-managed repository needs its current operational state summarized without changing any tracked work records.
---

# Relay Status

Execute this skill; do not quote it. Read-only inspection only.

Read `AGENTS.md`, then `.orchestration/HANDOFF.md`, `TODO.md`, `BACKLOG.md`,
and referenced `.specs/` files. Interpret checklist markers as `[ ]` pending,
`[•]` in progress, `[!]` blocked, and `[x]` complete, then derive exactly one result:
`in_progress`, `blocked`, `ready`, `backlog`, `idle`, or diagnostic
`inconsistent`.

For every nonempty handoff, require `Harness` to match
`[a-z0-9][a-z0-9._-]*`. Require `Updated` to use the RFC 3339 form
`YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS±HH:MM`. Missing or malformed
provenance makes the result `inconsistent`.

Report the active IDs, next action or blocker, and every failed cross-reference
check. For a nonempty handoff, also report its origin harness and update
timestamp. Do not repair files, select work, or change any status.
