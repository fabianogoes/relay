---
name: relay-design-system
description: Use before changing any Relay interface - a design token, colour, spacing, typography, component, layout, screen, or any visual decision. Loads the design system's reading order and its authority rules. Also use when asked where a UI decision is recorded, or why the interface looks the way it does.
---

# Relay design system

The design system lives in `docs/design-system/`. This skill says what to read
and in what order; it does not restate the tokens.

## Reading order

1. **`docs/design-system/README.md`** - the authority. Tokens, components, and
   the rules that govern them. Read it before any interface change.
2. **`docs/adr/0001-arquitetura-inicial-da-ui.md`** - the architecture that
   frames the UI: the `relay-core` / `relay-host` / `relay-ui` boundary, and
   the rule that the application never writes a protocol record. Read it when
   the change touches structure rather than surface.
3. **`docs/design-system/ui-proposal.md`** - the exploratory analysis and the
   alternatives that were discarded. Read it **only** when the decision you
   need is in neither of the above. It is ~25 KB.

## Never read the HTML

The folder's `.html` files are browser artifacts, not agent input. The
prototypes are ~350 KB each and would consume most of a context window.
Nothing in them is unrecorded: what was **decided** is in ADR-0001, what was
merely **observed** is in `ui-proposal.md`, and the tokens are in the README.

A `PreToolUse` guard (`.agents/hooks/deny-design-system-html.sh`) denies those
reads in Claude Code and OpenCode. If you hit that denial, you asked for the
wrong file - go to the README.

## Order of change

A token or component changes **first** in `docs/design-system/README.md`, then
in code. A prototype does not become a token by existing; it enters the README
by decision. The folder's `design-system.html` is derived from the README - when
you change a token, update that file in the same change, and never treat it as
the source.

The README wins over prototypes and over code. Full governance rules are in its
section 9.
