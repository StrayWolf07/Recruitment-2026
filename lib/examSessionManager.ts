import { db } from "./db";
import { generateExamQuestions } from "./questionGenerator";

const EXAM_DURATION_MINUTES = 120;

export async function startExam(studentId: string, roleIds: string[]) {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + EXAM_DURATION_MINUTES * 60 * 1000);

  const session = await db.examSession.create({
    data: {
      studentId,
      roleIds: JSON.stringify(roleIds),
      phase: "theory",
      startTime,
      endTime,
    },
  });

  const result = await generateExamQuestions(session.id, roleIds);
  if (!result.success) {
    await db.examSession.delete({ where: { id: session.id } });
    return { success: false, error: result.error };
  }

  return { success: true, sessionId: session.id };
}

export async function moveToPractical(sessionId: string, studentId: string): Promise<{ success: boolean; error?: string }> {
  const session = await db.examSession.findFirst({
    where: { id: sessionId, studentId },
  });
  if (!session) return { success: false, error: "Session not found" };
  if (session.submittedAt) return { success: false, error: "Exam already submitted" };
  if (session.phase === "practical") return { success: false, error: "Already in practical" };

  await db.examSession.update({
    where: { id: sessionId },
    data: { phase: "practical" },
  });
  return { success: true };
}

export interface SubmitExamOptions {
  theoryTabViolation?: boolean;
  terminationReason?: string;
}

export async function submitExam(
  sessionId: string,
  studentId: string,
  options?: SubmitExamOptions
): Promise<{ success: boolean; error?: string }> {
  const session = await db.examSession.findFirst({
    where: { id: sessionId, studentId },
  });
  if (!session) return { success: false, error: "Session not found" };
  if (session.submittedAt) return { success: false, error: "Exam already submitted" };

  const now = new Date();
  const data: {
    submittedAt: Date;
    theoryTabViolation?: boolean;
    terminationReason?: string;
    terminatedAt?: Date;
    evaluationStatus?: string;
  } = { submittedAt: now };
  if (options?.theoryTabViolation) {
    data.theoryTabViolation = true;
    data.terminationReason = options.terminationReason ?? "Tab switch during theory section";
    data.terminatedAt = now;
    data.evaluationStatus = "disqualified";
  }

  await db.examSession.update({
    where: { id: sessionId },
    data,
  });
  return { success: true };
}
