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
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
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
