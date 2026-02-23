import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

async function isQuestionUsed(questionId: string): Promise<boolean> {
  const count = await db.examQuestion.count({
    where: { sourceId: questionId },
  });
  return count > 0;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { questionId } = await params;
  try {
    const body = await request.json();
    const { questionText, isActive } = body;

    const theory = await db.theoryQuestion.findUnique({ where: { id: questionId } });
    const practical = await db.practicalQuestion.findUnique({ where: { id: questionId } });

    if (theory) {
      const data: { questionText?: string; isActive?: boolean } = {};
      if (typeof questionText === "string") data.questionText = questionText.trim();
      if (typeof isActive === "boolean") data.isActive = isActive;
      const q = await db.theoryQuestion.update({ where: { id: questionId }, data });
      return Response.json(q);
    }
    if (practical) {
      const data: { questionText?: string; isActive?: boolean } = {};
      if (typeof questionText === "string") data.questionText = questionText.trim();
      if (typeof isActive === "boolean") data.isActive = isActive;
      const q = await db.practicalQuestion.update({ where: { id: questionId }, data });
      return Response.json(q);
    }
    return Response.json({ error: "Question not found" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Update question failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { questionId } = await params;
  try {
    const used = await isQuestionUsed(questionId);
    if (used) {
      return Response.json(
        { error: "Question was used in an exam. Archive it instead of deleting." },
        { status: 400 }
      );
    }

    const theory = await db.theoryQuestion.findUnique({ where: { id: questionId } });
    const practical = await db.practicalQuestion.findUnique({ where: { id: questionId } });

    if (theory) {
      await db.theoryQuestion.delete({ where: { id: questionId } });
      return Response.json({ success: true });
    }
    if (practical) {
      await db.practicalQuestion.delete({ where: { id: questionId } });
      return Response.json({ success: true });
    }
    return Response.json({ error: "Question not found" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Delete question failed" }, { status: 500 });
  }
}
