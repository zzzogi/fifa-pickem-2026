// lib/football-api.ts

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
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
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
