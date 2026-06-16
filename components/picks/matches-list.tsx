// components/picks/matches-list.tsx
import { getPickDistributions } from "@/lib/pick-distribution";
import prisma from "@/lib/prisma";
import DayGroup from "./day-group";

interface MatchesListProps {
  userId: string;
}

export default async function MatchesList({ userId }: MatchesListProps) {
  const matches = await prisma.match.findMany({
    orderBy: { utcDate: "asc" },
    include: {
      picks: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (matches.length === 0) {
    return (
      <div className="card-sports p-12 text-center">
        <p
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chưa có trận đấu nào sắp tới
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Các trận đấu sẽ được cập nhật vào thời gian sớm nhất.
        </p>
      </div>
    );
  }

  const matchIds = matches.map((m) => m.id);
  const distributions = await getPickDistributions(matchIds);

  // Group theo ngày
  const grouped = matches.reduce<
    Record<string, { date: Date; matches: typeof matches }>
  >((acc, match) => {
    const day = new Date(match.utcDate).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Asia/Ho_Chi_Minh",
    });
    if (!acc[day]) acc[day] = { date: match.utcDate, matches: [] };
    acc[day].matches.push(match);
    return acc;
  }, {});

  // Trong mỗi ngày: live lên đầu, rồi scheduled, rồi finished
  const statusOrder: Record<string, number> = {
    IN_PLAY: 0,
    PAUSED: 0,
    TIMED: 1,
    SCHEDULED: 1,
    FINISHED: 2,
  };

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([day, { matches: dayMatches }]) => {
        // Sort: live trước, rồi scheduled, rồi finished
        const sorted = [...dayMatches].sort((a, b) => {
          const orderA = statusOrder[a.status] ?? 1;
          const orderB = statusOrder[b.status] ?? 1;
          if (orderA !== orderB) return orderA - orderB;
          return a.utcDate.getTime() - b.utcDate.getTime();
        });

        // Ngày hôm nay mặc định mở, ngày trước đó đóng lại
        const isToday = day === today;
        const hasLive = dayMatches.some(
          (m) => m.status === "IN_PLAY" || m.status === "PAUSED",
        );
        const defaultOpen = isToday || hasLive;

        return (
          <DayGroup
            key={day}
            day={day}
            matches={sorted}
            distributions={distributions}
            defaultOpen={defaultOpen}
          />
        );
      })}
    </div>
  );
}
