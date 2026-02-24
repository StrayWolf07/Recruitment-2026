import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  FULL EXAM RESET STARTED...");

  // Child tables first (respect FK constraints)
  try {
    await prisma.practicalFile.deleteMany();
  } catch {}
  try {
    await prisma.answer.deleteMany();
  } catch {}
  try {
    await prisma.examLog.deleteMany();
  } catch {}

  // Session-scoped questions (must be before examSession)
  try {
    await prisma.examQuestion.deleteMany();
  } catch {}

  // Sessions
  try {
    await prisma.examSession.deleteMany();
  } catch {}

  console.log("✅ FULL EXAM RESET COMPLETE.");
}

main()
  .catch((e) => {
    console.error("RESET FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
