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
  const { matchId, homeScore, awayScore, isStarOfHope } = body;

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
      isStarOfHope: typeof isStarOfHope === "boolean" ? isStarOfHope : false,
    },
    update: {
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
      // Only update isStarOfHope if explicitly provided; otherwise preserve existing
      ...(typeof isStarOfHope === "boolean" && { isStarOfHope }),
    },
  });

  return NextResponse.json({ pick });
}

// Toggle Star of Hope on an existing pick (must be before kickoff)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { matchId, isStarOfHope } = body;

  if (typeof isStarOfHope !== "boolean") {
    return NextResponse.json({ error: "Invalid isStarOfHope" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (new Date() >= new Date(match.utcDate)) {
    return NextResponse.json(
      { error: "Match has already started" },
      { status: 403 },
    );
  }

  try {
    const pick = await prisma.pick.update({
      where: { userId_matchId: { userId: session.user.id, matchId } },
      data: { isStarOfHope },
    });
    return NextResponse.json({ pick });
  } catch {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }
}
