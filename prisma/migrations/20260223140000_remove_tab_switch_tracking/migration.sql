-- Remove tab-switch tracking fields (theory disqualification kept via theoryTabViolation/terminationReason)

-- ExamSession: remove totalTabSwitches, totalTimeAway
ALTER TABLE "ExamSession" DROP COLUMN IF EXISTS "totalTabSwitches";
ALTER TABLE "ExamSession" DROP COLUMN IF EXISTS "totalTimeAway";

-- Answer: remove tab-switch fields
ALTER TABLE "Answer" DROP COLUMN IF EXISTS "tabSwitchCount";
ALTER TABLE "Answer" DROP COLUMN IF EXISTS "tabSwitchTime";
ALTER TABLE "Answer" DROP COLUMN IF EXISTS "tabSwitchTimeMs";

-- ExamLog: remove tab-switch related fields
ALTER TABLE "ExamLog" DROP COLUMN IF EXISTS "durationAway";
ALTER TABLE "ExamLog" DROP COLUMN IF EXISTS "examQuestionId";
