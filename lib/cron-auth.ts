// lib/cron-auth.ts
import { NextRequest, NextResponse } from "next/server";

export function verifyCronSecret(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  // Catch misconfiguration early
  if (!cronSecret) {
    console.error("CRON_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader !== expected) {
    console.error("Cron auth failed", {
      received: authHeader ?? "none",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
