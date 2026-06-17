// components/profile/profile-tracker.tsx
// Đặt trong app/(dashboard)/profile/[userId]/page.tsx
"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/use-analytics";

interface ProfileTrackerProps {
  profileUserId: string;
  isOwnProfile: boolean;
}

export default function ProfileTracker({
  profileUserId,
  isOwnProfile,
}: ProfileTrackerProps) {
  useEffect(() => {
    analytics.profileViewed({ profileUserId, isOwnProfile });
  }, [profileUserId, isOwnProfile]);

  return null;
}

// ── Cách dùng trong profile/[userId]/page.tsx ──
// import ProfileTracker from "@/components/profile/profile-tracker";
//
// <ProfileTracker
//   profileUserId={userId}
//   isOwnProfile={isCurrentUser}
// />
