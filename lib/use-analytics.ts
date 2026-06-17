// lib/use-analytics.ts
"use client";

// Khai báo gtag trên window để TypeScript không complaint
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export const analytics = {
  // ── Auth ──────────────────────────────────
  loginClicked() {
    track("login_clicked", { method: "google" });
  },

  loginSuccess() {
    track("login", { method: "google" });
  },

  // ── Picks ─────────────────────────────────
  pickSubmitted(params: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    isUpdate: boolean; // true nếu sửa pick cũ
  }) {
    track("submit_pick", {
      match_id: params.matchId,
      predicted_score: `${params.homeScore}-${params.awayScore}`,
      action: params.isUpdate ? "update" : "create",
    });
  },

  pickFailed(matchId: string) {
    track("pick_failed", { match_id: matchId });
  },

  // ── Navigation ────────────────────────────
  leaderboardViewed() {
    track("view_leaderboard");
  },

  profileViewed(params: { profileUserId: string; isOwnProfile: boolean }) {
    track("view_profile", {
      profile_user_id: params.profileUserId,
      is_own_profile: params.isOwnProfile,
    });
  },

  // ── Achievements ──────────────────────────
  achievementUnlocked(params: { key: string; rarity: string }) {
    track("unlock_achievement", {
      achievement_key: params.key,
      achievement_rarity: params.rarity,
    });
  },

  // ── Email ─────────────────────────────────
  emailUnsubscribed() {
    track("email_unsubscribed");
  },
};
