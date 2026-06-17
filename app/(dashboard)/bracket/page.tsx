// app/(dashboard)/bracket/page.tsx
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import GroupStageSection from "@/components/bracket/group-stage-section";
import KnockoutSection from "@/components/bracket/knockout-section";

export const revalidate = 300;

export default async function BracketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const matches = await prisma.match.findMany({
    orderBy: { utcDate: "asc" },
    select: {
      id: true,
      stage: true,
      group: true,
      status: true,
      utcDate: true,
      homeTeamName: true,
      homeTeamCode: true,
      homeTeamCrest: true,
      awayTeamName: true,
      awayTeamCode: true,
      awayTeamCrest: true,
      homeScore: true,
      awayScore: true,
      winner: true,
    },
  });

  // Filter null stage — an toàn trước khi split
  const validMatches = matches.filter((m) => m.stage !== null);

  const groupMatches = validMatches.filter((m) => m.stage === "GROUP_STAGE");
  const knockoutMatches = validMatches.filter((m) => m.stage !== "GROUP_STAGE");

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-1 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          FIFA World Cup 2026
        </p>
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          SƠ ĐỒ THI ĐẤU
        </h1>
      </div>

      <GroupStageSection matches={groupMatches} />

      <div className="mt-10">
        <h2
          className="text-xs uppercase tracking-widest mb-4 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Vòng Loại Trực Tiếp
        </h2>
        <KnockoutSection matches={knockoutMatches} />
      </div>
    </div>
  );
}
