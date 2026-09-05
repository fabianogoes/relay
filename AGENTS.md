# Relay Agent Instructions

Relay is a portable operational-memory protocol for coding agents. This
repository develops the Relay package; it is not itself a Relay-managed work
repository yet.

## Session entry

When working in a Relay-managed repository, read these files before making a
plan or editing code:

1. `AGENTS.md`
2. `.orchestration/HANDOFF.md`
3. `.orchestration/TODO.md`
4. `.orchestration/BACKLOG.md`
5. The source spec named by the active record in `.specs/`

Derive the state from the files, rather than chat history:

- A valid handoff means `in_progress` or `blocked`: resume it before selecting
  different work.
- Pending TODO items with an empty handoff mean `ready`: select one only when
  implementation is requested, then write a valid handoff.
- No active TODO and pending backlog mean `backlog`: suggest a task or wait
  for a selection.
- No pending work means `idle`.
- Broken references or contradictory records are `inconsistent`, a diagnostic
  rather than a work status. Explain the defect and do not advance the flow.

## Integrity rules

- `HANDOFF.md` names exactly one pending TODO item, its parent backlog task,
  and its source spec.
- Finish in this order: append evidence to `CHANGELOG.md`, mark the TODO item
  `done`, then clear `HANDOFF.md`.
- Clear `TODO.md` only after every item for its parent backlog task is done;
  then mark that backlog task `done`.
- Preserve specifications and backlog records after a session is complete.

## Package boundaries

- `skills/relay-*` is the canonical, shared skill source.
- `docs/PROTOCOL.md` defines the on-disk contract. Change it before changing
  a skill's interpretation of a Relay record.
- `relay-setup` is idempotent and adds a delimited Relay section to an
  existing `AGENTS.md`; it never replaces local instructions.
- `relay-spec` can create one specification and one or more backlog tasks. It
  does not start implementation.
- `relay-status` is read-only.
- `relay-session` enforces the session-entry rules above.

## Development rules

- Keep Relay harness-neutral. Do not require a custom UI or rely on chat
  memory that another harness cannot access.
- Keep statuses in English: `backlog`, `ready`, `in_progress`, `blocked`,
  `done`, and `idle`.
- Do not add a Relay CLI until the Markdown protocol has been validated in
  real repositories.
- Keep installation guidance aligned across Claude Code, Codex, and OpenCode.
