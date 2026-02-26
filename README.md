# CoFounder — Partnership Intelligence & Venture Discovery

CoFounder is a full-stack web application that helps co-founder teams **validate their partnership** and **discover the right venture to build together**. It combines deep psychometric-style assessments with LLM-powered analysis to produce compatibility reports, track partnership health over time, and generate data-driven startup ideas tailored to a team's combined strengths.

---

## Table of Contents

- [Features Overview](#features-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone & Install](#1-clone--install)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Database Setup](#3-database-setup)
  - [4. Run the App](#4-run-the-app)
- [Project Structure](#project-structure)
- [User Guide](#user-guide)
  - [Registration & Login](#registration--login)
  - [Creating a Team](#creating-a-team)
  - [Inviting Partners](#inviting-partners)
  - [Partnership Assessment](#partnership-assessment)
  - [Compatibility Report](#compatibility-report)
  - [Venture Discovery](#venture-discovery)
  - [Pulse Surveys & Trend Tracking](#pulse-surveys--trend-tracking)
  - [Notifications](#notifications)
  - [Settings & Privacy](#settings--privacy)
- [Database Schema](#database-schema)
- [Server Actions Reference](#server-actions-reference)
- [AI Providers](#ai-providers)
- [Email System](#email-system)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)
  - [Unit & Integration Tests (Vitest)](#unit--integration-tests-vitest)
  - [Living Documentation (Cucumber)](#living-documentation-cucumber)
- [Scripts Reference](#scripts-reference)
- [Deployment](#deployment)
- [Configuration Reference](#configuration-reference)
- [License](#license)

---

## Features Overview

### Partnership Validation

| Capability | Description |
|---|---|
| **Deep Assessment** | 57-question assessment across 5 psychological dimensions |
| **Anonymous Responses** | Individual answers are never shown to partners — only aggregated insights |
| **AI Compatibility Report** | LLM-generated report with alignment map, risk radar, blind spots, archetype, and recommendations |
| **Pulse Surveys** | Recurring lightweight check-ins (11 questions) on configurable schedules |
| **Trend Tracking** | Partnership health timeline with score trends, milestones, and historical comparison |
| **N Co-Founders** | Supports teams of 2–10 partners with pairwise analysis |

### Venture Discovery

| Capability | Description |
|---|---|
| **Venture Inputs** | Each partner independently shares passions, problem spaces, customer preferences, business model leanings, technology preferences, existing ideas, and anti-preferences |
| **AI Idea Generation** | LLM generates tailored startup ideas with market analysis, team-fit scores, feasibility notes, revenue timelines, and 90-day plans |
| **Anonymous Rating** | Partners independently rate each idea on excitement, confidence, fit, and commitment |
| **Alignment Reveal** | Shows mutual top picks vs. divergent interests — without breaking anonymity of individual ratings |
| **Venture Selection** | Team selects a venture and gets a deep-dive action plan |

### Platform

| Capability | Description |
|---|---|
| **Authentication** | Email/password with optional Google OAuth |
| **Team Management** | Create teams, invite via email (7-day expiring tokens), role-based access |
| **Email Notifications** | Invitation emails, assessment reminders, report-ready alerts via Resend |
| **In-App Notifications** | Real-time notification feed with read/unread tracking |
| **Data Privacy** | Full data export (JSON), 30-day grace-period account deletion |
| **Accessibility** | ARIA attributes, semantic roles, keyboard navigation, focus management |
| **Security** | CSP with per-request nonces, HSTS, rate limiting, input validation |

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser     │────▶│  Next.js 16  │────▶│ PostgreSQL   │
│   (React 19)  │◀────│  App Router  │◀────│ (Prisma 7)   │
└──────────────┘     │  + Middleware │     └──────────────┘
                      │              │
                      │  Server      │     ┌──────────────┐
                      │  Actions     │────▶│  AI Provider  │
                      │              │     │ (Anthropic /  │
                      │              │     │   OpenAI)     │
                      │              │     └──────────────┘
                      │              │
                      │              │     ┌──────────────┐
                      │              │────▶│  Resend       │
                      │              │     │  (Email)      │
                      └──────────────┘     └──────────────┘
                             │
                      ┌──────────────┐
                      │ Upstash Redis│  (optional)
                      │ Rate Limiting│
                      └──────────────┘
```

The application uses **Next.js Server Actions** exclusively for data mutations — there are no custom REST API endpoints beyond the NextAuth handler. All business logic runs server-side, and the client is a thin React layer with form submissions and optimistic UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Actions, Middleware) |
| **Language** | TypeScript 5 (strict mode) |
| **UI** | React 19, Tailwind CSS 4, shadcn/ui-inspired components |
| **Database** | PostgreSQL 16, Prisma 7.4 ORM (`@prisma/adapter-pg`) |
| **Authentication** | NextAuth.js v5 (JWT sessions, Prisma adapter, Credentials + Google OAuth) |
| **AI** | Anthropic Claude SDK / OpenAI SDK (pluggable provider) |
| **Email** | Resend (with console fallback for development) |
| **Validation** | Zod v4 (schemas for forms, AI outputs, and JSON fields) |
| **Rate Limiting** | Upstash Redis (production) / in-memory sliding window (development) |
| **Charts** | Recharts |
| **Testing** | Vitest 4, vitest-mock-extended, @cucumber/cucumber |
| **Containerization** | Docker Compose (PostgreSQL) |

---

## Prerequisites

- **Node.js** 18.17 or later
- **Docker** and Docker Compose (for PostgreSQL)
- **An AI API key** — either Anthropic or OpenAI (for report/idea generation)

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url> startup-ideator
cd startup-ideator
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Your app's base URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | A random secret for JWT signing (generate with `openssl rand -base64 32`) |
| `AI_PROVIDER` | Yes | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` | If using Anthropic | Your Anthropic API key |
| `OPENAI_API_KEY` | If using OpenAI | Your OpenAI API key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (enables Google sign-in when set) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `RESEND_API_KEY` | No | Resend API key for transactional emails (falls back to console logging) |
| `EMAIL_FROM` | No | Sender email address (default: `noreply@example.com`) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis auth token |

### 3. Database Setup

Start PostgreSQL:

```bash
docker compose up -d
```

Push the schema to the database:

```bash
npm run db:push
```

Or, if you prefer migrations:

```bash
npm run db:migrate
```

Optionally, inspect the database with Prisma Studio:

```bash
npm run db:studio
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
startup-ideator/
├── features/                    # Gherkin feature files (BDD / living documentation)
│   ├── cross_cutting/           # Auth, privacy, multi-partner, notifications, NFRs
│   ├── partnership/             # Assessment, report, anonymity, pulse, trends
│   ├── team/                    # Team creation, partner invitation
│   ├── venture/                 # Idea generation, rating, inputs, selection
│   └── step-definitions/        # Cucumber.js step definitions wired to business logic
│
├── prisma/
│   └── schema.prisma            # Database schema (20 models)
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Public auth pages (login, register, privacy)
│   │   ├── (dashboard)/         # Protected pages (teams, settings, notifications)
│   │   │   ├── teams/
│   │   │   │   ├── [teamId]/
│   │   │   │   │   ├── assessment/    # Partnership assessment engine
│   │   │   │   │   ├── report/        # Compatibility report viewer
│   │   │   │   │   ├── pulse/         # Pulse survey
│   │   │   │   │   ├── trends/        # Health trends & milestones
│   │   │   │   │   └── venture/       # Full venture discovery flow
│   │   │   │   │       ├── inputs/    # Venture input engine
│   │   │   │   │       ├── ideas/     # AI-generated ideas
│   │   │   │   │       ├── rating/    # Anonymous idea rating
│   │   │   │   │       ├── alignment/ # Alignment reveal
│   │   │   │   │       └── selection/ # Venture selection & action plan
│   │   │   │   └── new/               # Create new team
│   │   │   ├── settings/              # Profile, notifications, data export, deletion
│   │   │   └── notifications/         # Notification feed
│   │   ├── api/auth/                  # NextAuth.js route handler
│   │   └── invite/[token]/            # Invitation acceptance page
│   │
│   ├── components/              # Shared UI components
│   │   ├── nav.tsx              # Dashboard navigation
│   │   └── ui/                  # Primitive components (button, card, input, etc.)
│   │
│   ├── lib/                     # Core business logic
│   │   ├── actions/             # Server Actions (all data mutations)
│   │   ├── ai/                  # AI provider abstraction, prompt builders, types
│   │   ├── assessment/          # Question definitions (initial, venture, pulse)
│   │   ├── auth/                # NextAuth.js configuration
│   │   ├── db/                  # Prisma client singleton
│   │   ├── email/               # Resend integration & email templates
│   │   ├── validation/          # Zod schemas for runtime JSON validation
│   │   ├── rate-limit.ts        # Redis / in-memory rate limiter
│   │   ├── scheduling.ts        # Pulse schedule computation
│   │   └── utils.ts             # Shared utilities (cn, etc.)
│   │
│   ├── middleware.ts            # Auth protection + CSP nonce injection
│   └── types/                   # TypeScript declaration files
│
├── docker-compose.yml           # PostgreSQL 16 container
├── next.config.ts               # Security headers
├── vitest.config.ts             # Test configuration with module aliases
├── cucumber.js                  # Cucumber.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Scripts and dependencies
```

---

## User Guide

### Registration & Login

1. Navigate to `/register` to create an account with your name, email, and password.
2. Passwords must be at least 8 characters.
3. After registration you are automatically signed in and redirected to the teams page.
4. Returning users sign in at `/login` with email and password.
5. If Google OAuth is configured, a "Sign in with Google" button appears on the login page.

### Creating a Team

1. From the `/teams` page, click **"Create a new team"**.
2. Enter a team name (required, 2–100 characters).
3. Optionally specify a **stage** (idea, pre-seed, seed, etc.) and **domain** (industry focus).
4. You become the team **creator** with full management rights.

### Inviting Partners

1. Open your team page at `/teams/{teamId}`.
2. In the invitation form, enter your co-founder's email address.
3. They receive an email with a link to join. The invitation expires in **7 days**.
4. Only the team creator can invite and revoke invitations.
5. Teams support a maximum of **10 members**.
6. Pending invitations are visible on the team page and can be revoked.

### Partnership Assessment

The assessment is the foundation of partnership validation. Each partner completes it independently and privately.

**5 Assessment Dimensions:**

| Dimension | Focus | Example Questions |
|---|---|---|
| **Identity & Motivation** | Core drives, vision, values, ambition | "Rank these motivations: wealth, impact, freedom, fame, mastery" |
| **Working Style & Psychology** | Decision-making, risk tolerance, conflict style | "Where do you fall on the spectrum: move fast ↔ move carefully?" |
| **Skills & Capabilities** | Technical skills, business skills, network | "Rate your skill level: frontend, backend, data, design, etc." |
| **Structural & Practical** | Time commitment, equity expectations, runway | "How many hours per week can you commit?" |
| **Relationship & Trust** | Communication, boundaries, past experiences | "Describe a scenario where a partner disagreed with you" |

**How it works:**

1. Navigate to `/teams/{teamId}/assessment`.
2. Complete each section in order — progress is saved automatically (debounced).
3. All responses are stored encrypted and **never shown to other partners**.
4. Once all required questions are answered, submit the assessment.
5. The team page shows each member's completion status (without revealing answers).
6. The compatibility report becomes available once **all partners** have completed the assessment.

**Question types:** ranking, slider, multi-select, single-select, free-text, scenario-based, skill-rating, spectrum, numeric, and partner-reflection.

### Compatibility Report

Once every team member has completed the initial assessment:

1. Navigate to `/teams/{teamId}/report`.
2. Click **"Generate Compatibility Report"**.
3. The AI analyzes all partner responses (anonymized as "Partner A", "Partner B", etc.) and produces:

| Report Section | Content |
|---|---|
| **Summary** | High-level narrative of the partnership dynamics |
| **Overall Score** | Numeric compatibility score (0–100) |
| **Partnership Archetype** | A named archetype (e.g. "The Complementary Builders") with strengths and watch-outs |
| **Alignment Map** | Per-dimension scores showing where partners align and diverge |
| **Risk Radar** | Identified risks ranked by severity (low → critical) with mitigations |
| **Blind Spots** | Areas neither partner is aware of or has addressed |
| **Recommendations** | Prioritized action items with timeframes |

4. Reports are versioned — generating a new report preserves the previous one for comparison.
5. Report generation is rate-limited to **3 requests per 10 minutes** per user.

### Venture Discovery

The venture discovery flow helps the team find the right startup idea for their combined skills and interests.

#### Step 1: Venture Inputs

Each partner independently fills out 7 sections:

| Section | What You Share |
|---|---|
| **Passions & Interests** | What energizes you and what you could work on for years |
| **Problem Spaces** | Real-world problems you've witnessed that need solving |
| **Customer Preferences** | Who you want to serve (B2B, B2C, developers, etc.) |
| **Business Model Preferences** | Revenue approaches (SaaS, marketplace, etc.) |
| **Technology Preferences** | Technologies you want to work with or leverage |
| **Existing Ideas** | Any specific startup ideas you've been considering |
| **Anti-Preferences** | What you explicitly do *not* want to do |

Navigate to `/teams/{teamId}/venture/inputs` to begin.

#### Step 2: AI Idea Generation

Once all partners submit their inputs:

1. Navigate to `/teams/{teamId}/venture/ideas`.
2. Click **"Generate Venture Ideas"**.
3. The AI produces multiple startup candidates, each with:
   - Problem statement and proposed solution
   - Target customer profile
   - Business model
   - Market opportunity analysis
   - Competitive landscape
   - Team-fit score (how well it matches the team)
   - Feasibility assessment
   - First 90-day plan
   - Revenue timeline
   - Risk level
   - Industry classification

Generation is rate-limited to **5 requests per 10 minutes** per user.

#### Step 3: Anonymous Rating

Each partner independently rates every venture candidate (at `/teams/{teamId}/venture/rating`) on four dimensions:

- **Excitement** (1–10): How excited are you about this idea?
- **Confidence** (1–10): How confident are you that this can work?
- **Fit** (1–10): How well does this match your skills and interests?
- **Commitment** (1–10): How willing are you to commit to this?

Partners can also add private notes and rank their top choices. Individual ratings are **never revealed** to other partners.

#### Step 4: Alignment Reveal

Navigate to `/teams/{teamId}/venture/alignment` to see:

- **Mutual Top Picks**: Ideas that scored highly across all partners
- **Divergent Interests**: Ideas where partners significantly disagree
- Aggregated scores — individual ratings remain anonymous

#### Step 5: Venture Selection

At `/teams/{teamId}/venture/selection`, the team selects a venture and receives:

- A deep-dive analysis of the chosen idea
- A structured action plan with milestones
- Next steps for the team

### Pulse Surveys & Trend Tracking

After the initial assessment, partnerships evolve. Pulse surveys provide ongoing health monitoring.

**Configuring the Schedule:**

1. Navigate to `/teams/{teamId}/trends`.
2. Set the pulse frequency: **weekly**, **biweekly**, **monthly**, or **quarterly**.
3. The system computes the next due date automatically.

**Taking a Pulse Survey:**

1. When a pulse is due, navigate to `/teams/{teamId}/pulse`.
2. Answer 11 quick questions:
   - 8 slider questions (1–10) covering satisfaction, communication, trust, alignment, workload, decision-making, conflict health, and motivation
   - 2 free-text reflections: biggest win and biggest concern since last check-in
   - 1 scenario question for real-time calibration

**Viewing Trends:**

At `/teams/{teamId}/trends`, you see:

- Score trends over time (charted with Recharts)
- Milestone timeline (record significant partnership events)
- Comparison between initial assessment and latest pulse

**Recording Milestones:**

Team members can record milestones (e.g. "Shipped MVP", "Closed first customer", "Had our first real disagreement") that appear on the trend timeline.

### Notifications

#### In-App

- Navigate to `/notifications` for a feed of all notifications.
- The navigation bar shows an unread count badge.
- Notifications are generated for: invitations received, assessments completed by partners, reports ready, pulse surveys due.
- Mark individual notifications or all as read.

#### Email

Transactional emails are sent for:

- Team invitations (with one-click accept link)
- Assessment reminders
- Report-ready alerts

When `RESEND_API_KEY` is not set, emails are logged to the console for development.

### Settings & Privacy

Navigate to `/settings` for:

| Feature | Description |
|---|---|
| **Notification Preferences** | Toggle email notifications per category (invitations, assessments, reports, pulse surveys, weekly digest) and in-app notifications |
| **Data Export** | Download all your data as JSON — profile, teams, assessments, venture inputs, ratings, notification preferences |
| **Account Deletion** | Request deletion with an optional reason. A 30-day grace period allows cancellation. After 30 days, all data is permanently removed |

---

## Database Schema

The application uses **20 Prisma models**:

### Core Models

| Model | Purpose |
|---|---|
| `User` | Registered users with email, name, password hash, timezone |
| `Team` | Co-founder teams with name, stage, and domain |
| `TeamMember` | Junction table linking users to teams with roles (`creator` / `partner`) |
| `Invitation` | Email-based invitations with token, status, and 7-day expiry |

### Authentication (NextAuth.js)

| Model | Purpose |
|---|---|
| `Account` | OAuth provider accounts |
| `Session` | User sessions (JWT-backed) |
| `VerificationToken` | Email verification tokens |

### Assessment & Reports

| Model | Purpose |
|---|---|
| `Assessment` | Assessment instances (type: `initial` or `pulse`, status: `in_progress` or `completed`) |
| `AssessmentResponse` | Individual question responses (section + question key → JSON answer) |
| `Report` | AI-generated reports (type: `compatibility`, status: `generating` / `ready` / `failed`, versioned) |

### Venture Discovery

| Model | Purpose |
|---|---|
| `VentureInput` | Per-member venture input responses (JSON blob) |
| `VentureCandidate` | AI-generated startup ideas with full analysis fields |
| `VentureRating` | Per-member anonymous ratings (excitement, confidence, fit, commitment, rank, notes) |
| `VentureSelection` | Team's selected venture with deep analysis and action plan |

### Ongoing Health

| Model | Purpose |
|---|---|
| `PulseSchedule` | Per-team pulse frequency and next due date |
| `Milestone` | Team milestones recorded on the trend timeline |

### Platform

| Model | Purpose |
|---|---|
| `Notification` | In-app notifications with type, title, body, link, read status |
| `NotificationPreference` | Per-user email/in-app notification toggles |
| `DeletionRequest` | Account deletion requests with status, reason, and scheduled date |

### Key Relationships

```
User ──┬── TeamMember ──┬── Team
       │                ├── Assessment ── AssessmentResponse
       │                ├── VentureInput
       │                └── VentureRating
       ├── Notification
       ├── NotificationPreference
       └── DeletionRequest

Team ──┬── Invitation
       ├── Report
       ├── VentureCandidate ── VentureRating
       ├── VentureSelection
       ├── PulseSchedule
       └── Milestone
```

---

## Server Actions Reference

All data mutations use Next.js Server Actions (`"use server"` functions). There are no REST API endpoints.

### `src/lib/actions/auth.ts`

| Action | Parameters | Description |
|---|---|---|
| `register` | `FormData` (name, email, password) | Create account, hash password with bcrypt, auto-login |
| `login` | `FormData` (email, password) | Authenticate via NextAuth credentials |

### `src/lib/actions/teams.ts`

| Action | Parameters | Description |
|---|---|---|
| `createTeam` | `FormData` (name, stage?, domain?) | Create team with caller as creator, redirects to team page |
| `getUserTeams` | — | List all teams for the logged-in user |
| `getTeamById` | `teamId` | Fetch team with members and pending invitations |

### `src/lib/actions/invitations.ts`

| Action | Parameters | Description |
|---|---|---|
| `invitePartner` | `FormData` (email, teamId) | Validate, create invitation, send email |
| `acceptInvitation` | `token` | Join team via invitation token |
| `revokeInvitation` | `invitationId` | Cancel a pending invitation (creator only) |

### `src/lib/actions/assessment.ts`

| Action | Parameters | Description |
|---|---|---|
| `getOrCreateAssessment` | `teamId` | Get or create initial assessment for current user |
| `saveResponse` | `assessmentId, sectionKey, questionKey, answer` | Upsert a single response (owner-only, blocks if completed) |
| `submitAssessment` | `assessmentId` | Validate all required questions answered, mark complete |
| `getTeamAssessmentStatus` | `teamId` | Completion status per member (no answer content) |

### `src/lib/actions/report.ts`

| Action | Parameters | Description |
|---|---|---|
| `generateReport` | `teamId` | Rate-limited. Anonymizes responses, calls AI, validates output with Zod, saves report |
| `getReport` | `reportId` | Fetch a specific report |
| `getLatestReport` | `teamId` | Fetch the most recent compatibility report |

### `src/lib/actions/venture.ts`

| Action | Parameters | Description |
|---|---|---|
| `getOrCreateVentureInput` | `teamId` | Get or create venture input for current user |
| `saveVentureInput` | `ventureInputId, sectionKey, questionKey, answer` | Save a venture input response |
| `submitVentureInput` | `ventureInputId` | Mark venture inputs as completed |
| `getVentureInputStatus` | `teamId` | Completion status per member |
| `generateVentureCandidates` | `teamId` | Rate-limited. Build prompt, call AI, validate, save candidates |
| `getVentureCandidates` | `teamId` | Fetch all candidates for a team |
| `rateVentureCandidate` | `candidateId, ratings` | Submit anonymous rating (excitement, confidence, fit, commitment) |
| `getAlignmentReveal` | `teamId` | Compute aggregated scores and alignment analysis |
| `selectVenture` | `teamId, candidateId` | Select a venture, generate deep analysis and action plan |
| `getVentureSelection` | `teamId` | Fetch selected venture details |

### `src/lib/actions/pulse.ts`

| Action | Parameters | Description |
|---|---|---|
| `getOrCreatePulseAssessment` | `teamId` | Get or create a pulse assessment |
| `configurePulseSchedule` | `teamId, frequency` | Set pulse frequency and compute next due date |
| `getPulseSchedule` | `teamId` | Fetch current schedule |
| `recordMilestone` | `teamId, title, description?` | Record a partnership milestone |
| `getTeamMilestones` | `teamId` | Fetch all milestones |
| `getTrendData` | `teamId` | Fetch historical scores for trend charts |

### `src/lib/actions/privacy.ts`

| Action | Parameters | Description |
|---|---|---|
| `exportUserData` | — | Full JSON export of user's data |
| `requestAccountDeletion` | `reason?` | Schedule deletion in 30 days |
| `cancelAccountDeletion` | — | Cancel a pending deletion request |
| `getDeletionStatus` | — | Check current deletion status |

### `src/lib/actions/notifications.ts`

| Action | Parameters | Description |
|---|---|---|
| `getNotifications` | — | All notifications for current user |
| `getUnreadCount` | — | Count of unread notifications |
| `markAsRead` | `notificationId` | Mark one notification read |
| `markAllAsRead` | — | Mark all notifications read |
| `getNotificationPreferences` | — | Fetch notification toggles |
| `updateNotificationPreferences` | `prefs` | Update notification toggles |
| `createNotification` | `userId, type, title, body, link?` | Create a notification for a user |

---

## AI Providers

The AI layer is abstracted behind a provider interface, configured via the `AI_PROVIDER` environment variable.

### Supported Providers

| Provider | Env Var | SDK |
|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | `@anthropic-ai/sdk` |
| OpenAI GPT | `OPENAI_API_KEY` | `openai` |

### How It Works

1. `getAIProvider()` returns the configured provider instance.
2. The provider implements two methods:
   - `generateCompatibilityReport(input)` — takes anonymized partner responses and returns a structured `CompatibilityReport`
   - `generateVentureCandidates(prompt)` — takes a constructed prompt and returns `VentureCandidateData[]`
3. Prompts are built by dedicated prompt-builder modules (`src/lib/ai/prompts/`) that structure the assessment data for optimal AI output.
4. All AI-generated JSON is validated against Zod schemas before being saved to the database.

### Report Output Structure

```typescript
interface CompatibilityReport {
  summary: string;
  overallScore: number;              // 0–100
  archetype: {
    name: string;                    // e.g. "The Complementary Builders"
    description: string;
    strengths: string[];
    watchOuts: string[];
  };
  alignmentMap: Array<{
    dimension: string;
    score: number;
    summary: string;
    details: string;
  }>;
  riskRadar: Array<{
    risk: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    mitigation: string;
  }>;
  blindSpots: Array<{
    area: string;
    description: string;
    category: string;
  }>;
  recommendations: Array<{
    priority: number;
    title: string;
    description: string;
    timeframe: string;
  }>;
  scores: Array<{
    dimension: string;
    score: number;
    maxScore: number;
  }>;
}
```

### Venture Candidate Structure

```typescript
interface VentureCandidateData {
  problem: string;
  solution: string;
  customer: string;
  businessModel: string;
  marketOpportunity: string;
  competitiveLandscape: string;
  teamFitScore: number;             // 1–10
  feasibility: string;
  first90Days: string;
  revenueTimeline: string;
  riskLevel: string;
  industry: string;
}
```

---

## Email System

The email module (`src/lib/email/`) uses **Resend** for transactional email delivery.

### Templates

| Template | Trigger | Content |
|---|---|---|
| `invitationEmail` | Partner invited to team | Team name, inviter name, one-click accept link, 7-day expiry note |
| `assessmentReminderEmail` | Partner hasn't completed assessment | Team name, direct link to assessment |
| `reportReadyEmail` | Compatibility report generated | Team name, link to report |

### Development Mode

When `RESEND_API_KEY` is not set, all emails are logged to the console with `[DEV EMAIL]` prefix, showing the recipient and subject line. No emails are actually sent.

---

## Security

### Content Security Policy (CSP)

The middleware generates a cryptographic **nonce** per request using `crypto.randomUUID()`. This nonce is:

- Injected into the CSP header as `script-src 'self' 'nonce-{n}' 'strict-dynamic'`
- Passed to the root layout via the `x-nonce` response header
- Used by Next.js to authorize inline scripts

This eliminates the need for `'unsafe-inline'` and `'unsafe-eval'`.

### Other Security Headers

Set in `next.config.ts` for all routes:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `X-DNS-Prefetch-Control` | `on` |

### Authentication & Authorization

- All dashboard routes are protected by middleware — unauthenticated users are redirected to `/login`.
- Every server action verifies the user's session and team membership before performing operations.
- Team creator role is required for invitation management.
- Assessment ownership is enforced — users can only modify their own assessments.
- Completed assessments are immutable.

### Anonymity

- Individual assessment responses are **never** exposed to other team members.
- Responses are anonymized as "Partner A", "Partner B", etc. before being sent to the AI.
- Venture ratings are aggregated — individual scores are never shown.
- The `getTeamAssessmentStatus` action returns only completion status, not answer content.

### Input Validation

- All form inputs are validated with Zod schemas on the server side.
- AI-generated JSON is validated against Zod schemas before database insertion.
- Prisma handles SQL injection prevention through parameterized queries.

---

## Rate Limiting

Expensive AI operations are rate-limited to prevent abuse:

| Operation | Limit | Window |
|---|---|---|
| Report generation | 3 requests | 10 minutes |
| Venture idea generation | 5 requests | 10 minutes |

### Implementation

The rate limiter has two backends:

1. **Redis (production)**: Uses `@upstash/ratelimit` with sliding-window algorithm. Automatically activated when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. Works across multiple server instances.

2. **In-memory (development)**: Sliding-window implementation using a `Map` with periodic cleanup. Used when Redis credentials are not configured. Suitable for single-instance deployments.

The switch is transparent — the same `rateLimit(key, opts)` API is used by server actions regardless of the backend.

---

## Testing

### Unit & Integration Tests (Vitest)

```bash
# Run all tests once
npm test

# Run in watch mode
npm run test:watch
```

The test suite contains **70 tests** across 10 files:

| Category | Files | Tests | What's Tested |
|---|---|---|---|
| **Server Action Integration** | `invitations.test.ts`, `assessment.test.ts`, `privacy.test.ts` | 29 | Auth gating, validation, authorization, business rules, data flow |
| **Rate Limiting** | `rate-limit.test.ts` | 5 | Window enforcement, cooldown recovery, user isolation, retry timing |
| **Zod Validation** | `schemas.test.ts` | 11 | Report schema, scores schema, venture input schema, venture selection schema |
| **AI Prompt Builders** | `compatibility.test.ts`, `venture.test.ts` | 10 | Prompt structure, anonymization, data inclusion |
| **Assessment Data Contracts** | `questions.test.ts`, `venture-questions.test.ts` | 10 | Section structure, required fields, question type validity, UI rendering contracts |
| **Scheduling** | `scheduling.test.ts` | 5 | Next-due computation for all frequencies |

### Test Infrastructure

Server action tests use **module aliasing** in `vitest.config.ts` to replace heavy dependencies:

| Module | Mock |
|---|---|
| `@/lib/db` | `vitest-mock-extended` deep mock of PrismaClient |
| `@/lib/auth` | Vitest function mock for `auth()` |
| `@/lib/email` | Vitest function mocks for `sendEmail` and template functions |
| `next/navigation` | Mock `redirect` that throws `NEXT_REDIRECT` |
| `next/server` | Stub `NextRequest` / `NextResponse` |

### Living Documentation (Cucumber)

The Gherkin feature files serve as both specifications and executable living documentation:

```bash
# Run feature tests with summary output
npm run features

# Run and generate HTML report
npm run features:report
```

The HTML report is generated at `reports/cucumber-report.html`.

**16 feature files** organized by domain:

| Domain | Features |
|---|---|
| **Cross-Cutting** | Authentication, Data Privacy, Multi-Partner Support, Non-Functional Requirements, Notifications |
| **Partnership** | Anonymous Responses, Compatibility Report, Deep Assessment, Ongoing Reassessment, Trend Tracking |
| **Team** | Team Creation, Partner Invitation |
| **Venture** | Idea Generation, Idea Rating, Venture Inputs, Venture Selection |

Step definitions wire Gherkin scenarios to the actual business logic layer — assessment question structures, AI prompt builders, Zod validation schemas, and the scheduling module. Steps requiring database interaction are marked as pending/undefined.

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Start development server with hot reload |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |
| `npm test` | `vitest run` | Run all unit/integration tests |
| `npm run test:watch` | `vitest` | Run tests in watch mode |
| `npm run features` | `cucumber-js` | Run Gherkin feature tests |
| `npm run features:report` | `cucumber-js --format html:...` | Run features and generate HTML report |
| `npm run db:push` | `prisma db push` | Push schema to database (no migration) |
| `npm run db:migrate` | `prisma migrate dev` | Run database migrations |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio GUI |
| `npm run db:generate` | `prisma generate` | Regenerate Prisma client |

---

## Deployment

### Production Checklist

1. **Database**: Provision a PostgreSQL 16+ instance (e.g. Neon, Supabase, AWS RDS).
2. **Environment**: Set all required env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AI_PROVIDER`, API key).
3. **Rate Limiting**: Create an Upstash Redis instance and set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
4. **Email**: Set `RESEND_API_KEY` and configure `EMAIL_FROM` with a verified domain.
5. **OAuth** (optional): Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. **Build**: `npm run build` — the build validates TypeScript and produces an optimized bundle.
7. **Database Schema**: `npm run db:push` or `npm run db:migrate` against the production database.
8. **Start**: `npm start` (or deploy to Vercel, which handles this automatically).

### Vercel Deployment

The app is fully compatible with Vercel's platform:

- Server Actions and Middleware run as serverless/edge functions.
- Set all environment variables in the Vercel dashboard.
- The `@prisma/adapter-pg` adapter works with Vercel's serverless PostgreSQL connections.
- Upstash Redis provides edge-compatible rate limiting.

---

## Configuration Reference

### `next.config.ts`

Configures security response headers applied to all routes. CSP is handled dynamically in middleware.

### `vitest.config.ts`

Configures Vitest with module aliases to mock Next.js, Prisma, and auth dependencies during testing. Aliases are ordered so that specific paths (e.g. `@/lib/auth`) match before the general `@` → `src` alias.

### `cucumber.js`

Configures Cucumber.js to use `tsx` for TypeScript transpilation, scan `features/**/*.feature` for scenarios, and output both a summary and an HTML report.

### `tsconfig.json`

TypeScript strict mode with `bundler` module resolution. Excludes `features/` and `node_modules` from compilation. Path alias `@/*` maps to `./src/*`.

### `docker-compose.yml`

Runs PostgreSQL 16 Alpine with persistent volume. Default credentials: `postgres`/`postgres`, database: `startup_ideator`, port: `5432`.

---

## License

This project is private and not licensed for redistribution.
