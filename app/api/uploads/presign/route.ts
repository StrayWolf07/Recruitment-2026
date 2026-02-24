import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  R2_ENABLED,
  getPresignedPutUrl,
  MAX_UPLOAD_BYTES,
} from "@/lib/r2";

const ALLOWED_EXT = new Set(["zip", "stl", "glb", "obj", "pdf"]);
const ALLOWED_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "model/stl",
  "application/octet-stream",
  "model/gltf-binary",
  "application/pdf",
]);

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  if (!R2_ENABLED) {
    return Response.json(
      { error: "Presigned uploads not configured (R2 disabled)" },
      { status: 503 }
    );
  }

  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { sessionId, questionId, filename, contentType } = body as {
      sessionId?: string;
      questionId?: string;
      filename?: string;
      contentType?: string;
    };

    if (!sessionId || !questionId || !filename || typeof filename !== "string") {
      return Response.json(
        { error: "sessionId, questionId and filename required" },
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

    const ext = (filename.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json(
        { error: "Allowed: zip, stl, glb, obj, pdf" },
        { status: 400 }
      );
    }

    const type = (contentType ?? "").split(";")[0].trim().toLowerCase();
    if (contentType && !ALLOWED_TYPES.has(type) && type !== "application/octet-stream") {
      // Allow octet-stream for binary formats
    }

    const key = `uploads/${sessionId}/${questionId}/${Date.now()}_${sanitizeFilename(filename)}`;
    const url = await getPresignedPutUrl(key, type || "application/octet-stream");
    if (!url) {
      return Response.json(
        { error: "Failed to generate upload URL" },
        { status: 500 }
      );
    }

    return Response.json({
      url,
      key,
      maxSize: MAX_UPLOAD_BYTES,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Presign failed" }, { status: 500 });
  }
}
