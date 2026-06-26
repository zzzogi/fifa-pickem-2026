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

1. **Cron: `sync-matches`** — fetches live match data from Football Data API → upserts `Match` rows; team fields are nullable for knockout rounds where opponents aren't yet determined
2. **Cron: `calculate-points`** — scores finished `Pick` rows (where `scoredAt IS NULL`), updates streaks, unlocks achievements. Uses `$executeRawUnsafe` bulk `UPDATE … FROM (VALUES …)` to stay within Vercel Hobby's 300s limit (`maxDuration = 300`)
3. **Cron: `send-daily-emails`** — sends daily summaries via Brevo (300/day cap) after all day's matches finish
4. **User picks** — `POST /api/picks` saves/upserts predictions; only allowed before match kickoff

All cron routes (`/api/cron/*`) require `Authorization: Bearer <CRON_SECRET>` header.

### Key modules

| Path | Purpose |
|------|---------|
| `lib/scoring.ts` | Point calculation logic (`calculatePickScore`, `calculateStreakBonus`, `updateStreak`) |
| `lib/achievements.ts` | 18 achievement types; exposes both single-user (`buildAchievementContext` / `checkAndUnlockAchievements`) and batch APIs (`buildAchievementContextsBatch` / `checkAndUnlockAchievementsBatch`) — cron always uses batch |
| `lib/leaderboard.ts` | Fetches all users, computes stats in memory, sorts with tie-breaking: totalPoints → correctPicks → exactScores |
| `lib/pick-distribution.ts` | Per-match home/away/draw vote counts shown on the picks page |
| `lib/stats.ts` | Aggregated pick statistics for the `/stats` page |
| `lib/tournament-stats.ts` | Tournament-wide stats (goals, top scorers, etc.) |
| `lib/team-names.ts` | Vietnamese team name overrides |
| `lib/football-api.ts` | Football Data API wrapper (5-min cache) |
| `lib/email.ts` | Brevo integration + HTML template rendering |
| `lib/daily-summary.ts` | Builds per-user email content with smart subject lines |
| `lib/cron-auth.ts` | Verifies `CRON_SECRET` on cron routes |
| `auth.ts` | NextAuth config (Google provider, Prisma adapter) |

### Route groups

- `app/(dashboard)/` — authenticated pages: `/picks`, `/leaderboard`, `/bracket`, `/profile/[userId]`, `/stats`, `/rules`, `/support`
- `app/api/cron/` — sync-matches, calculate-points, send-daily-emails
- `app/api/picks/` — upsert user prediction
- `app/api/unsubscribe/` — email opt-out via token

Public paths (no auth): `/` and `/rules` (configured in middleware CSP headers).

### Scoring rules

- Exact score: **3 pts**
- Correct winner/draw: **1 pt**
- Streak bonuses on consecutive correct picks: +1 (streak 3–4), +2 (streak 5–7), +3 (streak 8+)
- **Star of Hope** (`Pick.isStarOfHope`): user can mark one pick as a "star"; if correct winner → flat +2 bonus on top of normal points + streak; if wrong → −2 points

### Database

Two `DATABASE_URL` / `DIRECT_URL` env vars are required: pooled connection for runtime, direct for migrations (`prisma migrate`). Key models: `User`, `Match`, `Pick`, `Achievement`, `UserAchievement`, plus NextAuth tables (`Account`, `Session`).

`Pick.scoredAt` is null until `calculate-points` processes it — this is the idempotency guard: the cron only scores picks where `scoredAt IS NULL` and the match is `FINISHED`.

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
