// components/profile/profile-header.tsx
import Image from "next/image";
import FireBadge from "@/components/leaderboard/fire-badge";
import type { ProfileData } from "@/lib/profile";

export default function ProfileHeader({
  profile,
  isCurrentUser,
}: {
  profile: ProfileData;
  isCurrentUser: boolean;
}) {
  const stats = [
    { label: "Điểm", value: profile.totalPoints.toString() },
    {
      label: "Độ chính xác",
      value: profile.totalPicks > 0 ? `${profile.accuracy}%` : "—",
    },
    { label: "Dự đoán đúng", value: profile.correctPicks.toString() },
    { label: "Dự đoán chính xác tỉ số", value: profile.exactScores.toString() },
    { label: "Chuỗi dài nhất", value: `${profile.maxStreak}🔥` },
    { label: "Điểm cộng đã nhận", value: `+${profile.streakPoints}` },
  ];

  return (
    <div className="card-sports p-6 mb-6">
      {/* Top: avatar + tên + rank */}
      <div className="flex items-start gap-4 mb-6">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={profile.name ?? "Player"}
            width={72}
            height={72}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <div
            className="w-18 h-18 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              width: 72,
              height: 72,
              background: "var(--surface-muted)",
              color: "var(--outline)",
              fontFamily: "var(--font-display)",
            }}
          >
            {profile.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2
              className="text-2xl leading-none"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.02em",
              }}
            >
              {profile.name ?? "Anonymous"}
            </h2>
            {isCurrentUser && (
              <span
                className="text-xs uppercase tracking-wide px-2 py-0.5 rounded-[4px]"
                style={{
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                }}
              >
                You
              </span>
            )}
          </div>

          {/* Rank + streak */}
          <div className="flex items-center gap-3 flex-wrap">
            {profile.rank > 0 && (
              <span
                className="text-sm"
                style={{
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Thứ hạng{" "}
                <strong
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--foreground)",
                  }}
                >
                  #{profile.rank}
                </strong>
              </span>
            )}
            {/* Streak hiện tại */}
            <FireBadge
              streak={profile.currentStreak}
              isDev={profile.id === "cmq8d4yva0000k004rf5rqf4m"}
              isBugCatcher={
                profile.id === "cmqc3j7k8006mjr04s7y7lla0" ||
                profile.id === "cmq9nnrc1000mkz04v0x7hhor"
              }
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-center p-3 rounded-[4px]"
            style={{ background: "var(--surface-soft)" }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
              }}
            >
              {s.label}
            </p>
            <p
              className="text-xl leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
