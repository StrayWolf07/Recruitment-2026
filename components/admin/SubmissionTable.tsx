"use client";

import Link from "next/link";
import GlassTable, { GlassTableHead, GlassTableBody, GlassTableRow } from "@/components/ui/GlassTable";
import NeonButton from "@/components/ui/NeonButton";

interface Submission {
  id: string;
  studentName?: string | null;
  studentEmail: string;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  cgpa?: number | null;
  roles: string[];
  submittedAt: string;
  totalTabSwitches: number;
  totalTimeAway: number;
  theoryTabViolation?: boolean;
  terminationReason?: string | null;
  terminatedEarly?: boolean;
  evaluationStatus?: string;
  totalScore?: number | null;
}

export default function SubmissionTable({
  submissions,
}: {
  submissions: unknown[];
}) {
  const items = submissions as Submission[];

  return (
    <div className="space-y-4">
      <GlassTable>
        <GlassTableHead>
          <tr>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Name</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">College</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Degree</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Branch</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">CGPA</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Roles</th>
            <th className="text-center py-3 px-4 text-white/80 font-medium">Tab Switches</th>
            <th className="text-center py-3 px-4 text-white/80 font-medium">Theory Violation</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Termination Reason</th>
            <th className="text-center py-3 px-4 text-white/80 font-medium">Terminated Early</th>
            <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
            <th className="text-center py-3 px-4 text-white/80 font-medium">Score</th>
            <th className="py-3 px-4 text-white/80 font-medium">Actions</th>
          </tr>
        </GlassTableHead>
        <GlassTableBody>
          {items.map((s) => (
            <GlassTableRow key={s.id} className={s.theoryTabViolation ? "!bg-red-500/15 border-l-4 border-l-red-500" : ""}>
              <td className="py-3 px-4 text-white/90">{s.studentName || "—"}</td>
              <td className="py-3 px-4 text-white/80">{s.college || "—"}</td>
              <td className="py-3 px-4 text-white/80">{s.degree || "—"}</td>
              <td className="py-3 px-4 text-white/80">{s.branch || "—"}</td>
              <td className="py-3 px-4 text-white/80">{s.cgpa ?? "—"}</td>
              <td className="py-3 px-4 text-white/80">{s.roles?.join(", ") || "—"}</td>
              <td className="py-3 px-4 text-center text-white/80">{s.totalTabSwitches}</td>
              <td className="py-3 px-4 text-center">
                <span className={s.theoryTabViolation ? "text-red-400 font-medium" : "text-white/80"}>{s.theoryTabViolation ? "Yes" : "No"}</span>
              </td>
              <td className="py-3 px-4 text-white/80 max-w-[150px] truncate" title={s.terminationReason || undefined}>{s.terminationReason || "—"}</td>
              <td className="py-3 px-4 text-center text-white/80">{s.terminatedEarly ? "Yes" : "No"}</td>
              <td className="py-3 px-4 text-white/80">{s.evaluationStatus || "pending"}</td>
              <td className="py-3 px-4 text-center">
                {s.evaluationStatus === "evaluated" ? (
                  <span className="text-neonBlue font-medium">{s.totalScore ?? "—"}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-3 px-4">
                <span className="flex gap-2 flex-wrap">
                  <Link href={`/admin/evaluate/${s.id}`}>
                    <NeonButton variant="secondary" className="!px-3 !py-1.5 text-sm">
                      {s.evaluationStatus === "evaluated" ? "Edit" : "Evaluate"}
                    </NeonButton>
                  </Link>
                  {s.evaluationStatus === "evaluated" && (
                    <a href={`/api/admin/pdf/${s.id}`} target="_blank" rel="noopener noreferrer">
                      <NeonButton className="!px-3 !py-1.5 text-sm">
                        Download
                      </NeonButton>
                    </a>
                  )}
                </span>
              </td>
            </GlassTableRow>
          ))}
        </GlassTableBody>
      </GlassTable>
      {items.length === 0 && (
        <p className="text-white/50 py-8 text-center">No submissions yet.</p>
      )}
    </div>
  );
}
