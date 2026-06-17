// components/bracket/types.ts

export interface BracketMatch {
  id: string;
  stage: string | null; // ← nullable để match với Prisma type
  group: string | null;
  status: string;
  utcDate: Date;
  homeTeamName: string | null;
  homeTeamCode: string | null;
  homeTeamCrest: string | null;
  awayTeamName: string | null;
  awayTeamCode: string | null;
  awayTeamCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
}

export const STAGE_ORDER = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  LAST_32: "Vòng 32",
  LAST_16: "Vòng 16",
  QUARTER_FINALS: "Tứ Kết",
  SEMI_FINALS: "Bán Kết",
  THIRD_PLACE: "Tranh Hạng 3",
  FINAL: "Chung Kết",
};

export const GROUP_LABELS: Record<string, string> = {
  GROUP_A: "Bảng A",
  GROUP_B: "Bảng B",
  GROUP_C: "Bảng C",
  GROUP_D: "Bảng D",
  GROUP_E: "Bảng E",
  GROUP_F: "Bảng F",
  GROUP_G: "Bảng G",
  GROUP_H: "Bảng H",
  GROUP_I: "Bảng I",
  GROUP_J: "Bảng J",
  GROUP_K: "Bảng K",
  GROUP_L: "Bảng L",
};
