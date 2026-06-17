// components/leaderboard/leaderboard-tracker.tsx
// Component nhỏ chỉ để track view — đặt trong leaderboard/page.tsx
"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/use-analytics";

export default function LeaderboardTracker() {
  useEffect(() => {
    analytics.leaderboardViewed();
  }, []);

  return null;
}
