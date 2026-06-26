# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Next.js + Turbopack)
npm run build      # prisma generate + next build
npm run lint       # ESLint
npm run seed       # Seed database via prisma/seed.ts
```

No automated test suite — verify changes by running the dev server.

## Architecture

FIFA World Cup 2026 pick'em game built with Next.js App Router. Users predict match scores, earn points, and compete on a leaderboard. UI is in Vietnamese.

**Stack:** Next.js 16, React 19, TailwindCSS 4, Prisma 6 on Supabase (PostgreSQL), NextAuth v4 (Google OAuth), React Query, Brevo (email), Football Data API.

### Data flow

1. **Cron: `sync-matches`** — fetches live match data from Football Data API → updates `Match` table
2. **Cron: `calculate-points`** — scores finished `Pick` rows (3 pts exact, 1 pt correct winner), updates streaks, unlocks achievements
3. **Cron: `send-daily-emails`** — sends daily summaries via Brevo (300/day cap) after all day's matches finish
4. **User picks** — `POST /api/picks` saves/upserts predictions; only allowed before match kickoff

All cron routes (`/api/cron/*`) require `Authorization: Bearer <CRON_SECRET>` header.

### Key modules

| Path | Purpose |
|------|---------|
| `lib/scoring.ts` | Point calculation logic |
| `lib/achievements.ts` | 15 achievement types with unlock conditions |
| `lib/leaderboard.ts` | Leaderboard ranking queries |
| `lib/football-api.ts` | Football Data API wrapper (5-min cache) |
| `lib/email.ts` | Brevo integration + HTML template rendering |
| `lib/daily-summary.ts` | Builds per-user email content with smart subject lines |
| `lib/cron-auth.ts` | Verifies `CRON_SECRET` on cron routes |
| `auth.ts` | NextAuth config (Google provider, Prisma adapter) |
| `middleware.ts` | Auth protection + CSP headers; public paths: `/` and `/rules` |

### Route groups

- `app/(dashboard)/` — authenticated pages: `/picks`, `/leaderboard`, `/bracket`, `/profile/[userId]`, `/stats`, `/rules`, `/support`
- `app/api/cron/` — sync-matches, calculate-points, send-daily-emails
- `app/api/picks/` — upsert user prediction
- `app/api/unsubscribe/` — email opt-out via token

### Scoring rules

- Exact score: **3 pts**
- Correct winner/draw: **1 pt**
- Streak bonuses on consecutive correct picks: +1 (streak 3–4), +2 (streak 5–7), +3 (streak 8+)

### Database

Two `DATABASE_URL` / `DIRECT_URL` env vars are required: pooled connection for runtime, direct for migrations (`prisma migrate`). Key models: `User`, `Match`, `Pick`, `Achievement`, `UserAchievement`, plus NextAuth tables (`Account`, `Session`).

### Environment variables

```
DATABASE_URL, DIRECT_URL           # Supabase PostgreSQL
AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
NEXT_PUBLIC_SITE_URL
FOOTBALL_DATA_API_KEY
CRON_SECRET
BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
NEXT_PUBLIC_GA_ID
```
