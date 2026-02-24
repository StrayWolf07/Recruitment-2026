export interface ExamSession {
  id: string;
  studentId: string;
  phase: "theory" | "practical";
  startTime: string;
  endTime: string;
  submittedAt?: string | null;
}

export interface ExamQuestion {
  id: string;
  section: "theory" | "practical";
  questionType: "theory" | "practical";
  questionText: string;
  orderIndex: number;
}

export interface Answer {
  examQuestionId: string;
  answerText?: string | null;
  firstOpened?: string | null;
  firstTyped?: string | null;
  lastModified?: string | null;
  totalTimeSpent: number;
}
