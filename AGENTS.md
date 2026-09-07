# Relay Agent Instructions

Relay is a portable operational-memory protocol for coding agents. This
repository develops the Relay package; it is not itself a Relay-managed work
repository, so it has no `.specs/` or `.orchestration/` of its own.

## How to load context

This file is read in full at the start of every session. Everything it names is
read on demand. Do not restate `docs/PROTOCOL.md`, a skill, or an ADR here: a
summary that drifts from its source is worse than a pointer to it.

| Read | When |
| --- | --- |
| `docs/PROTOCOL.md` | Before changing how any skill reads or writes a Relay record. It is the on-disk contract and holds every transition rule and integrity check in full. |
| `skills/relay-*/SKILL.md` | Before changing one skill. Each is under 40 lines; read the one you are changing, not all five. |
| `docs/adr/NNNN-*.md` | Before making or revisiting an architectural decision. Index below. |
| `docs/INSTALL.md` | When changing installation for Claude Code, Codex, or OpenCode. |
| `README.md` | When changing what Relay claims to do or how it is explained. |
| `docs/design-system/` | Before any UI change. The folder carries its own `AGENTS.md` with the reading order and the rule that its `.html` files are never read by an agent; the `relay-design-system` skill carries the same rules and fires on intent. Start at its `README.md`. |

## Architecture decisions

ADRs live in `docs/adr/NNNN-<slug>.md`, numbered sequentially, in the format
Title, Status, Context, Decision, Consequences, Compliance, Notes. Status is
`Proposed`, `Accepted`, or `Superseded`. Never delete a superseded ADR;
supersede it and keep the chain, because the chain is the answer to "why not
the other option?".

Write one when a decision affects structure, an architecture characteristic, a
dependency, an interface, or a construction technique. Record the reasoning,
not only the choice.

- `docs/adr/0001-arquitetura-inicial-da-ui.md` — Accepted — initial UI
  architecture: the `relay-core` / `relay-host` / `relay-ui` boundary over
  loopback HTTP and WebSocket, TypeScript throughout, browser UI with the
  application shell deferred, and the rule that the application never writes a
  protocol record.

## Package boundaries

- `skills/relay-*` is the canonical, shared skill source.
- `docs/PROTOCOL.md` defines the on-disk contract. Change it before changing a
  skill's interpretation of a Relay record, never after. Per-skill
  responsibilities live there and are not repeated here.
- `relay-setup` is idempotent and adds a delimited Relay section to an existing
  `AGENTS.md`; it never replaces local instructions. It generates that section
  itself and does not copy this file.
- Clients and interfaces may read, validate, derive state, and launch a
  harness, but only Relay skills mutate the five protocol records. If a client
  cannot derive a state it needs, change the protocol rather than adding a
  private write.
- `.agents/`, `.claude/`, and `.opencode/plugin/` are tooling for developing
  *this* repository, never package surface: the manifests ship `./skills/` only.

## Development rules

- Keep Relay harness-neutral. Do not require a custom UI or rely on chat memory
  that another harness cannot access.
- Keep statuses in English: `backlog`, `ready`, `in_progress`, `blocked`,
  `done`, and `idle`.
- Do not add a Relay CLI until the Markdown protocol has been validated in real
  repositories.
- Keep installation guidance aligned across Claude Code, Codex, and OpenCode.
- Keep each document in its layer: the contract in `docs/PROTOCOL.md`,
  decisions and their reasoning in `docs/adr/`, exploratory analysis in
  `docs/design-system/`. Do not copy content between layers.
- The package surface is English: `README.md`, `docs/PROTOCOL.md`,
  `docs/INSTALL.md`, and the skills. ADRs and design analysis are currently
  written in Portuguese; keep each document in the language it already uses.
