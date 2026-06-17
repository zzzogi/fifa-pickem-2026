// app/(dashboard)/profile/[userId]/page.tsx
import { authOptions } from "@/auth";
import ProfileHeader from "@/components/profile/profile-header";
import ProfilePicksList from "@/components/profile/profile-picks-list";
import AchievementsGrid from "@/components/profile/achievements-grid";
import { getPublicProfile } from "@/lib/profile";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileLoading from "./loading";
import ProfileTracker from "@/components/profile/profile-tracker";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const profile = await getPublicProfile(userId);
  if (!profile) notFound();

  const isCurrentUser = session?.user?.id === userId;

  return (
    <div>
      <ProfileTracker isOwnProfile={isCurrentUser} profileUserId={userId} />
      {/* Back button */}
      <div className="mb-4">
        <a
          href="/leaderboard"
          className="inline-flex items-center gap-1 text-sm uppercase tracking-wide transition hover:opacity-70"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
          }}
        >
          ← Bảng xếp hạng
        </a>
      </div>

      <Suspense fallback={<ProfileLoading />}>
        <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />

        {/* Achievements Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-xs uppercase tracking-widest font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              Thành tích
            </h3>
            {profile.achievements.length > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--surface-high)",
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {profile.achievements.length} đã mở khóa
              </span>
            )}
          </div>
          <AchievementsGrid achievements={profile.achievements} />
        </div>

        <div className="mb-4">
          <h3
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Tất cả dự đoán
          </h3>
        </div>

        <ProfilePicksList picks={profile.picks} />
      </Suspense>
    </div>
  );
}
