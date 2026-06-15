// prisma/seed-unsubscribe-tokens.ts
// Chạy 1 lần để generate token cho users hiện tại
// npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-unsubscribe-tokens.ts

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { unsubscribeToken: null },
    select: { id: true },
  });

  console.log(`Generating tokens for ${users.length} users...`);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        unsubscribeToken: randomBytes(32).toString("hex"),
      },
    });
  }

  console.log(`✅ Done`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
