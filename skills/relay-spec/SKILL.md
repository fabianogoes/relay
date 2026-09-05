---
name: relay-spec
description: Use when an idea needs structured discovery before it becomes one or more independently selectable Relay backlog tasks.
---

# Relay Specification

Execute this skill; do not quote it. Ask one decision-oriented question at a
time using the harness's native interaction. Include a recommendation and
short selectable options when useful; never build a custom UI.

Resolve problem, scope, non-goals, decisions, acceptance criteria, and
independent task boundaries. Summarize the answers and get confirmation before
writing when a material assumption remains.

Then create `.specs/S-NNN-<slug>.md`, using the next unused sequential spec ID,
and append one or more compact checklist entries to `.orchestration/BACKLOG.md`:

```markdown
- [ ] B-001 - <outcome> (spec: `.specs/S-001-<slug>.md`)
```

Keep scope and acceptance condition in the spec. Never renumber an existing
spec. Report only the created
paths and IDs. Do not create TODO items, write a handoff, or implement work.
