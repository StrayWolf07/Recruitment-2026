"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowInput from "@/components/ui/GlowInput";
import NeonButton from "@/components/ui/NeonButton";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return formatTime(s);
}

export default function AdminEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [data, setData] = useState<{
    session: {
      studentName?: string | null;
      college?: string | null;
      degree?: string | null;
      branch?: string | null;
      cgpa?: number | null;
      roles: string[];
      totalExamTimeSec: number;
      totalTabSwitches: number;
      totalTimeAway: number;
      theoryTabViolation?: boolean;
      terminationReason?: string | null;
      terminatedAt?: string | null;
      candidateDetails?: {
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
      };
    };
    questions: {
      id: string;
      questionText: string;
      section: string;
      files?: { id: number; filename: string; storedPath: string; sizeBytes: number }[];
      answer?: {
        id: string;
        answerText?: string | null;
        firstOpened?: string | null;
        lastModified?: string | null;
        totalTimeSpent: number;
        scoreAwarded?: number | null;
        openedAt?: string | null;
        closedAt?: string | null;
        activeTimeMs?: number;
      };
    }[];
  } | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/get-evaluation?sessionId=${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load evaluation data"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (data) {
      const init: Record<string, number> = {};
      for (const q of data.questions) {
        if (q.answer) init[q.answer.id] = q.answer.scoreAwarded ?? 0;
      }
      setScores(init);
    }
  }, [data]);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, scores }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-8"><span className="text-white/70">Loading...</span></div>;
  if (error && !data) return <div className="min-h-screen p-8 text-red-400">{error}</div>;
  if (!data) return <div className="min-h-screen p-8">No data</div>;

  const { session } = data;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/admin/dashboard" className="text-neonBlue hover:text-neonBlue/80 mb-6 inline-block transition-colors">
        ← Back to Dashboard
      </Link>
      <h1 className="font-display font-bold text-2xl tracking-head mb-6">Evaluate Submission</h1>

      <GlassCard className={`p-6 mb-6 ${session.theoryTabViolation ? "border-red-500/50 bg-red-500/5" : ""}`}>
        <h2 className="font-medium mb-4 text-white/90">Student Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-white/50">Name:</span> <span className="text-white/90">{session.studentName || "—"}</span></div>
          <div><span className="text-white/50">College:</span> <span className="text-white/90">{session.college || "—"}</span></div>
          <div><span className="text-white/50">Degree:</span> <span className="text-white/90">{session.degree || "—"}</span></div>
          <div><span className="text-white/50">Branch:</span> <span className="text-white/90">{session.branch || "—"}</span></div>
          <div><span className="text-white/50">CGPA:</span> <span className="text-neonBlue">{session.cgpa ?? "—"}</span></div>
          <div><span className="text-white/50">Roles:</span> <span className="text-white/90">{session.roles?.join(", ") || "—"}</span></div>
          <div><span className="text-white/50">Total Time:</span> <span className="text-white/90">{formatTime(session.totalExamTimeSec)}</span></div>
          <div><span className="text-white/50">Total Tab Switches:</span> <span className="text-neonPink">{session.totalTabSwitches}</span></div>
          <div><span className="text-white/50">Time Away:</span> <span className="text-neonPink">{formatTime(session.totalTimeAway)}</span></div>
          <div><span className="text-white/50">Theory Violation:</span> <span className={session.theoryTabViolation ? "text-red-400 font-medium" : "text-white/90"}>{session.theoryTabViolation ? "Yes" : "No"}</span></div>
          <div><span className="text-white/50">Termination Reason:</span> <span className="text-white/90">{session.terminationReason || "—"}</span></div>
          <div><span className="text-white/50">Terminated Early:</span> <span className="text-white/90">{session.terminatedAt ? "Yes" : "No"}</span></div>
        </div>
      </GlassCard>

      {session.candidateDetails && (
        <GlassCard className="p-6 mb-6">
          <h2 className="font-medium mb-4 text-white/90">Candidate Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-2">Personal</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {session.candidateDetails.contactNumber && <div><span className="text-white/50">Contact:</span> <span className="text-white/90">{session.candidateDetails.contactNumber}</span></div>}
                {session.candidateDetails.emailId && <div><span className="text-white/50">Email ID:</span> <span className="text-white/90">{session.candidateDetails.emailId}</span></div>}
                {session.candidateDetails.age != null && <div><span className="text-white/50">Age:</span> <span className="text-white/90">{session.candidateDetails.age}</span></div>}
                {session.candidateDetails.location && <div><span className="text-white/50">Location:</span> <span className="text-white/90">{session.candidateDetails.location}</span></div>}
                {session.candidateDetails.source && <div><span className="text-white/50">Source:</span> <span className="text-white/90">{session.candidateDetails.source}</span></div>}
                {session.candidateDetails.readyToRelocate && <div><span className="text-white/50">Ready to Relocate:</span> <span className="text-white/90">{session.candidateDetails.readyToRelocate}</span></div>}
              </div>
              {![session.candidateDetails.contactNumber, session.candidateDetails.emailId, session.candidateDetails.age, session.candidateDetails.location, session.candidateDetails.source, session.candidateDetails.readyToRelocate].some(Boolean) && (
                <p className="text-white/50 text-sm">No personal details provided.</p>
              )}
            </div>
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-2">Family</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {session.candidateDetails.fatherName && <div><span className="text-white/50">Father:</span> <span className="text-white/90">{session.candidateDetails.fatherName}</span></div>}
                {session.candidateDetails.motherName && <div><span className="text-white/50">Mother:</span> <span className="text-white/90">{session.candidateDetails.motherName}</span></div>}
                {session.candidateDetails.brotherName && <div><span className="text-white/50">Brother:</span> <span className="text-white/90">{session.candidateDetails.brotherName}</span></div>}
                {session.candidateDetails.sisterName && <div><span className="text-white/50">Sister:</span> <span className="text-white/90">{session.candidateDetails.sisterName}</span></div>}
                {session.candidateDetails.spouseName && <div><span className="text-white/50">Spouse:</span> <span className="text-white/90">{session.candidateDetails.spouseName}</span></div>}
                {session.candidateDetails.childrenName && <div><span className="text-white/50">Children:</span> <span className="text-white/90">{session.candidateDetails.childrenName}</span></div>}
              </div>
              {![session.candidateDetails.fatherName, session.candidateDetails.motherName, session.candidateDetails.brotherName, session.candidateDetails.sisterName, session.candidateDetails.spouseName, session.candidateDetails.childrenName].some(Boolean) && (
                <p className="text-white/50 text-sm">No family details provided.</p>
              )}
            </div>
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-2">Education</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {session.candidateDetails.graduation && <div><span className="text-white/50">Graduation:</span> <span className="text-white/90">{session.candidateDetails.graduation}</span></div>}
                {session.candidateDetails.engineering && <div><span className="text-white/50">Engineering:</span> <span className="text-white/90">{session.candidateDetails.engineering}</span></div>}
                {session.candidateDetails.masters && <div><span className="text-white/50">Masters:</span> <span className="text-white/90">{session.candidateDetails.masters}</span></div>}
                {session.candidateDetails.pgDiploma && <div><span className="text-white/50">PG Diploma:</span> <span className="text-white/90">{session.candidateDetails.pgDiploma}</span></div>}
                {session.candidateDetails.additionalQualifications && <div className="sm:col-span-2"><span className="text-white/50">Additional:</span> <span className="text-white/90">{session.candidateDetails.additionalQualifications}</span></div>}
              </div>
              {![session.candidateDetails.graduation, session.candidateDetails.engineering, session.candidateDetails.masters, session.candidateDetails.pgDiploma, session.candidateDetails.additionalQualifications].some(Boolean) && (
                <p className="text-white/50 text-sm">No education details provided.</p>
              )}
            </div>
            <div>
              <h3 className="text-white/70 text-sm font-medium mb-2">Professional</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {session.candidateDetails.presentOrganization && <div><span className="text-white/50">Organization:</span> <span className="text-white/90">{session.candidateDetails.presentOrganization}</span></div>}
                {session.candidateDetails.designation && <div><span className="text-white/50">Designation:</span> <span className="text-white/90">{session.candidateDetails.designation}</span></div>}
                {session.candidateDetails.totalExperience && <div><span className="text-white/50">Experience:</span> <span className="text-white/90">{session.candidateDetails.totalExperience}</span></div>}
                {session.candidateDetails.teamSizeHandled && <div><span className="text-white/50">Team Size:</span> <span className="text-white/90">{session.candidateDetails.teamSizeHandled}</span></div>}
                {session.candidateDetails.reportingTo && <div><span className="text-white/50">Reporting To:</span> <span className="text-white/90">{session.candidateDetails.reportingTo}</span></div>}
                {session.candidateDetails.currentMonthlyCTC && <div><span className="text-white/50">Current Monthly CTC:</span> <span className="text-white/90">{session.candidateDetails.currentMonthlyCTC}</span></div>}
                {session.candidateDetails.currentAnnualCTC && <div><span className="text-white/50">Current Annual CTC:</span> <span className="text-white/90">{session.candidateDetails.currentAnnualCTC}</span></div>}
                {session.candidateDetails.expectedMonthlyCTC && <div><span className="text-white/50">Expected Monthly CTC:</span> <span className="text-white/90">{session.candidateDetails.expectedMonthlyCTC}</span></div>}
                {session.candidateDetails.expectedAnnualCTC && <div><span className="text-white/50">Expected Annual CTC:</span> <span className="text-white/90">{session.candidateDetails.expectedAnnualCTC}</span></div>}
                {session.candidateDetails.noticePeriod && <div><span className="text-white/50">Notice Period:</span> <span className="text-white/90">{session.candidateDetails.noticePeriod}</span></div>}
              </div>
              {session.candidateDetails.currentJobDetails && (
                <div className="mt-2 text-sm"><span className="text-white/50">Job Details:</span> <p className="text-white/90 mt-1 whitespace-pre-wrap">{session.candidateDetails.currentJobDetails}</p></div>
              )}
              {session.candidateDetails.reasonsForChange && (
                <div className="mt-2 text-sm"><span className="text-white/50">Reasons for Change:</span> <p className="text-white/90 mt-1 whitespace-pre-wrap">{session.candidateDetails.reasonsForChange}</p></div>
              )}
              {![session.candidateDetails.presentOrganization, session.candidateDetails.designation, session.candidateDetails.currentJobDetails, session.candidateDetails.totalExperience].some(Boolean) && (
                <p className="text-white/50 text-sm">No professional details provided.</p>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-6 mb-8">
        {data.questions.map((q) => (
          <GlassCard key={q.id} className="p-6">
            <p className="font-medium mb-2 text-white/70 text-xs">[{q.section}]</p>
            <div className="whitespace-pre-wrap break-words font-mono text-sm bg-black/30 p-4 rounded-xl border border-white/10 text-white/90 mb-4">
              {q.questionText}
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <strong className="text-white/80">Answer:</strong>
              <p className="mt-2 text-white/90">{q.answer?.answerText || "(none)"}</p>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs">Opened At: {q.answer?.openedAt ? new Date(q.answer.openedAt).toLocaleString() : (q.answer?.firstOpened ? new Date(q.answer.firstOpened).toLocaleString() : "—")}</div>
              <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs">Closed At: {q.answer?.closedAt ? new Date(q.answer.closedAt).toLocaleString() : (q.answer?.lastModified ? new Date(q.answer.lastModified).toLocaleString() : "—")}</div>
              <div className="px-3 py-1.5 rounded-lg bg-neonBlue/20 text-neonBlue text-xs">Time Spent: {q.answer?.activeTimeMs != null ? formatMs(q.answer.activeTimeMs) : `${q.answer?.totalTimeSpent ?? 0}s`}</div>
            </div>
            {q.section === "practical" && q.files && q.files.length > 0 && (
              <div className="mb-4">
                <strong className="text-white/80">Attachments:</strong>
                <ul className="mt-2 space-y-1">
                  {q.files.map((f) => (
                    <li key={f.id}>
                      <a href={`/uploads/${f.storedPath}`} target="_blank" rel="noopener noreferrer" className="text-neonBlue hover:text-neonBlue/80 text-sm">
                        {f.filename} ({Math.round(f.sizeBytes / 1024)} KB)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/80">Score:</label>
              <GlowInput
                type="number"
                min="0"
                value={q.answer ? (scores[q.answer.id] ?? 0) : 0}
                onChange={(e) =>
                  q.answer &&
                  setScores((prev) => ({ ...prev, [q.answer!.id]: parseInt(e.target.value, 10) || 0 }))
                }
                className="w-24"
              />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="sticky bottom-4">
        <GlassCard className="p-4 flex items-center justify-between gap-4">
          <span className="font-display font-bold text-xl">
            Total Score: <span className="text-neonBlue">{totalScore}</span>
          </span>
          <NeonButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Evaluation"}
          </NeonButton>
        </GlassCard>
      </div>
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
