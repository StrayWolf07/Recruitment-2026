import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { R2_ENABLED, MAX_UPLOAD_BYTES } from "@/lib/r2";

const ALLOWED_EXT = new Set(["zip", "stl", "glb", "obj", "pdf"]);

export async function POST(request: NextRequest) {
  if (!R2_ENABLED) {
    return Response.json(
      { error: "R2 uploads not configured" },
      { status: 503 }
    );
  }

  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { sessionId, questionId, key, filename, sizeBytes } = body as {
      sessionId?: string;
      questionId?: string;
      key?: string;
      filename?: string;
      sizeBytes?: number;
    };

    if (
      !sessionId ||
      !questionId ||
      !key ||
      !filename ||
      sizeBytes == null ||
      typeof sizeBytes !== "number"
    ) {
      return Response.json(
        { error: "sessionId, questionId, key, filename and sizeBytes required" },
        { status: 400 }
      );
    }

    if (sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: `File size must be 1–${MAX_UPLOAD_BYTES} bytes` },
        { status: 400 }
      );
    }

    const ext = (filename.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json(
        { error: "Allowed: zip, stl, glb, obj, pdf" },
        { status: 400 }
      );
    }

    const examSession = await db.examSession.findFirst({
      where: { id: sessionId, studentId: session.studentId },
    });
    if (!examSession)
      return Response.json({ error: "Session not found" }, { status: 404 });
    if (examSession.submittedAt)
      return Response.json({ error: "Exam already submitted" }, { status: 400 });

    const examQuestion = await db.examQuestion.findFirst({
      where: { id: questionId, sessionId },
    });
    if (!examQuestion)
      return Response.json({ error: "Question not found" }, { status: 404 });
    if (
      examQuestion.section !== "practical" ||
      examQuestion.questionType !== "practical"
    ) {
      return Response.json(
        { error: "Question must be practical" },
        { status: 400 }
      );
    }

    const pf = await db.practicalFile.create({
      data: {
        sessionId,
        questionId,
        filename,
        storedPath: key,
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
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
