import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

const ALLOWED_EXT = new Set(["zip", "stl", "glb", "obj", "pdf"]);
const MAX_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string | null;
    const questionId = formData.get("questionId") as string | null;
    const file = formData.get("file") as File | null;

    if (!sessionId || !questionId || !file || typeof file === "string") {
      return Response.json({ error: "sessionId, questionId and file required" }, { status: 400 });
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

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ error: "Allowed: zip, stl, glb, obj, pdf" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 10GB)" }, { status: 400 });
    }

    const dir = path.join(UPLOADS_DIR, sessionId, questionId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const safeName = `${Date.now()}_${sanitizeFilename(file.name)}`;
    const storedPath = path.join(sessionId, questionId, safeName);
    const fullPath = path.join(UPLOADS_DIR, storedPath);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(fullPath, buffer);

    const pf = await db.practicalFile.create({
      data: {
        sessionId,
        questionId,
        filename: file.name,
        storedPath,
        mimeType: file.type || null,
        sizeBytes: file.size,
      },
    });

    return Response.json({ ok: true, file: { id: pf.id, filename: pf.filename, sizeBytes: pf.sizeBytes, uploadedAt: pf.uploadedAt } });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
