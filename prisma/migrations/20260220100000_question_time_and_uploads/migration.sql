-- AlterTable
ALTER TABLE "Answer" ADD COLUMN "openedAt" DATETIME;
ALTER TABLE "Answer" ADD COLUMN "lastOpenedAt" DATETIME;
ALTER TABLE "Answer" ADD COLUMN "closedAt" DATETIME;
ALTER TABLE "Answer" ADD COLUMN "activeTimeMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Answer" ADD COLUMN "tabSwitchTimeMs" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PracticalFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticalFile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
