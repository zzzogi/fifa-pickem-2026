// app/(dashboard)/profile/[userId]/page.tsx
import { authOptions } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getPublicProfile } from "@/lib/profile";
import ProfileHeader from "@/components/profile/profile-header";
import ProfilePicksList from "@/components/profile/profile-picks-list";
import ProfileLoading from "./loading";
import { getServerSession } from "next-auth";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/profile/${userId}`);
  }

  const profile = await getPublicProfile(userId);
  if (!profile) notFound();

  const isCurrentUser = session?.user?.id === userId;

  return (
    <div>
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
          ← Leaderboard
        </a>
      </div>

      <Suspense fallback={<ProfileLoading />}>
        <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />

        <div className="mb-4">
          <h3
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            All Picks
          </h3>
        </div>

        <ProfilePicksList picks={profile.picks} />
      </Suspense>
    </div>
  );
}
