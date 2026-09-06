# Relay Interface Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-structured Figma prototype that makes the cross-harness handoff and on-disk memory the dominant Relay experience.

**Architecture:** Create a new Figma design file with separate Foundations, Components, and Screens pages. Bind semantic tokens to reusable components, assemble state-specific screens from those components, then validate every frame structurally and visually at 1440 px and the required 1000 px responsive width.

**Tech Stack:** Figma Design, Figma variables and styles, Figma components and instances, Auto Layout, Figma Plugin API.

**Spec:** `docs/superpowers/specs/2026-09-05-relay-interface-redesign-design.md`

## Global Constraints

- Space Grotesk is the interface typeface; JetBrains Mono is used for paths, identifiers, arguments, timestamps, and diffs.
- Body text is at least 14 px, metadata at least 12 px, section titles at least 16 px, and controls are 32–36 px tall.
- Green means progress, amber means blocking or inconsistency, blue means backlog, and purple means specifications; every state also has a text label.
- Text and essential metadata meet WCAG AA contrast against their surfaces.
- The supported desktop width range is 1000–1600 px, with no fixed minimum-width shell.
- Resume has one filled primary action; Repair disables every unrelated action.
- Execution gives the terminal and on-disk changes equal width and visual weight.
- No percentage progress, pipeline track, station metaphor, FIFO label, or queue position appears.
- Modal Escape behavior and focus return are documented in the prototype annotations.

---

### Task 1: Create the Figma file and semantic foundations

**Files:**
- Create: new Figma design file named `Relay — Operational Memory Redesign`
- Reference: `docs/superpowers/specs/2026-09-05-relay-interface-redesign-design.md`

**Interfaces:**
- Consumes: approved design specification and current HTML prototype.
- Produces: pages named `01 Foundations`, `02 Components`, and `03 Screens`; local variable collection `Relay Semantic`; text styles for UI and mono typography.

- [ ] **Step 1: Create a new Figma design file**

Create the blank file through the Figma integration, then enumerate its pages and top-level nodes before writing anything.

- [ ] **Step 2: Verify the required fonts are available**

Call `figma.listAvailableFontsAsync()` and record the exact family/style pairs for Space Grotesk and JetBrains Mono. Use only returned style names.

- [ ] **Step 3: Create the document pages**

Rename the initial page to `01 Foundations`, then create `02 Components` and `03 Screens`. Return every created or mutated page ID.

- [ ] **Step 4: Create semantic color variables**

Create the `Relay Semantic` collection in dark mode with these variable names:

```text
surface/canvas
surface/shell
surface/raised
surface/terminal
text/primary
text/secondary
text/muted
text/inverse
border/subtle
border/strong
focus/ring
status/progress
status/blocked
status/backlog
status/spec
action/primary
action/primary-hover
action/disabled
```

Set explicit scopes: fill tokens use `FRAME_FILL`, `SHAPE_FILL`, or `TEXT_FILL` as appropriate; border and focus tokens use `STROKE_COLOR`.

- [ ] **Step 5: Create layout variables and text styles**

Create spacing tokens `space/4`, `space/8`, `space/12`, `space/16`, `space/24`, `space/32`, and `space/48`, plus radii `radius/6`, `radius/10`, and `radius/14`. Create UI text styles for metadata 12, body 14, title 16, provenance 26, and button 14; create mono styles for metadata 12, body 14, and diff 13.

- [ ] **Step 6: Validate foundations**

Inspect local collections, variables, and text styles. Confirm every required token exists, scopes are explicit, and every text style uses the approved font family.

---

### Task 2: Build reusable operational components

**Files:**
- Modify: Figma page `02 Components`

**Interfaces:**
- Consumes: `Relay Semantic` variables and typography styles from Task 1.
- Produces: components `App/Header`, `Nav/Primary`, `Status/Label`, `Button/Primary`, `Button/Secondary`, `Handoff/Document`, `Task/Selectable`, `File/Event`, `Diff/Handoff`, `Argv/Row`, `Harness/Choice`, and `Consent/Choice`.

- [ ] **Step 1: Create the shell components**

Build `App/Header` and `Nav/Primary` with Auto Layout. Navigation has only `Current state` and `Protocol files`, plus a disabled variant used by Repair.

- [ ] **Step 2: Create status and action components**

Create labeled variants for `in progress`, `blocked`, `ready`, `backlog`, `idle`, `inconsistent`, `running in background`, and `reconnected`. Create primary and secondary button components at 36 px height with visible focus variants.

- [ ] **Step 3: Create the handoff document component**

Build a vertical component whose provenance is the first and largest content. Expose text properties for status, provenance, IDs, objective, next step, context, task count, and resume action label. Create progress and blocked variants.

- [ ] **Step 4: Create selection and disk-evidence components**

Build `Task/Selectable`, `File/Event`, and `Diff/Handoff`. Task rows expose a textual status and never include queue position. File events expose sign, filename, timestamp, and description. The diff component has explicit Before and After columns.

- [ ] **Step 5: Create preflight controls**

Build `Argv/Row` with argument index and one argument value, plus separate `Harness/Choice` and `Consent/Choice` components with selected, unselected, disabled, and focused variants.

- [ ] **Step 6: Validate components**

Screenshot every component group and inspect the component metadata. Confirm repeated elements are components, text properties are exposed, color fills are variable-bound, controls are 32–36 px tall, and no text is cropped.

---

### Task 3: Compose Resume, Choose, and Repair screens

**Files:**
- Modify: Figma page `03 Screens`

**Interfaces:**
- Consumes: shell, navigation, status, button, handoff, and task components from Task 2.
- Produces: frames `Resume / In progress / 1440`, `Resume / Blocked / 1440`, `Choose / Ready / 1440`, `Choose / Backlog / 1440`, `Choose / Idle / 1440`, and `Repair / Inconsistent / 1440`.

- [ ] **Step 1: Build the Resume skeleton**

Create a 1440 px frame using Auto Layout for the header, two-item navigation, and centered content region. Keep the editorial handoff measure between 760 and 880 px.

- [ ] **Step 2: Populate Resume in-progress**

Place the handoff with “Written in Claude Code · 14 hours ago” as the largest line, `B-002 / T-002`, objective, next step, context, `2 of 4 subtasks`, and exactly one filled button labeled `▶ Resume T-002 in Codex`. Add `Protocol files` only as secondary navigation.

- [ ] **Step 3: Derive Resume blocked**

Create a separate blocked frame. Show the `Blocked` label and blocking reason before the next step. Preserve the same hierarchy and one primary resume action.

- [ ] **Step 4: Build Choose states**

Create Ready, Backlog, and Idle frames. Ready shows independently selectable TODO subtasks; Backlog shows independently selectable backlog tasks with their source spec; Idle explains that no work is pending. Remove all FIFO, queue-position, track, station, and percentage concepts.

- [ ] **Step 5: Build the blocking Repair screen**

Create a dedicated amber-accented screen showing the `HANDOFF.md` versus `TODO.md` conflict, the deterministic choice of T-002, the exact repair, and the preserved recovery note. Use disabled navigation and make `Repair handoff to T-002` the only enabled operational action.

- [ ] **Step 6: Validate state screens**

Screenshot each frame separately. Confirm Resume provenance is visually dominant, Resume has exactly one filled primary action, Choose has no ordering cues, Repair exposes no bypass, all state markers include text, and essential metadata is legible at 12 px or larger.

---

### Task 4: Compose Execution, Preflight, and Protocol Files

**Files:**
- Modify: Figma page `03 Screens`

**Interfaces:**
- Consumes: all reusable components from Task 2.
- Produces: frames `Execution / Active / 1440`, `Execution / Background / 1440`, `Execution / Reconnected / 1440`, `Preflight / 1440`, and `Protocol files / 1440`.

- [ ] **Step 1: Build Execution active**

Create a frame with two equal-width panes. The left pane is the Codex terminal with active skill and user interaction. The right pane is headed `THIS CHANGED ON DISK`, shows live file events, and includes a prominent `HANDOFF.md` before/after diff.

- [ ] **Step 2: Build Execution background**

Create a frame where the left pane states `Running in background` and explains that closing the terminal did not stop the process. Keep the right disk pane live and visually unchanged in weight.

- [ ] **Step 3: Build Execution reconnected**

Create a frame with a `Reconnected` label, the same execution identity, terminal context, and continuous disk event stream.

- [ ] **Step 4: Build Preflight**

Create the modal over a dimmed Resume screen. Render the executable and arguments as indexed rows:

```text
[0] codex
[1] exec
[2] --skill
[3] relay-session
[4] Resume T-002 according to the handoff
```

Place harness selection and consent in separate labeled sections. Annotate: `Escape closes modal; focus returns to Resume button.`

- [ ] **Step 5: Build Protocol files**

Create the secondary view with a file index for `.specs/`, `BACKLOG.md`, `TODO.md`, `HANDOFF.md`, and `CHANGELOG.md`, plus a readable file-content pane. Keep it useful but visually quieter than Resume.

- [ ] **Step 6: Validate execution and secondary flows**

Confirm the execution divider is centered, both panes have equal computed width, every execution state has a textual label, the disk pane remains prominent in all three states, argv values are separate rows, and harness/consent are independent groups.

---

### Task 5: Add responsive examples and complete visual QA

**Files:**
- Modify: Figma page `03 Screens`

**Interfaces:**
- Consumes: completed 1440 px screens from Tasks 3 and 4.
- Produces: frames `Resume / In progress / 1000` and `Execution / Active / 1000`; final verified Figma deliverable.

- [ ] **Step 1: Compose the 1000 px Resume example**

Move contextual metadata below the handoff while preserving 14 px body text, 12 px metadata, and the single primary action. Do not introduce horizontal scrolling.

- [ ] **Step 2: Compose the 1000 px Execution example**

Preserve the 50/50 pane split, independent pane scrolling, the terminal's usable command measure, and the complete disk evidence hierarchy.

- [ ] **Step 3: Run the structural audit**

Inspect page and frame metadata. Confirm every required screen exists, top-level frames do not overlap, repeated patterns use instances, major groups use Auto Layout, and no finished placeholder shimmer remains.

- [ ] **Step 4: Run the typography and accessibility audit**

Read back every text node's font family and size. Confirm Space Grotesk and JetBrains Mono are used as specified; body, metadata, title, provenance, and control dimensions meet the global constraints; state meaning is never color-only.

- [ ] **Step 5: Run the visual audit**

Capture the full Screens page plus individual screenshots for Resume, Repair, Execution active, Preflight, and both 1000 px frames. Check for clipping, overlaps, low-contrast essential text, unequal execution panes, unintended primary buttons, and residual dashboard metaphors.

- [ ] **Step 6: Apply targeted fixes and revalidate**

Modify only failed nodes, return every mutated node ID, and repeat the specific metadata or screenshot check that exposed each failure.

- [ ] **Step 7: Deliver the Figma file**

Provide the Figma file link and summarize the screen inventory, responsive examples, tokens, components, and validation completed.
