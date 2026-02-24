"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassTable, { GlassTableHead, GlassTableBody, GlassTableRow } from "@/components/ui/GlassTable";
import NeonButton from "@/components/ui/NeonButton";

interface Submission {
  id: string;
  studentName?: string | null;
  studentEmail: string;
  college?: string | null;
  submittedAt: string;
}

function usePdfDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (url: string, defaultFilename: string) => {
    setError(null);
    setDownloading(url);
    try {
      const res = await fetch(url, { credentials: "include" });
      const contentType = res.headers.get("Content-Type") || "";
      if (!res.ok) {
        const text = await res.text();
        let msg = "Download failed";
        try {
          const j = JSON.parse(text);
          if (j.error) msg = j.error;
        } catch {
          if (text.length < 200) msg = text;
        }
        setError(msg);
        return;
      }
      if (!contentType.includes("application/pdf")) {
        setError("Server did not return a PDF. You may need to log in again.");
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition");
      let filename = defaultFilename;
      const match = disp && /filename="?([^";\n]+)"?/i.exec(disp);
      if (match) filename = match[1].trim();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  return { downloadPdf, downloading, error, setError };
}

export default function DownloadTab({ submissions }: { submissions: unknown[] }) {
  const items = submissions as Submission[];
  const { downloadPdf, downloading, error, setError } = usePdfDownload();

  return (
    <div className="space-y-4">
      <p className="text-white/70 text-sm">
        Download student information (all profile details) or questions & answers as PDF for any submitted exam.
      </p>
      {error && (
        <GlassCard className="p-4 border-red-500/50 bg-red-500/10 flex items-center justify-between gap-4">
          <span className="text-red-200 text-sm">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-white/80 hover:text-white text-sm">
            Dismiss
          </button>
        </GlassCard>
      )}
      <GlassCard className="p-4 overflow-x-auto">
        <GlassTable>
          <GlassTableHead>
            <tr>
              <th className="text-left py-3 px-4 text-white/80 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-white/80 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-white/80 font-medium">College</th>
              <th className="text-left py-3 px-4 text-white/80 font-medium">Submitted</th>
              <th className="py-3 px-4 text-white/80 font-medium">Download</th>
            </tr>
          </GlassTableHead>
          <GlassTableBody>
            {items.map((s) => (
              <GlassTableRow key={s.id}>
                <td className="py-3 px-4 text-white/90">{s.studentName || "—"}</td>
                <td className="py-3 px-4 text-white/80">{s.studentEmail}</td>
                <td className="py-3 px-4 text-white/80">{s.college || "—"}</td>
                <td className="py-3 px-4 text-white/80">
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                </td>
                <td className="py-3 px-4">
                  <span className="flex gap-2 flex-wrap">
                    <NeonButton
                      variant="secondary"
                      className="!px-3 !py-1.5 text-sm"
                      disabled={!!downloading}
                      onClick={() =>
                        downloadPdf(`/api/admin/pdf-info/${s.id}`, `student_info_${s.id}.pdf`)
                      }
                    >
                      {downloading === `/api/admin/pdf-info/${s.id}` ? "..." : "Information (PDF)"}
                    </NeonButton>
                    <NeonButton
                      variant="secondary"
                      className="!px-3 !py-1.5 text-sm"
                      disabled={!!downloading}
                      onClick={() =>
                        downloadPdf(`/api/admin/pdf-answers/${s.id}`, `answers_${s.id}.pdf`)
                      }
                    >
                      {downloading === `/api/admin/pdf-answers/${s.id}` ? "..." : "Answers (PDF)"}
                    </NeonButton>
                  </span>
                </td>
              </GlassTableRow>
            ))}
          </GlassTableBody>
        </GlassTable>
        {items.length === 0 && (
          <p className="text-white/50 py-8 text-center">No submissions to download.</p>
        )}
      </GlassCard>
    </div>
  );
}
