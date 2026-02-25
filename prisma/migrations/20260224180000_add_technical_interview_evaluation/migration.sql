-- CreateEnum
CREATE TYPE "BehaviorRating" AS ENUM ('VERY_GOOD', 'GOOD', 'AVERAGE', 'POOR');

-- AlterTable
ALTER TABLE "ExamSession" ADD COLUMN "technicalEligible" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TechnicalInterviewEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "conductRating" "BehaviorRating",
    "conductRemarks" TEXT,
    "disciplineRating" "BehaviorRating",
    "disciplineRemarks" TEXT,
    "knowledgeRating" "BehaviorRating",
    "knowledgeRemarks" TEXT,
    "analysisRating" "BehaviorRating",
    "analysisRemarks" TEXT,
    "communicationRating" "BehaviorRating",
    "communicationRemarks" TEXT,
    "maturityRating" "BehaviorRating",
    "maturityRemarks" TEXT,
    "reliabilityRating" "BehaviorRating",
    "reliabilityRemarks" TEXT,
    "understandingRating" "BehaviorRating",
    "understandingRemarks" TEXT,
    "attitudeRating" "BehaviorRating",
    "attitudeRemarks" TEXT,
    "overallRating" TEXT,
    "furtherAction" TEXT,
    "suggestedRole" TEXT,
    "suggestedProject" TEXT,
    "suggestedLead" TEXT,
    "others" TEXT,
    "interviewerName" TEXT,
    "interviewerPlace" TEXT,
    "interviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalInterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalInterviewEvaluation_sessionId_key" ON "TechnicalInterviewEvaluation"("sessionId");

-- AddForeignKey
ALTER TABLE "TechnicalInterviewEvaluation" ADD CONSTRAINT "TechnicalInterviewEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
