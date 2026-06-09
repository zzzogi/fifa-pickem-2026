// components/layout/topbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const pageTitles: Record<string, string> = {
  "/picks": "My Picks",
  "/leaderboard": "Leaderboard",
  "/stats": "Stats",
};

export default function Topbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  // Match theo prefix
  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Pick'em";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden border-b"
      style={{
        background: "var(--secondary)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <h2
        className="text-white text-xl"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        {title.toUpperCase()}
      </h2>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-white/60 text-xs uppercase tracking-wide transition hover:text-white"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Sign Out
      </button>
    </header>
  );
}
