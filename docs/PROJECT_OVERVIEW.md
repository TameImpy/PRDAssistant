# DATA_WORKSHOP — Project Overview

## What Is It?

DATA_WORKSHOP is an internal web app built for Immediate Media's Commercial Analysts team and wider stakeholders. It replaces the manual process of logging data requests into Monday.com with a conversational AI experience that structures, reviews, and submits tickets automatically.

## Who Uses It?

### Stakeholders (Sales, Editorial, Product, etc.)
Describe what they need in plain English via a chat interface. The AI assistant interviews them, captures the key details, and generates structured tickets. These land in a review queue for analysts to shape before hitting the backlog.

### Commercial Analysts
- **Create tickets directly** with full agile detail (user stories, BDD acceptance criteria, story points)
- **Review stakeholder requests** in the Open Requests queue — edit, approve, or reject before pushing to Monday.com
- **View sprint progress** via Mission Control's Sprint Overview

### Leadership / Management
View what the team is currently building and what shipped last sprint via the Sprint Overview dashboard. No Monday.com account needed.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                    │
│              (Frontend + API Routes)             │
├─────────────────────────────────────────────────┤
│                                                  │
│  SUBMIT_REQUEST ─── Chat ─── Review ─── Supabase │
│  (stakeholders)     (AI)    (preview)  (queue)   │
│                                                  │
│  CREATE_TICKET ──── Chat ─── Review ─── Monday   │
│  (analysts)         (AI)    (preview)  (direct)  │
│                                                  │
│  MISSION_CONTROL                                 │
│  ├── Sprint Overview ──── Monday.com API (read)  │
│  └── Open Requests ────── Supabase (CRUD)        │
│       (analyst only)                             │
│                                                  │
├─────────────────────────────────────────────────┤
│  Auth: Google OAuth (@immediate.co.uk only)      │
│  AI: Claude Sonnet 4 (conversation + tickets)    │
│      Claude Haiku 4.5 (summaries)                │
│  DB: Supabase (requests queue, analyst access)   │
│  PM: Monday.com GraphQL API (read + write)       │
│  Deploy: Vercel                                  │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Stakeholder Request Flow
1. Stakeholder signs in with Google (@immediate.co.uk)
2. Selects their team
3. Chats with AI assistant — the assistant captures: what they need, who benefits, why it matters, success criteria, and who the request is for (requestedBy)
4. AI generates structured tickets (user stories, acceptance criteria, story points, priority, type)
5. Stakeholder reviews a plain-English summary and confirms
6. Request saves to Supabase with status "Open" (NOT directly to Monday.com)
7. Confirmation message: "Your request has been received and is in the review queue"

### Analyst Review Flow (Open Requests)
1. Analyst opens Mission Control → Open Requests
2. Sees queue of stakeholder requests sorted oldest first
3. Clicks into a request — sees generated tickets + original conversation transcript
4. Edits any ticket fields as needed (title, user story, acceptance criteria, story points, priority, type, team, dependencies, description)
5. Submits to Monday.com backlog → status becomes "Submitted to Backlog", Monday.com item IDs stored
6. Or rejects with a reason → status becomes "Rejected"

### Analyst Direct Flow
1. Analyst signs in, goes to CREATE_TICKET
2. Chats with AI using full agile terminology
3. Reviews structured tickets and confirms
4. Tickets go directly to Monday.com backlog (no review queue)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| AI | Claude Sonnet 4 (conversation + ticket generation), Haiku 4.5 (field extraction, summaries) |
| Auth | NextAuth v5 (Google OAuth, @immediate.co.uk restriction) |
| Database | Supabase (Postgres) |
| Project Management | Monday.com GraphQL API |
| Deployment | Vercel |
| Testing | Jest (unit), Playwright (E2E) |

## Design System

Neo-brutalist aesthetic based on a Google Stitch export:
- **Primary**: `#D1FF00` (acid green)
- **Secondary**: `#000000` (black)
- **Tertiary**: `#00E0FF` (cyan)
- **Fonts**: Space Grotesk (headlines), Inter (body)
- **No border-radius, no gradients, no soft shadows**
- Sharp corners, hard drop shadows, bold uppercase labels, monospace-inspired labels

## Monday.com Board Structure

**Board**: Commercial Analysts Sprints (ID: 5094486524)

**Groups**:
- Backlog — where new tickets land
- Sprint - w/c [date] — 2-week sprint cycles (e.g. "Sprint - w/c 13st April")

**Status values**: Not Started, Working on it, Stuck, Waiting for review, Done

**Columns**: Task, Owner, Status, Due date, Task Description, Priority, Type, Team, Estimate, Dependencies

**Story points scale**: 1 / 2 / 3 / 5 / 8 / 13 (13 max per story, >13 = epic)

## Supabase Schema

### `requests` table
Stores stakeholder submissions in the review queue.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| tickets | jsonb | Array of Ticket objects |
| conversation_transcript | jsonb | Original chat messages |
| submitted_by_name | text | From Google session |
| submitted_by_email | text | From Google session |
| requested_by | text | Captured conversationally |
| team | text | Selected by stakeholder |
| status | text | Open / Rejected / Submitted to Backlog |
| rejection_reason | text (nullable) | Required when rejected |
| monday_item_ids | jsonb (nullable) | Populated on submit |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated via trigger |

### `analysts` table
Controls access to Open Requests in Mission Control.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| email | text (unique) | Must match Google OAuth email |
| created_at | timestamptz | Auto-set |

### `sprint_summaries` table (planned)
Caches AI-generated summaries of shipped work per sprint.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| sprint_group_name | text (unique) | e.g. "Sprint - w/c 30th March" |
| done_item_names | jsonb | Array of task names used to generate summary |
| summary | text | AI-generated 1-2 line summary |
| created_at | timestamptz | Auto-set |

## Access Control

| Area | Who can access |
|---|---|
| SUBMIT_REQUEST | Any @immediate.co.uk user |
| CREATE_TICKET | Any @immediate.co.uk user |
| Sprint Overview | Any @immediate.co.uk user |
| Open Requests | Analysts only (email in `analysts` table) |

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Stakeholder requests go to queue, not Monday.com | Pre-backlog quality gate | Prevents poorly scoped tickets entering the backlog |
| Supabase for queue storage | Proper persistence, free tier, future real-time potential | |
| Analyst email list (not roles) | Small known team | Upgrade to roles later if needed |
| No real-time updates | Manual refresh | Low volume doesn't justify WebSocket complexity |
| No ticket split/merge | Edit only in v1 | Keeps UI simple |
| No stakeholder visibility of request status | Slack for updates | Build tracking if demand emerges |
| No claiming/locking on requests | Small team, low collision risk | Add if collisions happen |
| Board-agnostic architecture | Pass board IDs as parameters | Future-proofs for second data team onboarding |

## Future Considerations

### Multi-team support
The architecture should remain board-agnostic where possible. The `MondayClient` already accepts board IDs as parameters. A second central data team has a separate Monday.com workspace and board. When they onboard, the changes needed are:
- Team/workspace config mapping (team name → board ID, backlog group ID)
- Team selector at Mission Control level
- Submit flow routes to correct board

### Potential v2+ features
- Stakeholder request status tracking (in-app or email notifications)
- Real-time updates via Supabase subscriptions
- Ticket split/merge in Open Requests
- Claiming/assignment of requests
- AI chat querying Monday.com data (MCP integration)
- Role-based access (upgrade from email list)

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

## Development

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm test             # Unit tests (Jest)
npm run test:e2e     # E2E tests (Playwright)
```
