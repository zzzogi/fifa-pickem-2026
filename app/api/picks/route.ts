// app/api/picks/route.ts
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { matchId, homeScore, awayScore } = body;

  // Validate input
  if (
    typeof homeScore !== "number" ||
    typeof awayScore !== "number" ||
    homeScore < 0 ||
    awayScore < 0 ||
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore)
  ) {
    return NextResponse.json({ error: "Invalid scores" }, { status: 400 });
  }

  // Kiểm tra match có tồn tại và chưa bắt đầu
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const now = new Date();
  const kickoff = new Date(match.utcDate);
  if (now >= kickoff) {
    return NextResponse.json(
      { error: "Match has already started" },
      { status: 403 },
    );
  }

  // Upsert pick — tạo mới hoặc update nếu đã tồn tại
  const pick = await prisma.pick.upsert({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId,
      },
    },
    create: {
      userId: session.user.id,
      matchId,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    },
    update: {
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    },
  });

  return NextResponse.json({ pick });
}
