# Relay Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Relay into a version-controlled, portable protocol package with an explicit bootstrap contract and installation documentation for Claude Code, Codex, and OpenCode.

**Architecture:** Version one is prompt-first: harness-native Agent Skills read and update the Markdown protocol files directly. A shared `skills/` source will define the four `relay-*` skills; thin harness adapters will make the package discoverable without duplicating the protocol. A `relay` CLI is deliberately deferred until the file format has been used in real projects.

**Tech Stack:** Markdown, Git, POSIX symbolic links, Agent Skills-compatible `SKILL.md` files.

**Spec:** `README.md`

## Global Constraints

- Use the `relay-setup`, `relay-spec`, `relay-status`, and `relay-session` names exactly.
- Keep statuses in English: `backlog`, `ready`, `in_progress`, `blocked`, `done`, and `idle`.
- Do not create a custom UI; each harness renders progressive questions natively.
- Preserve existing repository guidance when `relay-setup` changes a project's `AGENTS.md`.
- Do not introduce a `relay` CLI in version one.
- Do not create or push a remote GitHub repository without explicit user authorization.

---

### Task 1: Establish repository governance

**Files:**
- Create: `AGENTS.md`
- Create: `CLAUDE.md` (symbolic link to `AGENTS.md`)
- Create: `.gitignore`
- Create: `LICENSE`
- Modify: `README.md`

**Interfaces:**
- Consumes: the protocol described in `README.md`.
- Produces: a harness-neutral repository entry point and the legal/VCS files required to distribute Relay.

- [ ] **Step 1: Create the protocol bootstrap instructions**

Write `AGENTS.md` with the session-entry rules, integrity invariants, and the four skill responsibilities from the README. State that this repository is developing Relay rather than an already-initialized Relay consumer repository.

- [ ] **Step 2: Create the Claude Code compatibility link**

Run `ln -s AGENTS.md CLAUDE.md` after confirming no existing `CLAUDE.md` file or link exists. Verify with `readlink CLAUDE.md`; expected output is `AGENTS.md`.

- [ ] **Step 3: Add distribution housekeeping files**

Create a conservative `.gitignore` for operating-system metadata, editor swap files, local environment files, Python caches, and future build artifacts. Create `LICENSE` using the full MIT license text with copyright holder `Relay contributors` and year `2026`.

- [ ] **Step 4: Make documentation point to the package boundary**

Update the README to identify `skills/` as the canonical source of portable skills and `docs/INSTALL.md` as the installation entry point.

- [ ] **Step 5: Initialize and inspect Git metadata**

Run `git init`, then `git status --short`. Do not commit and do not configure or add a remote.

### Task 2: Define the portable skill package

**Files:**
- Create: `skills/relay-setup/SKILL.md`
- Create: `skills/relay-spec/SKILL.md`
- Create: `skills/relay-status/SKILL.md`
- Create: `skills/relay-session/SKILL.md`
- Create: `docs/PROTOCOL.md`

**Interfaces:**
- Consumes: state files named `.orchestration/BACKLOG.md`, `.orchestration/TODO.md`, `.orchestration/HANDOFF.md`, and `.orchestration/CHANGELOG.md`; source specs in `.specs/`.
- Produces: portable instructions that any Agent Skills-compatible harness can install or adapt.

- [ ] **Step 1: Define stable on-disk record formats**

Write `docs/PROTOCOL.md` with Markdown templates and required fields for specs, backlog tasks, TODO items, handoffs, and changelog entries. Include the exact cross-reference fields needed for the handoff integrity invariant.

- [ ] **Step 2: Write the setup skill**

Create `skills/relay-setup/SKILL.md`. It must inspect existing guidance first, append a clearly delimited Relay section rather than overwrite instructions, create missing directories/files from templates, and be idempotent on re-run.

- [ ] **Step 3: Write the specification skill**

Create `skills/relay-spec/SKILL.md`. It must ask one decision-oriented question at a time using native harness interactions, summarize answers for review, write one spec, and create one or more independent backlog entries without starting implementation.

- [ ] **Step 4: Write the status and session skills**

Create `skills/relay-status/SKILL.md` to report state read-only, including `inconsistent` diagnostics. Create `skills/relay-session/SKILL.md` to follow the startup decision tree and write a handoff only for a valid pending TODO item.

- [ ] **Step 5: Verify skill naming and protocol alignment**

Run `rg -n 'orchestration-(setup|spec|status|session)|relay-' README.md AGENTS.md docs skills`. Expected: no deprecated `orchestration-*` skill names and all four `relay-*` names present. Review every `SKILL.md` against `docs/PROTOCOL.md`.

### Task 3: Add harness installation documentation and adapters

**Files:**
- Create: `docs/INSTALL.md`
- Create: `.claude-plugin/plugin.json`
- Create: `.codex-plugin/plugin.json`
- Create: `.opencode/INSTALL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: canonical skills in `skills/`.
- Produces: documented installation paths and minimal manifests/adapters for the three initial harnesses.

- [ ] **Step 1: Create installer documentation**

Write `docs/INSTALL.md` with separate sections for Claude Code, Codex, and OpenCode. Explain that the final public GitHub URL is required before remote-install commands can be made concrete; document local-path installation for development and the harness's expected skill discovery locations.

- [ ] **Step 2: Create Claude Code plugin metadata**

Create `.claude-plugin/plugin.json` that exposes Relay as a plugin named `relay`, then document how its `skills/` directory is discovered by Claude Code.

- [ ] **Step 3: Create Codex plugin metadata**

Create `.codex-plugin/plugin.json` that exposes Relay as a plugin named `relay`, then document how Codex discovers the plugin and its skills.

- [ ] **Step 4: Create OpenCode installation adapter**

Write `.opencode/INSTALL.md` with a no-copy local development method and an installed method that points OpenCode at the canonical skill directory. Ensure it preserves compatibility with OpenCode's Agent Skills discovery rules.

- [ ] **Step 5: Link the public entry points**

Update `README.md` with an Installation section pointing to `docs/INSTALL.md` and clarify that the manifests do not create a CLI.

### Task 4: Validate the distributable scaffold

**Files:**
- Verify: all files above

**Interfaces:**
- Consumes: the completed repository scaffold.
- Produces: evidence that the working tree is structurally complete and whitespace-clean.

- [ ] **Step 1: Inspect links and manifests**

Run `readlink CLAUDE.md` and inspect both JSON manifests with a JSON parser. Expected: the link resolves to `AGENTS.md` and each manifest parses successfully.

- [ ] **Step 2: Validate protocol completeness**

Run `rg -n 'relay-(setup|spec|status|session)' README.md AGENTS.md docs skills`. Expected: all four skills appear in the README, agent guidance, installation docs, and their individual directories.

- [ ] **Step 3: Check repository state**

Run `git diff --check` and `git status --short`. Expected: no whitespace errors and all newly created files are visible as untracked changes before the first commit.

