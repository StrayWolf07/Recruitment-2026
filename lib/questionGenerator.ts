import { db } from "./db";

const THEORY_TOTAL = 10;
const PRACTICAL_TOTAL = 4;
const THEORY_PER_ROLE = 5;
const PRACTICAL_PER_ROLE = 2;

export async function generateExamQuestions(
  sessionId: string,
  roleIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const roles = roleIds.length === 0 ? [] : roleIds;

  if (roles.length === 1) {
    const [roleId] = roles;
    const theoryCount = await db.theoryQuestion.count({
      where: { roleId, isActive: true },
    });
    const practicalCount = await db.practicalQuestion.count({
      where: { roleId, isActive: true },
    });
    if (theoryCount < THEORY_TOTAL || practicalCount < PRACTICAL_TOTAL) {
      return { success: false, error: "Not enough questions available for this role." };
    }
  } else if (roles.length === 2) {
    for (const roleId of roles) {
      const theoryCount = await db.theoryQuestion.count({
        where: { roleId, isActive: true },
      });
      const practicalCount = await db.practicalQuestion.count({
        where: { roleId, isActive: true },
      });
      if (theoryCount < THEORY_PER_ROLE) {
        return { success: false, error: `Role has insufficient theory questions (need ${THEORY_PER_ROLE}, have ${theoryCount})` };
      }
      if (practicalCount < PRACTICAL_PER_ROLE) {
        return { success: false, error: `Role has insufficient practical questions (need ${PRACTICAL_PER_ROLE}, have ${practicalCount})` };
      }
    }
  } else {
    return { success: false, error: "Select 1 or 2 roles" };
  }

  const theoryToCreate: { sessionId: string; roleId: string; section: string; questionType: string; questionText: string; sourceId: string; orderIndex: number }[] = [];
  const practicalToCreate: typeof theoryToCreate = [];
  let theoryOrder = 0;
  let practicalOrder = 0;

  if (roles.length === 1) {
    const [roleId] = roles;
    const theory = await db.theoryQuestion.findMany({
      where: { roleId, isActive: true },
      take: 200,
    });
    const practical = await db.practicalQuestion.findMany({
      where: { roleId, isActive: true },
      take: 200,
    });
    const pickedTheory = shuffle([...theory]).slice(0, THEORY_TOTAL);
    const pickedPractical = shuffle([...practical]).slice(0, PRACTICAL_TOTAL);
    for (const q of pickedTheory) {
      theoryToCreate.push({
        sessionId,
        roleId,
        section: "theory",
        questionType: "theory",
        questionText: q.questionText,
        sourceId: q.id,
        orderIndex: theoryOrder++,
      });
    }
    for (const q of pickedPractical) {
      practicalToCreate.push({
        sessionId,
        roleId,
        section: "practical",
        questionType: "practical",
        questionText: q.questionText,
        sourceId: q.id,
        orderIndex: practicalOrder++,
      });
    }
  } else {
    for (const roleId of roles) {
      const theory = await db.theoryQuestion.findMany({
        where: { roleId, isActive: true },
        take: 100,
      });
      const practical = await db.practicalQuestion.findMany({
        where: { roleId, isActive: true },
        take: 100,
      });
      const pickedTheory = shuffle([...theory]).slice(0, THEORY_PER_ROLE);
      const pickedPractical = shuffle([...practical]).slice(0, PRACTICAL_PER_ROLE);
      for (const q of pickedTheory) {
        theoryToCreate.push({
          sessionId,
          roleId,
          section: "theory",
          questionType: "theory",
          questionText: q.questionText,
          sourceId: q.id,
          orderIndex: theoryOrder++,
        });
      }
      for (const q of pickedPractical) {
        practicalToCreate.push({
          sessionId,
          roleId,
          section: "practical",
          questionType: "practical",
          questionText: q.questionText,
          sourceId: q.id,
          orderIndex: practicalOrder++,
        });
      }
    }
  }

  const shuffledTheory = shuffle(theoryToCreate);
  const shuffledPractical = shuffle(practicalToCreate);
  let orderIndex = 0;
  const toCreate = [
    ...shuffledTheory.map((t) => ({ ...t, orderIndex: orderIndex++ })),
    ...shuffledPractical.map((p) => ({ ...p, orderIndex: orderIndex++ })),
  ];

  await db.examQuestion.createMany({
    data: toCreate,
  });

  return { success: true };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
