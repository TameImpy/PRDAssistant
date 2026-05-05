# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DATA_WORKSHOP** is an internal web app for Immediate Media's Commercial Analysts team and wider stakeholders. It has two main capabilities:

1. **Ticket creation** — A conversational AI agent (Claude Sonnet 4) interviews users about data-related requests, structures the output into well-formed agile tickets, and pushes them to Monday.com via the GraphQL API.
2. **Insights tools** — A growing suite of AI-powered tools for the Insights team, accessed via `/insights`. The first tool is UC-005: Survey Questionnaire Drafting (`/insights/survey-questionnaire`) — an intake form that generates a structured survey questionnaire via two sequential Anthropic API calls (generation + silent QA pass), with an inline editor, learning loop (Supabase `edit_logs`), and `.docx` download.

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

Four main sections:
1. **SUBMIT_REQUEST** — stakeholder path (plain language, no agile jargon). Submissions land in the Open Requests queue for analyst review before reaching Monday.com.
2. **CREATE_TICKET** — analyst path (full agile detail: story points, acceptance criteria, BDD). Goes direct to Monday.com backlog.
3. **MISSION_CONTROL** — analyst hub with two sub-pages:
   - **Sprint Overview** (all authenticated users) — live view of current sprint + recently shipped items from Monday.com, with AI-generated summary of shipped work
   - **Open Requests** (analyst only) — review queue for stakeholder submissions. Analysts can edit, approve (submit to Monday.com), or reject with reason.
4. **INSIGHTS** (`/insights`) — hub page for Insights team tools. Each tool is a sub-route. Current tools:
   - **Survey Questionnaire Drafting** (`/insights/survey-questionnaire`) — UC-005. Two-pass AI generation (Sonnet with extended thinking → silent QA call), inline editor, Supabase edit log, `.docx` download via `docx` npm package.

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

# Run unit tests (Jest)
npm test

# Run a single test file
npx jest __tests__/boards.test.ts

# Run integration tests (requires live dev server on localhost:3000)
TEST_INTEGRATION=true npm run test:integration

# Run E2E tests (Playwright — starts dev server automatically)
npm run test:e2e

# Run E2E tests in interactive UI mode
npm run test:e2e:ui

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

## AI Model Usage

- **Claude Sonnet 4** (`claude-sonnet-4-20250514`) — conversation, ticket generation, survey questionnaire generation (with extended thinking: `budget_tokens: 8000`, `max_tokens: 16000`), and survey QA pass (`max_tokens: 8000`, no extended thinking)
- **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — context pre-processing and sprint summaries (lighter tasks, lower cost)

## Key Architectural Patterns

**Adding a new feature:** Follow the Board Management pattern — `lib/{feature}.ts` (business logic) → `app/api/{feature}/route.ts` (API routes) → `app/{feature}/page.tsx` (page) → `components/{Feature}.tsx` (UI) → `supabase/migrations/NNN_*.sql` (schema).

**Tailwind v4:** Uses `@theme inline { }` block in `globals.css` for design tokens. There is no `tailwind.config.ts`. Do not create one.

**Auth:** Keep `lib/auth.ts` (config) separate from `lib/auth-provider.ts` (Google provider wiring) — separation required for Jest testability (ESM import issues).

**Tests:** Unit tests in `__tests__/*.test.ts` mock Supabase via Jest. Integration tests that need a live server are gated behind `TEST_INTEGRATION=true`. E2E tests in `e2e/*.spec.ts` use Playwright.

**Supabase schema:** `frontend/supabase/migrations/` — add a new numbered migration file for every schema change. Tables: `requests`, `analysts`, `sprint_summaries`, `edit_logs` (UC-005 learning loop).

## Git Workflow

- `origin` → `BiancaReh/PRDAssistant` (Bianca's fork — all pushes go here)
- `upstream` → `TameImpy/PRDAssistant` (original repo — pull updates from here, PR into here when ready)
- Working branch: `feature/new_feature_Insights`
- GitHub CLI available at: `C:\Users\bianca.rehle\gh-cli\bin\gh.exe`
