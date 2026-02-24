import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

const ALLOWED_EXT = new Set(["zip", "stl", "glb", "obj", "pdf"]);
const MAX_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { sessionId, questionId, storedPath, filename, sizeBytes } = body as {
      sessionId?: string;
      questionId?: string;
      storedPath?: string;
      filename?: string;
      sizeBytes?: number;
    };

    if (
      !sessionId ||
      !questionId ||
      !storedPath ||
      !filename ||
      sizeBytes == null ||
      typeof sizeBytes !== "number"
    ) {
      return Response.json(
        { error: "sessionId, questionId, storedPath, filename and sizeBytes required" },
        { status: 400 }
      );
    }

    if (sizeBytes <= 0 || sizeBytes > MAX_SIZE) {
      return Response.json({ error: "Invalid file size" }, { status: 400 });
    }

    const ext = (filename.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ error: "Allowed: zip, stl, glb, obj, pdf" }, { status: 400 });
    }

    const examSession = await db.examSession.findFirst({
      where: { id: sessionId, studentId: session.studentId },
    });
    if (!examSession) return Response.json({ error: "Session not found" }, { status: 404 });
    if (examSession.submittedAt) return Response.json({ error: "Exam already submitted" }, { status: 400 });

    const examQuestion = await db.examQuestion.findFirst({
      where: { id: questionId, sessionId },
    });
    if (!examQuestion) return Response.json({ error: "Question not found" }, { status: 404 });
    if (examQuestion.section !== "practical" || examQuestion.questionType !== "practical") {
      return Response.json({ error: "Question must be practical" }, { status: 400 });
    }

    const pf = await db.practicalFile.create({
      data: {
        sessionId,
        questionId,
        filename,
        storedPath,
        mimeType: null,
        sizeBytes,
      },
    });

    return Response.json({
      ok: true,
      file: {
        id: pf.id,
        filename: pf.filename,
        sizeBytes: pf.sizeBytes,
        uploadedAt: pf.uploadedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
