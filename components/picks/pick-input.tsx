"use client";
// components/picks/pick-input.tsx
import { useState, useTransition } from "react";
import { analytics } from "@/lib/use-analytics";

interface PickInputProps {
  matchId: string;
  kickoffTime: Date;
  initialHome?: number;
  initialAway?: number;
  initialIsStarOfHope?: boolean;
  initialPenaltyHome?: number;
  initialPenaltyAway?: number;
  isKnockout?: boolean;
  isTBD?: boolean;
}

export default function PickInput({
  matchId,
  kickoffTime,
  initialHome,
  initialAway,
  initialIsStarOfHope = false,
  initialPenaltyHome,
  initialPenaltyAway,
  isKnockout = false,
  isTBD = false,
}: PickInputProps) {
  const [home, setHome] = useState<string>(initialHome?.toString() ?? "");
  const [away, setAway] = useState<string>(initialAway?.toString() ?? "");
  const [isStarOfHope, setIsStarOfHope] = useState(initialIsStarOfHope);
  const [penaltyHome, setPenaltyHome] = useState<string>(initialPenaltyHome?.toString() ?? "");
  const [penaltyAway, setPenaltyAway] = useState<string>(initialPenaltyAway?.toString() ?? "");
  const [isStarring, setIsStarring] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();

  const isLocked = new Date() >= kickoffTime;
  const hasPick = initialHome !== undefined && initialAway !== undefined;

  const homeNum = parseInt(home, 10);
  const awayNum = parseInt(away, 10);
  const isDraw = !isNaN(homeNum) && !isNaN(awayNum) && homeNum === awayNum && home !== "" && away !== "";

  if (isTBD) {
    return (
      <div className="mt-4">
        <span
          className="text-xs uppercase tracking-wide"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
          }}
        >
          ⏳ TBD — dự đoán khi vòng trước đã kết thúc.
        </span>
      </div>
    );
  }

  async function handleSave() {
    const h = home.trim() === "" ? 0 : parseInt(home, 10);
    const a = away.trim() === "" ? 0 : parseInt(away, 10);

    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setStatus("error");
      analytics.pickFailed(matchId);
      return;
    }

    setStatus("saving");

    startTransition(async () => {
      try {
        const ph = penaltyHome.trim() === "" ? undefined : parseInt(penaltyHome, 10);
        const pa = penaltyAway.trim() === "" ? undefined : parseInt(penaltyAway, 10);
        const hasPenalty = isKnockout && h === a && ph !== undefined && pa !== undefined && !isNaN(ph) && !isNaN(pa);

        const res = await fetch("/api/picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            homeScore: h,
            awayScore: a,
            // Only send isStarOfHope for new picks; existing picks use PATCH
            ...(!hasPick && { isStarOfHope }),
            ...(hasPenalty && { penaltyHomeScore: ph, penaltyAwayScore: pa }),
          }),
        });

        if (!res.ok) throw new Error();

        analytics.pickSubmitted({
          matchId,
          homeScore: h,
          awayScore: a,
          isUpdate: hasPick,
        });

        setHome(h.toString());
        setAway(a.toString());
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        analytics.pickFailed(matchId);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  // Immediate star toggle for existing picks — no need to click Save
  async function handleStarToggle() {
    if (!hasPick || isStarring) return;
    const newStar = !isStarOfHope;
    setIsStarOfHope(newStar); // optimistic
    setIsStarring(true);
    try {
      const res = await fetch("/api/picks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, isStarOfHope: newStar }),
      });
      if (!res.ok) setIsStarOfHope(!newStar); // revert
    } catch {
      setIsStarOfHope(!newStar); // revert
    } finally {
      setIsStarring(false);
    }
  }

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <div
          className="px-3 py-1.5 text-sm rounded-[4px]"
          style={{
            background: "var(--surface-muted)",
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
          }}
        >
          {hasPick
            ? `Dự đoán của bạn: ${initialHome} – ${initialAway}`
            : "Chưa có dự đoán nào"}
        </div>
        <span
          className="text-xs uppercase tracking-wide"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Khoá dự đoán
        </span>
        {isKnockout && isStarOfHope && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-[4px]"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            ⭐ Ngôi Sao Hy Vọng
          </span>
        )}
        {isKnockout &&
          initialPenaltyHome !== undefined &&
          initialPenaltyAway !== undefined && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-[4px]"
              style={{
                background: "var(--surface-high)",
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              🥅 Luân lưu: {initialPenaltyHome}–{initialPenaltyAway}
            </span>
          )}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Main score row */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min={0}
          max={99}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          placeholder="0"
          className="w-14 text-center rounded-[4px] border px-2 py-2 text-lg font-bold transition focus:outline-none focus:ring-2"
          style={{
            fontFamily: "var(--font-display)",
            borderColor: "var(--outline-variant)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />

        <span
          style={{ color: "var(--outline)", fontFamily: "var(--font-display)" }}
        >
          -
        </span>

        <input
          type="number"
          min={0}
          max={99}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          placeholder="0"
          className="w-14 text-center rounded-[4px] border px-2 py-2 text-lg font-bold transition focus:outline-none focus:ring-2"
          style={{
            fontFamily: "var(--font-display)",
            borderColor: "var(--outline-variant)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />

        <button
          onClick={handleSave}
          disabled={isPending || status === "saving"}
          className="rounded-[4px] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition"
          style={{
            fontFamily: "var(--font-body)",
            background:
              status === "saved"
                ? "var(--success)"
                : status === "error"
                  ? "var(--error)"
                  : "var(--primary)",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {status === "saving"
            ? "Đang lưu.."
            : status === "saved"
              ? "✓ Đã lưu"
              : status === "error"
                ? "Lỗi"
                : "Lưu"}
        </button>

        {/* Star of Hope toggle — only for knockout rounds */}
        {isKnockout && (
          <button
            onClick={hasPick ? handleStarToggle : () => setIsStarOfHope((s) => !s)}
            disabled={isStarring}
            title={isStarOfHope ? "Bỏ Ngôi Sao Hy Vọng" : "Đặt Ngôi Sao Hy Vọng"}
            className="rounded-[4px] px-2 py-2 text-base transition"
            style={{
              background: isStarOfHope ? "var(--primary-soft)" : "var(--surface-high)",
              color: isStarOfHope ? "var(--primary)" : "var(--outline)",
              border: `1.5px solid ${isStarOfHope ? "var(--primary)" : "var(--outline-variant)"}`,
              opacity: isStarring ? 0.5 : 1,
            }}
          >
            {isStarOfHope ? "⭐" : "☆"}
          </button>
        )}
      </div>

      {/* Penalty shootout prediction — only shown when predicting a draw in knockout */}
      {isKnockout && isDraw && (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs uppercase tracking-wide font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            🥅 Luân lưu:
          </span>
          <input
            type="number"
            min={0}
            max={99}
            value={penaltyHome}
            onChange={(e) => setPenaltyHome(e.target.value)}
            placeholder="0"
            className="w-14 text-center rounded-[4px] border px-2 py-2 text-lg font-bold transition focus:outline-none focus:ring-2"
            style={{
              fontFamily: "var(--font-display)",
              borderColor: "var(--outline-variant)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          />
          <span style={{ color: "var(--outline)", fontFamily: "var(--font-display)" }}>
            -
          </span>
          <input
            type="number"
            min={0}
            max={99}
            value={penaltyAway}
            onChange={(e) => setPenaltyAway(e.target.value)}
            placeholder="0"
            className="w-14 text-center rounded-[4px] border px-2 py-2 text-lg font-bold transition focus:outline-none focus:ring-2"
            style={{
              fontFamily: "var(--font-display)",
              borderColor: "var(--outline-variant)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          />
          <span
            className="text-xs"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            (+1 đúng đội, +2 đúng tỉ số)
          </span>
        </div>
      )}
    </div>
  );
}
