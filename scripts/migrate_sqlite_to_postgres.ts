/**
 * One-time migration: copy data from SQLite (prisma/dev.db) to PostgreSQL.
 *
 * Prerequisites:
 * - SQLite file at prisma/dev.db with existing data
 * - DATABASE_URL set to your PostgreSQL connection string (production or staging)
 *
 * Run once on an empty Postgres database (after prisma migrate deploy).
 * Idempotency: Script checks for existing records and skips tables that already
 * have data (safe to re-run if it fails partway).
 *
 * Usage:
 *   npx tsx scripts/migrate_sqlite_to_postgres.ts
 *   # or: node --loader ts-node/esm scripts/migrate_sqlite_to_postgres.ts
 */

import path from "path";
import { PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";

const SQLITE_PATH = path.join(process.cwd(), "prisma", "dev.db");

function getSqlite() {
  const db = new Database(SQLITE_PATH, { readonly: true });
  return db;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith("postgresql")) {
    console.error("DATABASE_URL must be set to a PostgreSQL URL.");
    process.exit(1);
  }

  const fs = await import("fs");
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`SQLite file not found: ${SQLITE_PATH}`);
    process.exit(1);
  }

  const sqlite = getSqlite();
  const prisma = new PrismaClient();

  const tableCount = async (table: string): Promise<number> => {
    const r = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM "${table}"`
    );
    return Number(r[0]?.count ?? 0);
  };

  const run = async (
    table: string,
    order: number,
    copy: () => Promise<void>
  ) => {
    const count = await tableCount(table);
    if (count > 0) {
      console.log(`[${order}] ${table}: skip (already has ${count} rows)`);
      return;
    }
    await copy();
    console.log(`[${order}] ${table}: done`);
  };

  try {
    // 1. Roles (no FKs)
    await run("Role", 1, async () => {
      const rows = sqlite.prepare("SELECT * FROM Role").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.role.create({
          data: {
            id: row.id as string,
            name: row.name as string,
            description: (row.description as string) ?? undefined,
            isActive: row.isActive === 1,
          },
        });
      }
    });

    // 2. Admin
    await run("Admin", 2, async () => {
      const rows = sqlite.prepare("SELECT * FROM Admin").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.admin.create({
          data: {
            id: row.id as string,
            email: row.email as string,
            passwordHash: row.passwordHash as string,
            createdAt: row.createdAt ? new Date(row.createdAt as string) : new Date(),
          },
        });
      }
    });

    // 3. Student
    await run("Student", 3, async () => {
      const rows = sqlite.prepare("SELECT * FROM Student").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.student.create({
          data: {
            id: row.id as string,
            email: row.email as string,
            passwordHash: row.passwordHash as string,
            name: (row.name as string) ?? undefined,
            gender: (row.gender as string) ?? undefined,
            college: (row.college as string) ?? undefined,
            degree: (row.degree as string) ?? undefined,
            branch: (row.branch as string) ?? undefined,
            cgpa: row.cgpa != null ? Number(row.cgpa) : undefined,
            contactNumber: (row.contactNumber as string) ?? undefined,
            emailId: (row.emailId as string) ?? undefined,
            age: row.age != null ? Number(row.age) : undefined,
            location: (row.location as string) ?? undefined,
            source: (row.source as string) ?? undefined,
            readyToRelocate: (row.readyToRelocate as string) ?? undefined,
            fatherName: (row.fatherName as string) ?? undefined,
            motherName: (row.motherName as string) ?? undefined,
            brotherName: (row.brotherName as string) ?? undefined,
            sisterName: (row.sisterName as string) ?? undefined,
            spouseName: (row.spouseName as string) ?? undefined,
            childrenName: (row.childrenName as string) ?? undefined,
            graduation: (row.graduation as string) ?? undefined,
            engineering: (row.engineering as string) ?? undefined,
            masters: (row.masters as string) ?? undefined,
            pgDiploma: (row.pgDiploma as string) ?? undefined,
            additionalQualifications: (row.additionalQualifications as string) ?? undefined,
            presentOrganization: (row.presentOrganization as string) ?? undefined,
            designation: (row.designation as string) ?? undefined,
            currentJobDetails: (row.currentJobDetails as string) ?? undefined,
            teamSizeHandled: (row.teamSizeHandled as string) ?? undefined,
            reportingTo: (row.reportingTo as string) ?? undefined,
            currentMonthlyCTC: (row.currentMonthlyCTC as string) ?? undefined,
            currentAnnualCTC: (row.currentAnnualCTC as string) ?? undefined,
            expectedMonthlyCTC: (row.expectedMonthlyCTC as string) ?? undefined,
            expectedAnnualCTC: (row.expectedAnnualCTC as string) ?? undefined,
            totalExperience: (row.totalExperience as string) ?? undefined,
            noticePeriod: (row.noticePeriod as string) ?? undefined,
            reasonsForChange: (row.reasonsForChange as string) ?? undefined,
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : undefined,
          },
        });
      }
    });

    // 4. StudentProfile
    await run("StudentProfile", 4, async () => {
      const rows = sqlite.prepare("SELECT * FROM StudentProfile").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.studentProfile.create({
          data: {
            id: row.id as string,
            studentId: row.studentId as string,
            name: (row.name as string) ?? undefined,
            gender: (row.gender as string) ?? undefined,
            college: (row.college as string) ?? undefined,
            degree: (row.degree as string) ?? undefined,
            branch: (row.branch as string) ?? undefined,
            cgpa: row.cgpa != null ? Number(row.cgpa) : undefined,
            roleIds: row.roleIds as string,
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : undefined,
          },
        });
      }
    });

    // 5. TheoryQuestion, 6. PracticalQuestion
    await run("TheoryQuestion", 5, async () => {
      const rows = sqlite.prepare("SELECT * FROM TheoryQuestion").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.theoryQuestion.create({
          data: {
            id: row.id as string,
            roleId: row.roleId as string,
            questionText: row.questionText as string,
            isActive: row.isActive === 1,
          },
        });
      }
    });
    await run("PracticalQuestion", 6, async () => {
      const rows = sqlite.prepare("SELECT * FROM PracticalQuestion").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.practicalQuestion.create({
          data: {
            id: row.id as string,
            roleId: row.roleId as string,
            questionText: row.questionText as string,
            isActive: row.isActive === 1,
          },
        });
      }
    });

    // 7. ExamSession
    await run("ExamSession", 7, async () => {
      const rows = sqlite.prepare("SELECT * FROM ExamSession").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.examSession.create({
          data: {
            id: row.id as string,
            studentId: row.studentId as string,
            roleIds: row.roleIds as string,
            phase: (row.phase as string) ?? "theory",
            startTime: new Date(row.startTime as string),
            endTime: new Date(row.endTime as string),
            submittedAt: row.submittedAt ? new Date(row.submittedAt as string) : undefined,
            theoryTabViolation: row.theoryTabViolation === 1,
            terminationReason: (row.terminationReason as string) ?? undefined,
            terminatedAt: row.terminatedAt ? new Date(row.terminatedAt as string) : undefined,
            totalScore: row.totalScore != null ? Number(row.totalScore) : undefined,
            evaluationStatus: (row.evaluationStatus as string) ?? "pending",
            evaluatedAt: row.evaluatedAt ? new Date(row.evaluatedAt as string) : undefined,
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : undefined,
          },
        });
      }
    });

    // 8. ExamQuestion
    await run("ExamQuestion", 8, async () => {
      const rows = sqlite.prepare("SELECT * FROM ExamQuestion").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.examQuestion.create({
          data: {
            id: row.id as string,
            sessionId: row.sessionId as string,
            roleId: row.roleId as string,
            section: row.section as string,
            questionType: row.questionType as string,
            questionText: row.questionText as string,
            sourceId: (row.sourceId as string) ?? undefined,
            orderIndex: Number(row.orderIndex),
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
          },
        });
      }
    });

    // 9. Answer
    await run("Answer", 9, async () => {
      const rows = sqlite.prepare("SELECT * FROM Answer").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.answer.create({
          data: {
            id: row.id as string,
            sessionId: row.sessionId as string,
            examQuestionId: row.examQuestionId as string,
            answerText: (row.answerText as string) ?? undefined,
            firstOpened: row.firstOpened ? new Date(row.firstOpened as string) : undefined,
            firstTyped: row.firstTyped ? new Date(row.firstTyped as string) : undefined,
            lastModified: row.lastModified ? new Date(row.lastModified as string) : undefined,
            totalTimeSpent: Number(row.totalTimeSpent ?? 0),
            scoreAwarded: row.scoreAwarded != null ? Number(row.scoreAwarded) : undefined,
            openedAt: row.openedAt ? new Date(row.openedAt as string) : undefined,
            lastOpenedAt: row.lastOpenedAt ? new Date(row.lastOpenedAt as string) : undefined,
            closedAt: row.closedAt ? new Date(row.closedAt as string) : undefined,
            activeTimeMs: Number(row.activeTimeMs ?? 0),
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt as string) : undefined,
          },
        });
      }
    });

    // 10. ExamLog
    await run("ExamLog", 10, async () => {
      const rows = sqlite.prepare("SELECT * FROM ExamLog").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.examLog.create({
          data: {
            id: row.id as string,
            sessionId: row.sessionId as string,
            eventType: row.eventType as string,
            timestamp: new Date(row.timestamp as string),
            duration: row.duration != null ? Number(row.duration) : undefined,
            metadata: (row.metadata as string) ?? undefined,
            createdAt: row.createdAt ? new Date(row.createdAt as string) : undefined,
          },
        });
      }
    });

    // 11. PracticalFile (IDs may differ with serial; we preserve sessionId, questionId, filename, storedPath, etc.)
    const pfCount = await prisma.practicalFile.count();
    if (pfCount === 0) {
      const rows = sqlite.prepare("SELECT * FROM PracticalFile").all() as Record<string, unknown>[];
      for (const row of rows) {
        await prisma.practicalFile.create({
          data: {
            sessionId: row.sessionId as string,
            questionId: row.questionId as string,
            filename: row.filename as string,
            storedPath: row.storedPath as string,
            mimeType: (row.mimeType as string) ?? undefined,
            sizeBytes: Number(row.sizeBytes),
            uploadedAt: row.uploadedAt ? new Date(row.uploadedAt as string) : new Date(),
          },
        });
      }
      console.log("[11] PracticalFile: done");
    } else {
      console.log("[11] PracticalFile: skip (already has rows)");
    }

    console.log("Migration completed.");
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
