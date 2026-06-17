// components/picks/pick-input.tsx
"use client";

import { useState, useTransition } from "react";
import { analytics } from "@/lib/use-analytics";

interface PickInputProps {
  matchId: string;
  kickoffTime: Date;
  initialHome?: number;
  initialAway?: number;
  isTBD?: boolean;
}

export default function PickInput({
  matchId,
  kickoffTime,
  initialHome,
  initialAway,
  isTBD = false,
}: PickInputProps) {
  const [home, setHome] = useState<string>(initialHome?.toString() ?? "");
  const [away, setAway] = useState<string>(initialAway?.toString() ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();

  const isLocked = new Date() >= kickoffTime;

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
        const res = await fetch("/api/picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, homeScore: h, awayScore: a }),
        });

        if (!res.ok) throw new Error();

        // Track: isUpdate = true nếu đã có pick trước đó
        analytics.pickSubmitted({
          matchId,
          homeScore: h,
          awayScore: a,
          isUpdate: initialHome !== undefined && initialAway !== undefined,
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

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 mt-4">
        <div
          className="px-3 py-1.5 text-sm rounded-[4px]"
          style={{
            background: "var(--surface-muted)",
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
          }}
        >
          {initialHome !== undefined && initialAway !== undefined
            ? `Dự đoán của bạn: ${initialHome} – ${initialAway}`
            : "Chưa có dự đoán nào"}
        </div>
        <span
          className="text-xs uppercase tracking-wide"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Khoá dự đoán
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
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
    </div>
  );
}
