import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const questionId = request.nextUrl.searchParams.get("questionId");
  if (!sessionId || !questionId) {
    return Response.json({ error: "sessionId and questionId required" }, { status: 400 });
  }

  const examSession = await db.examSession.findFirst({
    where: { id: sessionId, studentId: session.studentId },
  });
  if (!examSession) return Response.json({ error: "Session not found" }, { status: 404 });

  const files = await db.practicalFile.findMany({
    where: { sessionId, questionId },
    orderBy: { uploadedAt: "asc" },
  });
  return Response.json({
    files: files.map((f) => ({
      id: f.id,
      filename: f.filename,
      sizeBytes: f.sizeBytes,
      uploadedAt: f.uploadedAt.toISOString(),
    })),
  });
}

export async function DELETE(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { fileId } = body;
    if (!fileId) return Response.json({ error: "fileId required" }, { status: 400 });

    const file = await db.practicalFile.findFirst({
      where: { id: fileId },
      include: { session: true },
    });
    if (!file) return Response.json({ error: "File not found" }, { status: 404 });
    if (file.session.studentId !== session.studentId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (file.session.submittedAt) {
      return Response.json({ error: "Exam already submitted" }, { status: 400 });
    }

    await db.practicalFile.delete({ where: { id: fileId } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
