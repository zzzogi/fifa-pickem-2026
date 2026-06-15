// app/api/cron/backfill-achievements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import {
  buildAchievementContext,
  checkAndUnlockAchievements,
} from "@/lib/achievements";

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  const users = await prisma.user.findMany({
    where: {
      picks: { some: { scoredAt: { not: null } } },
    },
    select: { id: true },
  });

  const results: Record<string, string[]> = {};

  for (const user of users) {
    const ctx = await buildAchievementContext(user.id);
    const unlocked = await checkAndUnlockAchievements(ctx);
    if (unlocked.length > 0) results[user.id] = unlocked;
  }

  return NextResponse.json({ success: true, results });
}
