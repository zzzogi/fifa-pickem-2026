// lib/device.ts

import { headers } from "next/headers";

export async function isMobileDevice() {
  const userAgent = (await headers()).get("user-agent") ?? "";

  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}
