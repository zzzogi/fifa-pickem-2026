// lib/cron-auth.ts
import { NextRequest, NextResponse } from "next/server";

export function verifyCronSecret(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // null = passed
}
