# Relay Interface Redesign

## Objective

Redesign Relay around its core promise: a coding task can stop in one harness and resume in another because operational memory lives in repository files, not in chat history.

The interface is the user's starting point. Harness terminals are execution surfaces launched by Relay rather than the product's primary navigation model.

## Design principle

Treat the handoff as a living document, not as one card among project-management panels. The main view answers three questions in order:

1. Who wrote this handoff, and when?
2. What was being accomplished, and what happens next?
3. In which harness should the user resume it?

Specs, backlog, TODO history, and changelog remain accessible in a secondary “Protocol files” view, but never compete with the handoff on the main screen.

## Information architecture

The Figma deliverable contains these desktop frames:

1. **Resume — in progress:** central handoff with provenance, objective, next step, context, “2 of 4” count, and one primary resume action.
2. **Resume — blocked:** the same hierarchy with an explicit blocked label and the blocking reason before the next step.
3. **Choose:** selectable work for `ready`, `backlog`, and `idle`, without queue positions, FIFO language, or implied ordering.
4. **Repair:** a dedicated inconsistent-state screen showing the conflict, cross-file evidence, deterministic repair, and one repair action. All unrelated navigation and actions are disabled.
5. **Execution — active:** equal 50/50 split between the harness terminal and “This changed on disk,” with live file events and handoff before/after.
6. **Execution — background:** the terminal half explains that the window was closed while the process continues; disk changes remain visible and live.
7. **Execution — reconnected:** both halves show that the running session was recovered without losing its on-disk state.
8. **Preflight:** modal with the executable arguments shown as one `argv` item per line, an independent harness selection, an independent execution-consent choice, and explicit cancel/run actions.
9. **Protocol files:** secondary view for `.specs/`, `BACKLOG.md`, `TODO.md`, `HANDOFF.md`, and `CHANGELOG.md`.

The primary navigation has only two destinations: **Current state** and **Protocol files**. On Repair, both navigation and all unrelated controls are inert.

## Resume view

The handoff occupies the central visual field within a restrained application shell. Provenance is the largest line: “Written in Claude Code · 14 hours ago.” A small, text-labeled status marker appears next to it.

The objective and next step use 14 px body text with comfortable line height. Metadata such as task IDs, repository path, and timestamps uses JetBrains Mono at no less than 12 px. The primary action reads “▶ Resume T-002 in Codex” and is the only filled button.

The active backlog item and TODO count appear as quiet context rather than a pipeline. No percentage, progress bar, track, station, queue number, or FIFO label appears.

## Choose view

This view is selected when the derived state is `ready`, `backlog`, or `idle`. It makes independent tasks browsable and selectable without suggesting a queue.

For `ready`, the current TODO subtasks are presented with textual states such as “Ready,” “Blocked,” and “Done.” For `backlog`, cards show independently selectable backlog tasks and their source spec. For `idle`, the empty state explains that there is no pending work and offers the appropriate creation action.

State is never encoded by color alone. Every marker includes a readable label.

## Repair view

Repair replaces the operational interface rather than overlaying a warning bar. The screen states that Relay will not advance while records disagree, then shows:

- the conflicting references;
- the relevant values from `HANDOFF.md` and `TODO.md`;
- why the correction is deterministic;
- the exact record that will change and the recovery note that will be preserved.

The only primary action is the deterministic repair. A read-only technical detail disclosure may be available, but it cannot start work or bypass the repair.

## Execution view

Execution uses two equal-width regions with equal visual weight.

The left side contains the selected harness terminal, its active skill, current status, and user interaction. The right side is titled “This changed on disk” and shows file writes in real time. It includes a focused before/after comparison for `HANDOFF.md`, plus a chronological list of writes to TODO and CHANGELOG records.

Closing the terminal does not imply stopping the process. The background state says that execution continues and keeps the disk pane live. Reopening shows a “Reconnected” label, the same process identity, and the unchanged file event stream.

## Preflight

Preflight keeps the current confirmation concept but separates three concerns:

1. **Command:** executable and arguments shown as a vertical `argv` list, with one item per row and stable argument indices.
2. **Harness:** an explicit choice among installed harnesses, with unavailable choices disabled and text-labeled.
3. **Consent:** a separate choice for this run, this session, or remembered project-level permission.

The footer contains Cancel and one primary action naming the selected harness. Escape closes the modal, and focus returns to the control that opened it.

## Visual system

The dark visual identity remains, using Space Grotesk for interface text and JetBrains Mono for paths, identifiers, arguments, timestamps, and file diffs.

Color values are represented as named semantic tokens rather than loose literals:

- `surface.canvas`, `surface.shell`, `surface.raised`, `surface.terminal`
- `text.primary`, `text.secondary`, `text.muted`, `text.inverse`
- `border.subtle`, `border.strong`, `focus.ring`
- `status.progress`, `status.blocked`, `status.backlog`, `status.spec`
- `action.primary`, `action.primaryHover`, `action.disabled`

Green communicates progress, amber communicates blocking and inconsistency, blue communicates backlog, and purple communicates specifications. Labels and icons always accompany semantic color.

## Density and accessibility

- Body text: 14 px minimum.
- Metadata: 12 px minimum.
- Section titles: 16 px minimum.
- Primary provenance line: 24–28 px depending on viewport.
- Controls: 32–36 px tall.
- Text and essential metadata meet WCAG AA contrast against their surfaces.
- Every interactive element has a visible focus ring.
- Modal focus is trapped while open; Escape closes it; focus returns to the originating control.
- Disabled controls remain legible and include textual explanation when relevant.

## Responsive behavior

The design targets widths from 1000 to 1600 px without a fixed minimum-width shell.

- From 1280 px upward, the Resume handoff can use a wide editorial measure with contextual metadata beside it.
- Between 1000 and 1279 px, contextual metadata moves below the handoff without reducing body text.
- Execution remains 50/50 across the supported desktop range; each side manages its own scrolling and preserves a usable minimum content width.
- Protocol files use a collapsible file index at narrower widths.

## Figma construction

Create a new Figma design file because no target file was supplied. The file will contain:

- a **Foundations** page with semantic color variables, spacing/radius tokens, and text styles;
- a **Components** page with reusable status labels, buttons, file-event rows, task rows, navigation, and modal controls;
- a **Screens** page containing the nine frames above at a 1440 px reference width;
- a compact responsive example at 1000 px for Resume and Execution.

All major content groups use Auto Layout. Repeated elements are component instances, and semantic colors are bound to variables. Final validation covers hierarchy, font family, contrast intent, clipped text, overlapping content, and the requested states.

## Acceptance criteria

- The handoff provenance is the visually dominant element of Resume.
- Resume has exactly one filled primary action.
- Choose does not imply FIFO or ordering among backlog tasks.
- Repair prevents every action unrelated to restoring consistency.
- Execution gives terminal and disk changes equal width and visual priority.
- Active, background, and reconnected execution states are explicitly represented.
- Preflight renders arguments individually and separates harness selection from consent.
- No percentage progress, pipeline track, station metaphor, or low-contrast essential metadata remains.
- All screens use the defined typography, semantic tokens, text-labeled states, focus behavior, and responsive rules.
