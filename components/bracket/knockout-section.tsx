// components/bracket/knockout-section.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { BracketMatch } from "./types";
import { STAGE_ORDER, STAGE_LABELS } from "./types";

// ─────────────────────────────────────────
// Single match row trong knockout list
// ─────────────────────────────────────────

function KnockoutMatchRow({ match }: { match: BracketMatch }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isTBD = !match.homeTeamName || !match.awayTeamName;

  const kickoff = new Date(match.utcDate).toLocaleString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  function TeamCell({
    name,
    code,
    crest,
    score,
    isWinner,
  }: {
    name: string | null;
    code: string | null;
    crest: string | null;
    score: number | null;
    isWinner: boolean;
  }) {
    const tbd = !name;
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
          {crest && !tbd ? (
            <Image
              src={crest}
              alt={name ?? ""}
              width={28}
              height={28}
              className="object-contain"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--surface-muted)",
                color: "var(--outline)",
              }}
            >
              {tbd ? "?" : (code?.charAt(0) ?? "?")}
            </div>
          )}
        </div>
        <span
          className="font-bold truncate text-sm"
          style={{
            fontFamily: "var(--font-display)",
            color: tbd
              ? "var(--outline)"
              : isWinner
                ? "var(--primary)"
                : "var(--foreground)",
            letterSpacing: "0.02em",
          }}
        >
          {tbd ? "TBD" : (code ?? name ?? "TBD")}
        </span>
        {score !== null && (
          <span
            className="ml-auto font-bold tabular-nums text-base flex-shrink-0"
            style={{
              fontFamily: "var(--font-display)",
              color: isWinner ? "var(--primary)" : "var(--foreground)",
            }}
          >
            {score}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="card-sports overflow-hidden transition-shadow hover:shadow-sm"
      style={{
        borderColor: isLive ? "var(--live)" : undefined,
        borderWidth: isLive ? "1.5px" : undefined,
      }}
    >
      {/* Status bar */}
      <div
        className="px-4 py-1.5 flex items-center justify-between"
        style={{
          background: isLive
            ? "var(--live)"
            : isFinished
              ? "var(--surface-muted)"
              : "var(--surface-soft)",
          borderBottom: "1px solid var(--outline-variant)",
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{
            color: isLive ? "white" : "var(--outline)",
            fontFamily: "var(--font-body)",
          }}
        >
          {isLive ? "🔴 Đang trực tiếp" : isFinished ? "Đã kết thúc" : kickoff}
        </span>
        {(isFinished || isLive) && (
          <span
            className="text-xs"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            {kickoff}
          </span>
        )}
      </div>

      {/* Match content */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {/* Home team */}
        <TeamCell
          name={match.homeTeamName}
          code={match.homeTeamCode}
          crest={match.homeTeamCrest}
          score={isFinished || isLive ? match.homeScore : null}
          isWinner={match.winner === "HOME_TEAM"}
        />

        {/* Divider with VS */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-px"
            style={{ background: "var(--outline-variant)" }}
          />
          <span
            className="text-xs font-bold uppercase tracking-widest flex-shrink-0"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            {isTBD ? "TBD" : !isFinished && !isLive ? "VS" : "–"}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "var(--outline-variant)" }}
          />
        </div>

        {/* Away team */}
        <TeamCell
          name={match.awayTeamName}
          code={match.awayTeamCode}
          crest={match.awayTeamCrest}
          score={isFinished || isLive ? match.awayScore : null}
          isWinner={match.winner === "AWAY_TEAM"}
        />
      </div>

      {/* Winner banner */}
      {isFinished && match.winner && match.winner !== "DRAW" && (
        <div
          className="px-4 py-1.5 border-t"
          style={{
            background: "var(--primary-soft)",
            borderColor: "var(--outline-variant)",
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--primary)", fontFamily: "var(--font-body)" }}
          >
            🏆 Đi tiếp:{" "}
            {match.winner === "HOME_TEAM"
              ? (match.homeTeamCode ?? match.homeTeamName)
              : (match.awayTeamCode ?? match.awayTeamName)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Stage group — collapsible
// ─────────────────────────────────────────

function StageGroup({
  stage,
  matches,
}: {
  stage: string;
  matches: BracketMatch[];
}) {
  const finishedCount = matches.filter((m) => m.status === "FINISHED").length;
  const liveCount = matches.filter(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED",
  ).length;
  const allDone = finishedCount === matches.length;
  const hasLive = liveCount > 0;

  const [isOpen, setIsOpen] = useState(!allDone || hasLive);

  // FINAL + THIRD_PLACE: 1 cột full width, còn lại: grid 2 cột
  const isSingleColumn = stage === "FINAL" || stage === "THIRD_PLACE";

  return (
    <section>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between pb-2 border-b mb-3"
        style={{
          borderColor: "var(--outline-variant)",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-2">
          <h3
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            {STAGE_LABELS[stage] ?? stage}
          </h3>

          {hasLive && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                background: "var(--live)",
                color: "white",
                fontFamily: "var(--font-body)",
              }}
            >
              🔴 Trực tiếp
            </span>
          )}

          {allDone && !hasLive && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "var(--surface-muted)",
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              ✓ Hoàn thành
            </span>
          )}

          {!allDone && !hasLive && (
            <span
              className="text-xs"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              {finishedCount}/{matches.length} trận
            </span>
          )}
        </div>

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
        <div
          className={
            isSingleColumn
              ? "max-w-md"
              : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {matches.map((m) => (
            <KnockoutMatchRow key={m.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────
// Main KnockoutSection
// ─────────────────────────────────────────

export default function KnockoutSection({
  matches,
}: {
  matches: BracketMatch[];
}) {
  if (matches.length === 0) {
    return (
      <div className="card-sports p-8 text-center">
        <p
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chưa có dữ liệu
        </p>
        <p
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
          }}
        >
          Vòng loại trực tiếp sẽ bắt đầu sau khi vòng bảng kết thúc.
        </p>
      </div>
    );
  }

  // Group theo stage, giữ đúng thứ tự
  const byStage = matches.reduce<Record<string, BracketMatch[]>>((acc, m) => {
    if (!m.stage) return acc;
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage!].push(m);
    return acc;
  }, {});

  // Sort stage theo STAGE_ORDER, stage lạ thì bỏ cuối
  const orderedStages = [
    ...STAGE_ORDER.filter((s) => byStage[s]),
    ...Object.keys(byStage).filter(
      (s) => !STAGE_ORDER.includes(s as (typeof STAGE_ORDER)[number]),
    ),
  ];

  return (
    <div className="space-y-8">
      {orderedStages.map((stage) => (
        <StageGroup key={stage} stage={stage} matches={byStage[stage]} />
      ))}
    </div>
  );
}
