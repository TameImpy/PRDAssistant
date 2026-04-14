# CLAUDE.md

## Project Overview

**DATA_WORKSHOP** is an internal web app for Immediate Media's Commercial Analysts team and wider stakeholders. It uses a conversational AI agent (Claude Sonnet 4) to interview users about data-related requests, structure the output into well-formed agile tickets (stories, epics, bugs, spikes), and push them to Monday.com via the GraphQL API.

The full specification lives in memory at `project_data_workshop.md`. Read it before making any architectural or design decisions.

## Communication Rules

**MANDATORY: After completing any piece of work (a feature, a fix, a refactor, a config change — anything), explain clearly and in an engaging way what was just done.** Don't just say "done" or list file changes. Walk Matt through *what* changed, *why* it matters, and *how* it fits into the bigger picture. Use analogies where helpful. Make it interesting — this is a learning opportunity as much as a build.

**MANDATORY: Update `LESSONS_LEARNED.md` whenever we encounter and solve something noteworthy together.** This includes tricky bugs and their root causes, non-obvious gotchas with libraries or APIs, architectural decisions that weren't obvious, useful patterns discovered, and anything where the fix wasn't the first thing we tried. Each entry should include the date, what went wrong, why, and how we fixed it — written so future-us can benefit.

**MANDATORY: Continuously assess whether a recurring pattern is emerging that deserves its own skill.** Throughout every interaction, watch for repeated workflows, multi-step processes we keep doing manually, or domain-specific tasks that could be automated and reused. When a pattern is spotted, proactively propose a new skill — explain what it would do, when it would trigger, and why it would save time. If Matt agrees, create it using the `skill-creator` skill. Examples of patterns worth capturing: a specific way we structure API routes, a repeated debugging workflow, a common refactoring pattern, or a domain-specific generation task we keep doing by hand.

## Tech Stack

- **Frontend + Backend**: Next.js (single app on Vercel, API routes for backend logic)
- **AI Agent**: Claude Sonnet 4 via Anthropic API
- **Monday.com**: Direct GraphQL API (v1), MCP for reads (v2)
- **Auth**: Google OAuth (Immediate Media domain restriction)
- **Database**: None — stateless in v1
- **Design**: Neo-brutalist Stitch template — `#D1FF00` primary, `#000000` secondary, `#00E0FF` tertiary, Space Grotesk + Inter fonts, sharp corners, hard shadows

## Design System Source

The design is based on a Google Stitch export:
- HTML: `/Users/matthewrance/Downloads/stitch (1)/code.html`
- Design spec: `/Users/matthewrance/Downloads/stitch (1)/DESIGN.md`

Use this as the visual foundation. Do not introduce border-radius, gradients, or soft shadows — the aesthetic is deliberately sharp and brutalist.

## App Structure

Three main sections:
1. **SUBMIT_REQUEST** — stakeholder path (plain language, no agile jargon)
2. **CREATE_TICKET** — analyst path (full agile detail: story points, acceptance criteria, BDD)
3. **MISSION_CONTROL** — v2 dashboard (placeholder "coming soon" in v1)

## Key Principles

- **Speed over completeness.** The tool must feel faster than adding a row directly in Monday.com. If anything feels like a form, rethink it.
- **Two audiences, two vocabularies.** Stakeholders see plain English. Analysts see agile terminology. Never cross these wires.
- **The agent does the heavy lifting.** Users talk, the agent structures. Not the other way around.
- **Backlog, not sprint.** Everything lands in the backlog group. The team refines and prioritises from there.

## Monday.com Integration

- **Stories/bugs/spikes**: "Commercial Analysts Sprints" board → Backlog group
- **Epics**: Separate epics board → Backlog group
- Columns: Item name, Task Description, Priority, Type, Team, Estimate, Dependencies, Issue Description, Status
- Story points: 1/2/3/5/8/13 scale (13 max per story, >13 = epic)
- Priority: Critical / High / Medium / Low
- Teams: ELG/LT, Product & Optimisation, Analytics Engineering, Data & Analytics, Audience & Insights, Cross-department, Ad Product/Delivery, Sales, Wider Revops, Content

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy (via Vercel CLI or git push)
vercel
```

## Environment Variables

```
ANTHROPIC_API_KEY=         # Claude Sonnet 4 API key
GOOGLE_CLIENT_ID=          # OAuth client ID
GOOGLE_CLIENT_SECRET=      # OAuth client secret
NEXTAUTH_SECRET=           # NextAuth session secret
NEXTAUTH_URL=              # App URL
MONDAY_API_TOKEN=          # Monday.com API token
MONDAY_BOARD_ID=           # Commercial Analysts Sprints board ID
MONDAY_EPICS_BOARD_ID=     # Epics board ID
MONDAY_BACKLOG_GROUP_ID=   # Backlog group ID on sprints board
MONDAY_EPICS_BACKLOG_GROUP_ID= # Backlog group ID on epics board
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=     # Supabase service role key (server-side only)
```
