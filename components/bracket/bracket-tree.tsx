import React from "react";
import BracketMatchCard from "./bracket-match-card";
import type { BracketMatch } from "./types";
import { STAGE_ORDER, STAGE_LABELS } from "./types";


const CARD_W = 180;
const CONNECTOR_W = 32;
const SLOT_H = 96; // vertical space per match in the first (widest) round
const LABEL_H = 36;

export default function BracketTree({ matches }: { matches: BracketMatch[] }) {
  const byStage: Record<string, BracketMatch[]> = {};
  for (const m of matches) {
    if (!m.stage) continue;
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }

  const thirdPlaceMatches = byStage["THIRD_PLACE"] ?? [];
  const mainStages = STAGE_ORDER.filter(
    (s) => byStage[s] && s !== "THIRD_PLACE",
  );

  if (mainStages.length === 0) return null;

  const firstRoundCount = byStage[mainStages[0]].length;
  const totalH = firstRoundCount * SLOT_H;
  const totalW =
    mainStages.length * CARD_W + (mainStages.length - 1) * CONNECTOR_W;

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: totalW, width: totalW }}>
          {/* Stage label row */}
          <div className="flex" style={{ height: LABEL_H }}>
            {mainStages.map((stage, i) => (
              <React.Fragment key={stage}>
                <div
                  className="flex items-center justify-center"
                  style={{ width: CARD_W }}
                >
                  <span
                    className="text-xs uppercase tracking-widest font-bold"
                    style={{
                      color:
                        stage === "FINAL"
                          ? "var(--primary)"
                          : "var(--outline)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {STAGE_LABELS[stage] ?? stage}
                  </span>
                </div>
                {i < mainStages.length - 1 && (
                  <div style={{ width: CONNECTOR_W }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bracket columns + connectors */}
          <div className="flex" style={{ height: totalH }}>
            {mainStages.map((stage, colIdx) => {
              const stageMatches = byStage[stage];
              const matchCount = stageMatches.length;

              return (
                <React.Fragment key={stage}>
                  {/* Match column */}
                  <div
                    style={{
                      width: CARD_W,
                      height: totalH,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-around",
                    }}
                  >
                    {stageMatches.map((match) => (
                      <div key={match.id} className="flex justify-center">
                        <BracketMatchCard match={match} />
                      </div>
                    ))}
                  </div>

                  {/* Connector lines to next column */}
                  {colIdx < mainStages.length - 1 && (
                    <ConnectorColumn
                      matchCount={matchCount}
                      totalH={totalH}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Third place shown separately below the main bracket */}
      {thirdPlaceMatches.length > 0 && (
        <div
          className="mt-6 pt-5 border-t"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <p
            className="text-xs uppercase tracking-widest font-bold mb-3"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            {STAGE_LABELS["THIRD_PLACE"]}
          </p>
          <BracketMatchCard match={thirdPlaceMatches[0]} />
        </div>
      )}
    </div>
  );
}

// Draws bracket connector lines between two adjacent round columns.
// Uses absolute-positioned divs for the top arm, bottom arm, vertical bar,
// and center arm — one set per pair of matches.
function ConnectorColumn({
  matchCount,
  totalH,
}: {
  matchCount: number;
  totalH: number;
}) {
  const pairCount = Math.floor(matchCount / 2);
  // slotH is the height allocated per match in this round under justify-around
  const slotH = totalH / matchCount;
  const pairH = slotH * 2;
  const midX = CONNECTOR_W / 2;

  return (
    <div
      style={{
        width: CONNECTOR_W,
        height: totalH,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {Array.from({ length: pairCount }).map((_, j) => {
        // Center Y of the two source matches and the destination match
        const topY = j * pairH + slotH / 2;
        const botY = j * pairH + slotH + slotH / 2;
        const midY = j * pairH + pairH / 2;

        return (
          <React.Fragment key={j}>
            {/* Arm from top match */}
            <div
              style={{
                position: "absolute",
                top: topY,
                left: 0,
                width: midX,
                height: 1,
                background: "var(--outline-variant)",
              }}
            />
            {/* Arm from bottom match */}
            <div
              style={{
                position: "absolute",
                top: botY,
                left: 0,
                width: midX,
                height: 1,
                background: "var(--outline-variant)",
              }}
            />
            {/* Vertical bar joining the two arms */}
            <div
              style={{
                position: "absolute",
                top: topY,
                left: midX,
                width: 1,
                height: botY - topY,
                background: "var(--outline-variant)",
              }}
            />
            {/* Arm pointing right to next-round match */}
            <div
              style={{
                position: "absolute",
                top: midY,
                left: midX,
                width: midX,
                height: 1,
                background: "var(--outline-variant)",
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
