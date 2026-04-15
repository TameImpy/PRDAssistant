# CLAUDE.md

## Project Overview

**DATA_WORKSHOP** is an internal web app for Immediate Media's Commercial Analysts team and wider stakeholders. It uses a conversational AI agent (Claude Sonnet 4) to interview users about data-related requests, structure the output into well-formed agile tickets (stories, epics, bugs, spikes), and push them to Monday.com via the GraphQL API.

The full project overview lives at `docs/PROJECT_OVERVIEW.md`. Read it before making any architectural or design decisions.

## Communication Rules

**MANDATORY: After completing any piece of work (a feature, a fix, a refactor, a config change — anything), explain clearly and in an engaging way what was just done.** Don't just say "done" or list file changes. Walk Matt through *what* changed, *why* it matters, and *how* it fits into the bigger picture. Use analogies where helpful. Make it interesting — this is a learning opportunity as much as a build.

**MANDATORY: Update `LESSONS_LEARNED.md` whenever we encounter and solve something noteworthy together.** This includes tricky bugs and their root causes, non-obvious gotchas with libraries or APIs, architectural decisions that weren't obvious, useful patterns discovered, and anything where the fix wasn't the first thing we tried. Each entry should include the date, what went wrong, why, and how we fixed it — written so future-us can benefit.

**MANDATORY: Continuously assess whether a recurring pattern is emerging that deserves its own skill.** Throughout every interaction, watch for repeated workflows, multi-step processes we keep doing manually, or domain-specific tasks that could be automated and reused. When a pattern is spotted, proactively propose a new skill — explain what it would do, when it would trigger, and why it would save time. If Matt agrees, create it using the `skill-creator` skill. Examples of patterns worth capturing: a specific way we structure API routes, a repeated debugging workflow, a common refactoring pattern, or a domain-specific generation task we keep doing by hand.

## Tech Stack

- **Frontend + Backend**: Next.js 16 (single app on Vercel, API routes for backend logic)
- **AI Agent**: Claude Sonnet 4 via Anthropic API (conversation + ticket generation), Haiku 4.5 (field extraction, summaries)
- **Monday.com**: Direct GraphQL API for reads and writes
- **Auth**: Google OAuth (@immediate.co.uk domain restriction via NextAuth v5)
- **Database**: Supabase (Postgres) — requests queue, analyst access control, sprint summary cache
- **Design**: Neo-brutalist Stitch template — `#D1FF00` primary, `#000000` secondary, `#00E0FF` tertiary, Space Grotesk + Inter fonts, sharp corners, hard shadows

## Design System Source

The design is based on a Google Stitch export:
- HTML: `/Users/matthewrance/Downloads/stitch (1)/code.html`
- Design spec: `/Users/matthewrance/Downloads/stitch (1)/DESIGN.md`

Use this as the visual foundation. Do not introduce border-radius, gradients, or soft shadows — the aesthetic is deliberately sharp and brutalist.

## App Structure

Three main sections:
1. **SUBMIT_REQUEST** — stakeholder path (plain language, no agile jargon). Submissions land in the Open Requests queue for analyst review before reaching Monday.com.
2. **CREATE_TICKET** — analyst path (full agile detail: story points, acceptance criteria, BDD). Goes direct to Monday.com backlog.
3. **MISSION_CONTROL** — analyst hub with two sub-pages:
   - **Sprint Overview** (all authenticated users) — live view of current sprint + recently shipped items from Monday.com, with AI-generated summary of shipped work
   - **Open Requests** (analyst only) — review queue for stakeholder submissions. Analysts can edit, approve (submit to Monday.com), or reject with reason.

## Key Principles

- **Speed over completeness.** The tool must feel faster than adding a row directly in Monday.com. If anything feels like a form, rethink it.
- **Two audiences, two vocabularies.** Stakeholders see plain English. Analysts see agile terminology. Never cross these wires.
- **The agent does the heavy lifting.** Users talk, the agent structures. Not the other way around.
- **Board-agnostic where possible.** Pass board IDs as parameters, not hardcoded values. A second data team may onboard in future with their own Monday.com workspace.

## Monday.com Integration

- **Board**: "Commercial Analysts Sprints" (ID: 5094486524)
- **Groups**: Backlog (new tickets land here) + Sprint groups named `Sprint - w/c [date]` (2-week cycles)
- **Status values**: Not Started, Working on it, Stuck, Waiting for review, Done
- **Columns**: Item name, Task Description, Priority, Type, Team, Estimate, Dependencies, Issue Description, Status, Owner, Due date
- **Column IDs**: Defined in `lib/monday.ts` → `COLUMN_IDS`
- Story points: 1/2/3/5/8/13 scale (13 max per story, >13 = epic)
- Priority: Critical / High / Medium / Low
- Teams: ELG/LT, Product & Optimisation, Analytics Engineering, Data & Analytics, Audience & Insights, Cross-department, Ad Product/Delivery, Sales, Wider Revops, Content

## Supabase

- **`requests` table**: Stores stakeholder submissions in the Open Requests queue (tickets, conversation transcript, identity, status, rejection reason, Monday.com item IDs)
- **`analysts` table**: Email list controlling access to Open Requests. Managed via Supabase Table Editor — no redeployment needed.
- **`sprint_summaries` table** (planned): Caches AI-generated summaries of shipped work per sprint group
- Schema: `frontend/supabase/migrations/001_create_requests_and_analysts.sql`

## Access Control

| Area | Who can access |
|---|---|
| SUBMIT_REQUEST | Any @immediate.co.uk user |
| CREATE_TICKET | Any @immediate.co.uk user |
| Sprint Overview | Any @immediate.co.uk user |
| Open Requests | Analysts only (email in `analysts` table) |

## Development Commands

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Deploy (via Vercel CLI or git push)
vercel
```

## Environment Variables

```
ANTHROPIC_API_KEY=             # Claude API key
GOOGLE_CLIENT_ID=              # Google OAuth client ID
GOOGLE_CLIENT_SECRET=          # Google OAuth client secret
NEXTAUTH_SECRET=               # NextAuth session secret
AUTH_SECRET=                   # Auth.js secret (same as NEXTAUTH_SECRET)
NEXTAUTH_URL=                  # App URL (http://localhost:3000 locally)
AUTH_URL=                      # Auth.js URL (same as NEXTAUTH_URL)
MONDAY_API_TOKEN=              # Monday.com API token
MONDAY_BOARD_ID=               # Commercial Analysts Sprints board ID
MONDAY_BACKLOG_GROUP_ID=       # Backlog group ID on sprints board
MONDAY_EPICS_BOARD_ID=         # Epics board ID (optional)
MONDAY_EPICS_BACKLOG_GROUP_ID= # Epics backlog group ID (optional)
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=     # Supabase service role key (server-side only)
```
