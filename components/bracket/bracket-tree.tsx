import React from "react";
import BracketMatchCard from "./bracket-match-card";
import type { BracketMatch } from "./types";
import { STAGE_ORDER, STAGE_LABELS } from "./types";

const CARD_W = 180;
const CONNECTOR_W = 32;
// Must exceed actual card height (~116 px) so every slot has positive free
// space and each card's center lands exactly at (i + 0.5) * slotH.
const SLOT_H = 128;
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
              // Vertical space per match in this column.
              // Because totalH is fixed, later rounds have proportionally
              // larger slots — cards spread out as rounds advance.
              const slotH = totalH / matchCount;

              return (
                <React.Fragment key={stage}>
                  {/* Match column — absolute positioning guarantees each
                      card's vertical center is exactly (i + 0.5) * slotH,
                      which the connector column relies on. */}
                  <div
                    style={{
                      width: CARD_W,
                      height: totalH,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {stageMatches.map((match, i) => (
                      <div
                        key={match.id}
                        style={{
                          position: "absolute",
                          top: (i + 0.5) * slotH,
                          left: 0,
                          right: 0,
                          // Center the card on that Y coordinate regardless
                          // of actual card height.
                          transform: "translateY(-50%)",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
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

// Draws the ├─┤ style connector between two adjacent round columns.
//
// Each pair of left-column matches (indices 2j, 2j+1) feeds into one
// right-column match (index j).  All Y coordinates are computed from
// slotH = totalH / matchCount, which is the same formula used by the
// match column's absolute-positioned cards, so the lines land exactly
// on each card's vertical center.
function ConnectorColumn({
  matchCount,
  totalH,
}: {
  matchCount: number;
  totalH: number;
}) {
  const pairCount = Math.floor(matchCount / 2);
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
        // Y centers of the two source matches in the left column
        const topY = j * pairH + slotH / 2;       // = (2j + 0.5) * slotH
        const botY = j * pairH + slotH + slotH / 2; // = (2j + 1.5) * slotH
        // Y center of the destination match in the right column
        // slotH_right = 2 * slotH, so center_j = (j + 0.5) * 2 * slotH
        const midY = j * pairH + pairH / 2;       // = (2j + 1) * slotH

        return (
          <React.Fragment key={j}>
            {/* Horizontal arm — top source match → vertical bar */}
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
            {/* Horizontal arm — bottom source match → vertical bar */}
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
            {/* Vertical bar joining the two horizontal arms */}
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
            {/* Horizontal arm — vertical bar → destination match */}
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
