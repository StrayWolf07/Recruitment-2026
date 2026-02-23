/**
 * Reset all data and seed admin users.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/reset-and-seed-admins.ts
 * Or: npx tsx scripts/reset-and-seed-admins.ts
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const ADMINS = [
  { email: "suhaspampana@ssev.co.in", password: "Suhas@0321" },
  { email: "diptikuity@ssev.co.in", password: "Dipti@0321" },
  { email: "bhargavikorimi@ssev.co.in", password: "Bhargavi@0321" },
  { email: "prabhastummala@ssev.co.in", password: "Prabhas@0321" },
  { email: "shreeyanbejagam@ssev.co.in", password: "Shreeyan@0321" },
  { email: "hrithikkadali@ssev.co.in", password: "Hrithik@0321" },
];

async function main() {
  const db = new PrismaClient();

  console.log("Clearing all data...");

  await db.practicalFile.deleteMany();
  await db.examLog.deleteMany();
  await db.answer.deleteMany();
  await db.examQuestion.deleteMany();
  await db.examSession.deleteMany();
  await db.studentProfile.deleteMany();
  await db.student.deleteMany();
  await db.admin.deleteMany();
  await db.theoryQuestion.deleteMany();
  await db.practicalQuestion.deleteMany();
  await db.role.deleteMany();

  console.log("Seeding admins...");
  for (const { email, password } of ADMINS) {
    const hash = await bcrypt.hash(password, 10);
    await db.admin.create({ data: { email, passwordHash: hash } });
    console.log(`  - ${email}`);
  }

  console.log("Done.");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
