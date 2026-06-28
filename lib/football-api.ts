// lib/football-api.ts

// Real API responses have used both "home"/"away" and "homeTeam"/"awayTeam" naming
// depending on match type. Always check both to be safe.
export interface ScoreValues {
  home?: number | null;
  away?: number | null;
  homeTeam?: number | null;
  awayTeam?: number | null;
  [key: string]: unknown;
}

export function scoreHome(s: ScoreValues | null | undefined): number | null {
  return s?.homeTeam ?? s?.home ?? null;
}

export function scoreAway(s: ScoreValues | null | undefined): number | null {
  return s?.awayTeam ?? s?.away ?? null;
}

export type MatchStatus =
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SCHEDULED";

export interface FootballMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: {
    id: number | null; // ← nullable
    name: string | null; // ← nullable
    shortName: string | null;
    tla: string | null;
    crest: string | null;
  } | null; // ← cả object có thể null
  awayTeam: {
    id: number | null;
    name: string | null;
    shortName: string | null;
    tla: string | null;
    crest: string | null;
  } | null;
  // score shape varies by match status, stage, and competition — treat ALL sub-fields
  // as optional. Real API responses have used both "home"/"away" AND "homeTeam"/"awayTeam"
  // field names depending on the match type, so both are typed and callers must handle both.
  score?: {
    winner?: string | null;
    // Known values: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" — but treat as unknown string
    duration?: string | null;
    fullTime?: ScoreValues | null;
    halfTime?: ScoreValues | null;
    regularTime?: ScoreValues | null;
    extraTime?: ScoreValues | null;
    penalties?: ScoreValues | null;
    [key: string]: unknown; // preserve fields we don't know about yet
  };
  lastUpdated: string;
}

export async function fetchWorldCupMatches(): Promise<FootballMatch[]> {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!,
      },
      // Cache 5 phút — đủ fresh cho match status
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) {
    throw new Error(`Football API error: ${res.status}`);
  }

  const data = await res.json();
  return data.matches as FootballMatch[];
}
