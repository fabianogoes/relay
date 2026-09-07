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

Then create `.specs/YYYYMMDD-NNN-<slug>.md`, using today's date and the next
unused three-digit sequence for that date, and append one or more compact
checklist entries to `.orchestration/BACKLOG.md`:

```markdown
- [ ] B-001 - <outcome> (spec: `.specs/20260905-001-<slug>.md`)
```

Keep scope and acceptance condition in the spec. Never renumber an existing
spec. Backlog entries remain independently selectable. Their textual order
provides only a deterministic default recommendation and never represents
priority, a queue, or dependency. Report only the created paths and IDs. Do
not create TODO items, write a handoff, or implement work before the user
chooses the next path.

After reporting the created spec and backlog IDs, ask one final native,
selectable question with these options:

- `Implement the created spec` (recommended when its backlog has actionable work):
  delegate selection and execution to `relay-session`.
- `Create another spec`: start a new specification interview.
- `Stop here`: leave the new backlog entries untouched.

Execute only the selected path; never infer the choice from chat context.
