// lib/team-names.ts

export const TEAM_COUNTRY_NAMES: Record<string, string> = {
  // Group A
  USA: "Hoa Kỳ",
  MEX: "Mexico",
  CAN: "Canada",

  // Group B
  ARG: "Argentina",
  CHI: "Chile",
  PER: "Peru",

  // Group C
  BRA: "Brazil",
  URU: "Uruguay",
  COL: "Colombia",

  // Group D
  ENG: "Anh",
  FRA: "Pháp",
  AUT: "Áo",

  // Group E
  GER: "Đức",
  NED: "Hà Lan",
  SCO: "Scotland",

  // Group F
  ESP: "Tây Ban Nha",
  POR: "Bồ Đào Nha",
  CRO: "Croatia",

  // Group G
  BEL: "Bỉ",
  TUR: "Thổ Nhĩ Kỳ",
  UKR: "Ukraina",

  // Group H
  MAR: "Ma Rốc",
  SEN: "Senegal",
  TUN: "Tunisia",

  // Group I
  JPN: "Nhật Bản",
  KOR: "Hàn Quốc",
  AUS: "Úc",

  // Group J
  KSA: "Ả Rập Xê Út",
  IRN: "Iran",
  IRQ: "Iraq",

  // Group K
  NGA: "Nigeria",
  CMR: "Cameroon",
  RSA: "Nam Phi",

  // Group L
  MEX2: "Mexico",
  ECU: "Ecuador",
  HON: "Honduras",

  // Others
  BIH: "Bosnia và Herzegovina",
  SUI: "Thụy Sĩ",
  DEN: "Đan Mạch",
  SWE: "Thụy Điển",
  NOR: "Na Uy",
  POL: "Ba Lan",
  CZE: "Séc",
  SVK: "Slovakia",
  HUN: "Hungary",
  ROU: "Romania",
  SRB: "Serbia",
  SVN: "Slovenia",
  ALB: "Albania",
  GEO: "Georgia",

  VEN: "Venezuela",
  BOL: "Bolivia",
  PAR: "Paraguay",
  PAN: "Panama",
  CRC: "Costa Rica",
  GTM: "Guatemala",
  JAM: "Jamaica",

  NZL: "New Zealand",

  IDN: "Indonesia",
  THA: "Thái Lan",
  CHN: "Trung Quốc",
  IND: "Ấn Độ",

  HAI: "Haiti",

  QAT: "Qatar",
  UAE: "Các Tiểu vương quốc Ả Rập Thống nhất",
  JOR: "Jordan",

  EGY: "Ai Cập",
  ALG: "Algeria",
  CIV: "Bờ Biển Ngà",
  GHA: "Ghana",
  COD: "CHDC Congo",
  AGO: "Angola",
  ZIM: "Zimbabwe",
  TAN: "Tanzania",

  CPV: "Cape Verde",
  COM: "Comoros",
  CUW: "Curaçao",
};

// Hàm helper — fallback về tên team nếu không có trong map
export function getCountryName(
  code: string | null,
  fallback: string | null,
): string {
  if (!code) return fallback ?? "TBD";
  return TEAM_COUNTRY_NAMES[code] ?? fallback ?? code;
}
