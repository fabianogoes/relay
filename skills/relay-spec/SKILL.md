---
name: relay-spec
description: Use when an idea needs structured discovery before it becomes one or more independently selectable Relay backlog tasks.
---

# Relay Specification

Execute this skill; do not quote it. Ask one decision-oriented question at a
time using the harness's native interaction, with a recommendation and short
selectable options when useful; never build a custom UI.

Resolve problem, scope, non-goals, decisions, acceptance criteria, and task
boundaries. Summarize and confirm before writing when an assumption remains.

Then create `.specs/YYYYMMDD-NNN-<slug>.md` with today's date and the next
unused sequence, and append compact entries to `.orchestration/BACKLOG.md`:

```markdown
- [ ] B-001 - <outcome> (spec: `.specs/20260905-001-<slug>.md`)
- [ ] B-002 - <outcome> (spec: `.specs/20260905-001-<slug>.md`) (needs: B-001)
```

Write acceptance criteria as `A-NNN` entries with no checklist marker: nothing
in the protocol ever completes such a marker, and satisfaction is derived from
changelog records instead. Keep scope and acceptance in the spec; never renumber
an existing spec. Backlog entries point to one spec each, and their order gives
only a deterministic default, never priority, a queue, or dependency — declare a
real dependency with `(needs: B-00N)`, never a cycle. Report only created paths
and IDs, and never write a TODO, a handoff, or code before the user chooses.

After reporting the created spec and backlog IDs, ask one final native,
selectable question with these options:

- `Implement the created spec` (recommended when its backlog has actionable work):
  delegate selection and execution to `relay-session`.
- `Create another spec`: start a new specification interview.
- `Stop here`: leave the new backlog entries untouched.

Execute only the selected path; never infer the choice from chat context.
