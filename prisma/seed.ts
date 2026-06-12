// prisma/seed.ts
import prisma from "@/lib/prisma";
import { ACHIEVEMENT_DEFS } from "../lib/achievements";

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const def of ACHIEVEMENT_DEFS) {
    await prisma.achievement.upsert({
      where: { key: def.key },
      update: {
        icon: def.icon,
        rarity: def.rarity,
      },
      create: {
        key: def.key,
        icon: def.icon,
        rarity: def.rarity,
      },
    });
  }

  console.log(`✅ Seeded ${ACHIEVEMENT_DEFS.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
