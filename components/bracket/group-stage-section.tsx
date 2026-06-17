// components/bracket/group-stage-section.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { BracketMatch } from "./types";
import { GROUP_LABELS } from "./types";
import { getCountryName } from "@/lib/team-names";

function GroupTable({
  groupName,
  matches,
}: {
  groupName: string;
  matches: BracketMatch[];
}) {
  const teamMap = new Map<
    string,
    {
      name: string;
      code: string | null;
      crest: string | null;
      w: number;
      d: number;
      l: number;
      gf: number;
      ga: number;
      pts: number;
    }
  >();

  for (const m of matches) {
    if (!m.homeTeamName || !m.awayTeamName) continue;
    for (const [teamName, code, crest] of [
      [m.homeTeamName, m.homeTeamCode, m.homeTeamCrest],
      [m.awayTeamName, m.awayTeamCode, m.awayTeamCrest],
    ] as [string, string | null, string | null][]) {
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, {
          name: teamName,
          code,
          crest,
          w: 0,
          d: 0,
          l: 0,
          gf: 0,
          ga: 0,
          pts: 0,
        });
      }
    }
    if (m.status !== "FINISHED" || m.homeScore === null || m.awayScore === null)
      continue;
    const home = teamMap.get(m.homeTeamName)!;
    const away = teamMap.get(m.awayTeamName)!;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.w++;
      home.pts += 3;
      away.l++;
    } else if (m.homeScore < m.awayScore) {
      away.w++;
      away.pts += 3;
      home.l++;
    } else {
      home.d++;
      home.pts++;
      away.d++;
      away.pts++;
    }
  }

  const standings = [...teamMap.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga,
      gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  return (
    <div className="card-sports overflow-hidden">
      {/* Group header */}
      <div
        className="px-4 py-2.5 border-b"
        style={{
          background: "var(--secondary)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <span
          className="text-sm font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {GROUP_LABELS[groupName] ?? groupName}
        </span>
      </div>

      {/* Standings */}
      <table className="w-full text-xs">
        <thead>
          <tr
            style={{
              background: "var(--surface-soft)",
              borderBottom: "1px solid var(--outline-variant)",
            }}
          >
            <th
              className="text-left px-4 py-1.5 font-bold uppercase tracking-wide"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              Đội
            </th>
            <th
              className="text-center px-2 py-1.5 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              T
            </th>
            <th
              className="text-center px-2 py-1.5 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              H
            </th>
            <th
              className="text-center px-2 py-1.5 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              B
            </th>
            <th
              className="text-center px-2 py-1.5 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              HS
            </th>
            <th
              className="text-center px-3 py-1.5 font-bold"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Đ
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr
              key={team.name}
              style={{
                borderBottom: "1px solid var(--outline-variant)",
                background: i < 2 ? "var(--surface-soft)" : "transparent",
              }}
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-3 flex-shrink-0"
                    style={{
                      color: i < 2 ? "var(--primary)" : "var(--outline)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {team.crest && (
                    <Image
                      src={team.crest}
                      alt={team.name}
                      width={16}
                      height={16}
                      className="object-contain flex-shrink-0"
                    />
                  )}
                  <span
                    className="font-bold truncate"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {getCountryName(team.code, team.name)}
                  </span>
                </div>
              </td>
              <td
                className="text-center px-2 py-2 tabular-nums"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {team.w}
              </td>
              <td
                className="text-center px-2 py-2 tabular-nums"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {team.d}
              </td>
              <td
                className="text-center px-2 py-2 tabular-nums"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {team.l}
              </td>
              <td
                className="text-center px-2 py-2 tabular-nums"
                style={{
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {team.gf}-{team.ga}
              </td>
              <td
                className="text-center px-3 py-2 tabular-nums font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--primary)",
                  fontSize: "0.9rem",
                }}
              >
                {team.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Matches */}
      <div style={{ borderTop: "2px solid var(--outline-variant)" }}>
        {matches.map((m) => {
          const isFinished = m.status === "FINISHED";
          const isLive = m.status === "IN_PLAY" || m.status === "PAUSED";
          const kickoff = new Date(m.utcDate).toLocaleString("vi-VN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
          });
          return (
            <div
              key={m.id}
              className="px-4 py-2 flex items-center gap-2 text-xs"
              style={{
                borderBottom: "1px solid var(--outline-variant)",
                background: isLive ? "rgba(213,43,30,0.04)" : "transparent",
              }}
            >
              <span
                className="flex-1 text-right font-bold truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  color:
                    m.winner === "HOME_TEAM"
                      ? "var(--primary)"
                      : "var(--foreground)",
                }}
              >
                {getCountryName(m.homeTeamCode, m.homeTeamName)}
              </span>
              <span
                className="px-2 py-0.5 rounded tabular-nums font-bold text-center flex-shrink-0"
                style={{
                  minWidth: "56px",
                  background:
                    isFinished || isLive
                      ? "var(--surface-muted)"
                      : "var(--surface-soft)",
                  color: isLive ? "var(--live)" : "var(--foreground)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {isFinished || isLive
                  ? `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`
                  : kickoff}
              </span>
              <span
                className="flex-1 font-bold truncate"
                style={{
                  fontFamily: "var(--font-body)",
                  color:
                    m.winner === "AWAY_TEAM"
                      ? "var(--primary)"
                      : "var(--foreground)",
                }}
              >
                {getCountryName(m.awayTeamCode, m.awayTeamName)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GroupStageSection({
  matches,
}: {
  matches: BracketMatch[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  const byGroup = matches.reduce<Record<string, BracketMatch[]>>((acc, m) => {
    const key = m.group ?? "UNKNOWN";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const groupKeys = Object.keys(byGroup).sort();

  return (
    <section>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between pb-2 border-b mb-4"
        style={{
          borderColor: "var(--outline-variant)",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <h2
          className="text-xs uppercase tracking-widest font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Vòng Bảng · {groupKeys.length} bảng
        </h2>
        <span
          style={{
            color: "var(--outline)",
            fontSize: "12px",
            display: "inline-block",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupKeys.map((group) => (
            <GroupTable
              key={group}
              groupName={group}
              matches={byGroup[group]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
