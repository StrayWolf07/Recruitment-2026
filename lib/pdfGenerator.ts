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

/** All student/profile details for "Download Information" PDF */
export interface StudentInfoPDFData {
  name?: string | null;
  email: string;
  gender?: string | null;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  cgpa?: number | null;
  contactNumber?: string | null;
  emailId?: string | null;
  age?: number | null;
  location?: string | null;
  source?: string | null;
  readyToRelocate?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  brotherName?: string | null;
  sisterName?: string | null;
  spouseName?: string | null;
  childrenName?: string | null;
  graduation?: string | null;
  engineering?: string | null;
  masters?: string | null;
  pgDiploma?: string | null;
  additionalQualifications?: string | null;
  presentOrganization?: string | null;
  designation?: string | null;
  currentJobDetails?: string | null;
  teamSizeHandled?: string | null;
  reportingTo?: string | null;
  currentMonthlyCTC?: string | null;
  currentAnnualCTC?: string | null;
  expectedMonthlyCTC?: string | null;
  expectedAnnualCTC?: string | null;
  totalExperience?: string | null;
  noticePeriod?: string | null;
  reasonsForChange?: string | null;
  roleNames?: string[];
}

/** Questions + answers for "Download Answers" PDF */
export interface AnswersPDFData {
  studentName?: string | null;
  studentEmail: string;
  questions: {
    questionText: string;
    section: string;
    answerText?: string | null;
    attachmentFilenames?: string[];
  }[];
}

async function createPdfDoc() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  return { pdfDoc, font, boldFont };
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

/** Generate PDF bytes for student information — same sections and labels as profile form. */
export async function generateStudentInfoPDF(data: StudentInfoPDFData): Promise<Uint8Array> {
  const { pdfDoc, font, boldFont } = await createPdfDoc();
  let y = 750;
  const lineHeight = 14;
  const margin = 50;
  let currentPage = pdfDoc.addPage([595, 842]);

  function addText(text: string, options?: { bold?: boolean }) {
    const f = options?.bold ? boldFont : font;
    const lines = text.split("\n");
    for (const line of lines) {
      const wLines = wrapText(line, 70);
      for (const w of wLines) {
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

  function addRow(label: string, value: string | number | null | undefined) {
    const v = value != null && value !== "" ? String(value) : "—";
    addText(`${label}: ${v}`);
  }

  addText("Student Profile", { bold: true });
  addText("");

  // Basic Information (same as form)
  addText("Basic Information", { bold: true });
  addText("");
  addRow("Name", data.name);
  addRow("Gender", data.gender);
  addRow("College Name", data.college);
  addRow("Degree Type", data.degree);
  addRow("Branch", data.branch);
  addRow("CGPA (0-10)", data.cgpa != null ? String(data.cgpa) : null);
  addText(`Roles Applying For: ${(data.roleNames ?? []).length ? (data.roleNames ?? []).join(", ") : "—"}`);
  addText("");

  // Personal Details
  addText("Personal Details", { bold: true });
  addText("");
  addRow("Contact Number", data.contactNumber);
  addRow("Email ID", data.emailId);
  addRow("Age", data.age);
  addRow("Location", data.location);
  addRow("Source", data.source);
  addRow("Ready to Relocate", data.readyToRelocate);
  addText("");

  // Family Details
  addText("Family Details", { bold: true });
  addText("");
  addRow("Father's Name", data.fatherName);
  addRow("Mother's Name", data.motherName);
  addRow("Brother's Name", data.brotherName);
  addRow("Sister's Name", data.sisterName);
  addRow("Spouse's Name", data.spouseName);
  addRow("Children's Name", data.childrenName);
  addText("");

  // Education Details
  addText("Education Details", { bold: true });
  addText("");
  addRow("Graduation", data.graduation);
  addRow("Engineering", data.engineering);
  addRow("Masters", data.masters);
  addRow("PG Diploma", data.pgDiploma);
  addRow("Additional Qualifications", data.additionalQualifications);
  addText("");

  // Professional Details
  addText("Professional Details", { bold: true });
  addText("");
  addRow("Present Organization", data.presentOrganization);
  addRow("Designation", data.designation);
  addText(`Current Job Details: ${data.currentJobDetails ?? "—"}`);
  addRow("Team Size Handled", data.teamSizeHandled);
  addRow("Reporting To", data.reportingTo);
  addRow("Current Monthly CTC", data.currentMonthlyCTC);
  addRow("Current Annual CTC", data.currentAnnualCTC);
  addRow("Expected Monthly CTC", data.expectedMonthlyCTC);
  addRow("Expected Annual CTC", data.expectedAnnualCTC);
  addRow("Total Experience", data.totalExperience);
  addRow("Notice Period", data.noticePeriod);
  addText(`Reasons for Change: ${data.reasonsForChange ?? "—"}`);

  return await pdfDoc.save();
}

/** Generate PDF bytes for questions and answers only. */
export async function generateAnswersPDF(data: AnswersPDFData): Promise<Uint8Array> {
  const { pdfDoc, font, boldFont } = await createPdfDoc();
  let y = 750;
  const lineHeight = 14;
  const margin = 50;
  let currentPage = pdfDoc.addPage([595, 842]);

  function addText(text: string, options?: { bold?: boolean }) {
    const f = options?.bold ? boldFont : font;
    const lines = text.split("\n");
    for (const line of lines) {
      const wLines = wrapText(line, 70);
      for (const w of wLines) {
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

  addText("EXAM QUESTIONS & ANSWERS", { bold: true });
  addText("");
  addText(`Student: ${data.studentName ?? "N/A"} (${data.studentEmail})`);
  addText("");
  addText("--- Questions & Answers ---", { bold: true });
  for (const q of data.questions) {
    addText(`[${q.section}] ${q.questionText}`);
    addText(`Answer: ${q.answerText ?? "(none)"}`);
    if (q.attachmentFilenames && q.attachmentFilenames.length > 0) {
      addText("Attachments: " + q.attachmentFilenames.join(", "));
    }
    addText("");
  }

  return await pdfDoc.save();
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
      const wLines = wrapText(line, 70);
      for (const w of wLines) {
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

  addText("--- EVENT LOG ---", { bold: true });
  for (const e of data.blurEvents) {
    addText(`${e.eventType} @ ${e.timestamp}${e.duration != null ? ` (${e.duration}s)` : ""}`);
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `submission_${sessionId}.pdf`;
  const filepath = path.join(SUBMISSIONS_DIR, filename);
  fs.writeFileSync(filepath, pdfBytes);

  return `/submissions/${filename}`;
}
