# Monday.com Replacement Trial Plan

## Context

Question from leadership: could we build core Monday.com functionality into DATA_WORKSHOP to eliminate the licence cost (8 seats)?

Rather than committing to a full replacement, we're running a **time-boxed trial** to answer: *"Is building and maintaining our own board tool cheaper and sustainable enough to justify dropping Monday.com?"*

## What We're Replacing

The team's actual Monday.com usage is narrow:

- Moving items between sprint groups (drag-and-drop)
- Updating statuses throughout the day
- Filtering/viewing items (by owner, by status, by team)

No external stakeholders depend on the board. No automations, integrations, or reporting tools pull from it.

## V1 Scope

### Data Layer (Supabase)

- `boards` table — name, owner, created_at
- `groups` table — name, board_id, position (ordering)
- `items` table — name, description, status, priority, type, team, estimate, dependencies, issue_description, owner, due_date, group_id, position
- Foreign keys and indexes for performant filtering

### UI

- Board view: groups displayed as collapsible sections with items listed inside
- Drag-and-drop: move items between groups (sprint planning) and reorder within groups
- Inline editing: click to edit status, priority, owner, estimate, due date
- Filters: by owner, status, team (minimum)
- Multi-board support: board selector, ability to create new boards and groups

### API Routes

- CRUD for boards, groups, and items
- Reorder endpoints (update position within/across groups)
- Filter/query endpoint

### What V1 Deliberately Excludes

- Real-time sync (polling on refresh is fine for 8 users)
- Comments/activity threads on items
- Notifications (email, Slack, etc.)
- Calendar or timeline views
- Automations (e.g. "when status = Done, do X")
- Mobile-optimised layout
- Undo/redo
- Keyboard shortcuts
- Import/export

## Trial Structure

### Duration

6 weeks from launch of V1.

### Setup

- Run the custom board **in parallel** with Monday.com — do not cancel seats during the trial
- Team uses the custom board as their primary tool, with Monday.com as fallback
- All 8 analysts participate

### What We're Measuring

| Metric | How to measure |
|---|---|
| **Adoption** | Did all 8 analysts use it daily? Did anyone quietly revert to Monday.com? |
| **Maintenance cost** | Weekly log: hours spent fixing bugs, handling requests, tweaking UI |
| **Feature gap pain** | What did the team miss most? Tolerable or blocker? |
| **Additional features needed** | Features we realised we'd need to build as standard (see below) |
| **Cost comparison** | Total hours (build + maintain) x internal cost rate vs Monday.com seats saved |

### Weekly Log Template

```
Week [N] — w/c [date]
- Bugs fixed: [list]
- Feature requests received: [list]
- Hours spent on maintenance: [X]
- Team sentiment (1-5): [X]
- Notes: [anything notable]
```

### Additional Features Identified During Trial

| Feature | Requested by | Priority (blocker / nice-to-have) | Estimated effort | Notes |
|---|---|---|---|---|
| | | | | |

### Success Criteria

At the end of 6 weeks, answer these questions:

1. **Did the team actually adopt it?** If fewer than 6/8 analysts used it consistently, it's a no.
2. **Was maintenance sustainable?** If maintenance exceeded ~3 hours/week on average, the cost equation probably doesn't work for a solo/small team.
3. **Is the feature gap tolerable?** Review the "Additional Features" table. If there are blockers, estimate the cost to build them and add to the total.
4. **Does the maths work?** Compare: `(build hours + 6 weeks maintenance hours + estimated feature backlog hours) x internal hourly rate` vs `8 seats x annual Monday.com cost`. Include ongoing projected maintenance in the annual comparison.

### Decision

- **Continue**: Maths works, team adopted it, maintenance is sustainable → cancel Monday.com seats, commit to ongoing development
- **Revert**: Adoption was low, maintenance was heavy, or feature gaps are blockers → stay on Monday.com, keep DATA_WORKSHOP as the intake layer only
- **Revisit later**: Promising but team isn't ready yet (e.g. waiting for more developers) → pause and re-evaluate when the team grows

## Key Risks

| Risk | Mitigation |
|---|---|
| Solo developer maintenance burden | Run as a trial with Monday.com fallback; don't commit until team capacity exists |
| Team rejects rougher UI | Set expectations upfront — this is a V1 test, not a polished product |
| Scope creep during trial | V1 scope is locked; new requests go in the "Additional Features" table for post-trial evaluation |
| Trial drifts into permanent commitment | Hard end date with explicit go/no-go decision |
