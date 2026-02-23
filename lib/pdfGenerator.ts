import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

const SUBMISSIONS_DIR = path.join(process.cwd(), "public", "submissions");

export interface PDFData {
  studentName?: string | null;
  studentEmail: string;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  cgpa?: number | null;
  roleNames: string[];
  startTime: string;
  endTime: string;
  submittedAt: string;
  totalTabSwitches: number;
  totalTimeAway: number;
  theoryTabViolation?: boolean;
  terminationReason?: string | null;
  terminatedAt?: string | null;
  totalScore: number;
  questions: {
    questionText: string;
    section: string;
    answerText?: string | null;
    firstOpened?: string | null;
    lastModified?: string | null;
    totalTimeSpent: number;
    scoreAwarded: number;
    attachmentFilenames?: string[];
  }[];
  blurEvents: { eventType: string; timestamp: string; duration?: number | null }[];
}

export async function generateAndSavePDF(sessionId: string, data: PDFData): Promise<string> {
  if (!fs.existsSync(SUBMISSIONS_DIR)) {
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = 750;
  const lineHeight = 14;
  const margin = 50;

  let currentPage = pdfDoc.addPage([595, 842]);

  function addText(text: string, options?: { bold?: boolean }) {
    const f = options?.bold ? boldFont : font;
    const lines = text.split("\n");
    for (const line of lines) {
      const wrap = wrapText(line, 70);
      for (const w of wrap) {
        if (y < 50) {
          currentPage = pdfDoc.addPage([595, 842]);
          y = 800;
        }
        currentPage.drawText(w, {
          x: margin,
          y,
          size: 10,
          font: f,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
    }
  }

  function wrapText(t: string, maxChars: number): string[] {
    const words = t.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      if (current.length + w.length + 1 <= maxChars) {
        current += (current ? " " : "") + w;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  addText("EXAM SUBMISSION REPORT", { bold: true });
  addText("");
  addText(`Student: ${data.studentName || "N/A"}`);
  addText(`Email: ${data.studentEmail}`);
  addText(`College: ${data.college || "N/A"}`);
  addText(`Degree: ${data.degree || "N/A"}`);
  addText(`Branch: ${data.branch || "N/A"}`);
  addText(`CGPA: ${data.cgpa ?? "N/A"}`);
  addText(`Roles: ${data.roleNames.join(", ")}`);
  addText(`Start: ${data.startTime}`);
  addText(`End: ${data.endTime}`);
  addText(`Submitted: ${data.submittedAt}`);
  addText(`Total Tab Switches: ${data.totalTabSwitches}`);
  addText(`Total Time Away: ${data.totalTimeAway} seconds`);
  if (data.theoryTabViolation) {
    addText(`Theory Violation: Yes`, { bold: true });
    addText(`Termination Reason: ${data.terminationReason || "Tab switched during theory section"}`);
    if (data.terminatedAt) addText(`Terminated At: ${data.terminatedAt}`);
  }
  addText(`Total Score: ${data.totalScore}`);
  addText("");

  addText("--- ANSWERS ---", { bold: true });
  for (const q of data.questions) {
    addText(`[${q.section}] ${q.questionText}`);
    addText(`Answer: ${q.answerText || "(none)"}`);
    addText(`Time Opened: ${q.firstOpened || "N/A"}`);
    addText(`Time Closed: ${q.lastModified || "N/A"}`);
    addText(`Time Spent: ${q.totalTimeSpent}s`);
    addText(`Score Awarded: ${q.scoreAwarded}`);
    if (q.attachmentFilenames && q.attachmentFilenames.length > 0) {
      addText("Attachments:");
      for (const fn of q.attachmentFilenames) addText(`  - ${fn}`);
    }
    addText("");
  }

  addText("--- TAB SWITCH LOG ---", { bold: true });
  for (const e of data.blurEvents) {
    addText(`${e.eventType} @ ${e.timestamp}${e.duration != null ? ` (${e.duration}s away)` : ""}`);
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `submission_${sessionId}.pdf`;
  const filepath = path.join(SUBMISSIONS_DIR, filename);
  fs.writeFileSync(filepath, pdfBytes);

  return `/submissions/${filename}`;
}
