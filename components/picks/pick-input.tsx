// components/picks/pick-input.tsx
"use client";

import { useState, useTransition } from "react";

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
  isTBD,
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
          ⏳ Teams TBD — picks open after draw
        </span>
      </div>
    );
  }

  async function handleSave() {
    const h = parseInt(home);
    const a = parseInt(away);

    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setStatus("error");
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
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
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
            ? `Your pick: ${initialHome} – ${initialAway}`
            : "No pick submitted"}
        </div>
        <span
          className="text-xs uppercase tracking-wide"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Locked
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      {/* Home score */}
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
        –
      </span>

      {/* Away score */}
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

      {/* Save button */}
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
          ? "Saving…"
          : status === "saved"
            ? "✓ Saved"
            : status === "error"
              ? "Error"
              : "Save Pick"}
      </button>
    </div>
  );
}
