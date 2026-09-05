---
name: relay-setup
description: Use when a repository needs Relay operational memory initialized or updated without replacing its existing agent instructions.
---

# Relay Setup

Initialize or update a project's Relay protocol. Preserve the repository's
existing guidance; Relay is an appended, delimited section rather than a
replacement for `AGENTS.md`.

## Procedure

1. Inspect `AGENTS.md`, `.specs/`, and `.orchestration/` before changing
   anything. Read `../../docs/PROTOCOL.md` for the canonical formats.
2. Create `.specs/` and `.orchestration/` when missing.
3. Create missing state files using the empty states and headings in the
   protocol. Never overwrite populated state records.
4. If `AGENTS.md` is missing, create it. Otherwise append one `## Relay
   Protocol` section only when it is absent. The section must direct future
   agents to inspect handoff, TODO, backlog, and the source spec before work.
5. If `CLAUDE.md` is absent, create a symbolic link to `AGENTS.md`. Do not
   replace an existing file or link.
6. Re-read the resulting files and report paths created, guidance preserved,
   and any pre-existing inconsistency.

## Idempotence

On a second run, create nothing and do not add a second Relay section. Report
the existing protocol state instead.

## Boundary

Do not select backlog work, write a handoff, or modify a specification. Use
`relay-spec` to create work and `relay-session` to start it.
