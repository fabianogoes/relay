---
name: relay-setup
description: Use when a repository needs Relay operational memory initialized or updated without replacing its existing agent instructions.
---

# Relay Setup

Execute this skill; do not quote it. Return only a concise result.

Inspect existing `AGENTS.md`, `.specs/`, and `.orchestration/` first. Create
missing `.specs/` and `.orchestration/` directories and these empty files,
each ending with a newline:

- `BACKLOG.md`: `# Backlog`
- `TODO.md`: `# Active task` followed by `No active task.`
- `HANDOFF.md`: `# Handoff` followed by `No active handoff.`
- `CHANGELOG.md`: `# Change log`

Never overwrite populated files. If `AGENTS.md` exists, ensure it ends with a
newline, then append one `## Relay Protocol` section only when absent;
otherwise create `# Agent guidance` followed by the Relay section. The section
must require reading handoff, TODO, backlog, and the referenced spec before
work. When `CLAUDE.md` is absent, create a real symlink with the filesystem
operation `ln -s AGENTS.md CLAUDE.md`; never create a regular file containing
the text `AGENTS.md`. Verify with `readlink CLAUDE.md` and report failure if it
does not return `AGENTS.md`.

Re-read the result, report created paths, and report any inconsistency. On a
second run, create nothing. Do not select work, write a handoff, or modify a
specification.
