"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlassTable, { GlassTableHead, GlassTableBody, GlassTableRow } from "@/components/ui/GlassTable";
import NeonButton from "@/components/ui/NeonButton";

interface TechnicalItem {
  id: string;
  studentName?: string | null;
  college?: string | null;
  roles: string[];
  totalScore?: number | null;
  hasEvaluation: boolean;
}

export default function AdminTechnicalPage() {
  const [items, setItems] = useState<TechnicalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/technical-list")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 p-4 border-r border-white/10">
        <Link href="/admin/dashboard" className="font-display font-bold text-lg tracking-head mb-6 block text-white/90 hover:text-white transition-colors">
          Recruitment Exam
        </Link>
        <nav className="space-y-1">
          <Link href="/admin/dashboard" className="block w-full text-left px-4 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all">
            Dashboard
          </Link>
          <span className="block w-full text-left px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20">
            Technical Interview
          </span>
        </nav>
      </aside>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="font-display font-bold text-2xl tracking-head mb-6">Technical Interview</h1>
        <GlassCard className="p-6">
          {loading ? (
            <p className="text-white/70">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-white/50">No candidates marked for technical round yet. Use &quot;Next Round&quot; on the evaluation page to add candidates.</p>
          ) : (
            <GlassTable>
              <GlassTableHead>
                <tr>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Candidate Name</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">College</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Role</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Exam Score</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Interview Status</th>
                  <th className="py-3 px-4 text-white/80 font-medium">Action</th>
                </tr>
              </GlassTableHead>
              <GlassTableBody>
                {items.map((s) => (
                  <GlassTableRow key={s.id}>
                    <td className="py-3 px-4 text-white/90">{s.studentName || "—"}</td>
                    <td className="py-3 px-4 text-white/80">{s.college || "—"}</td>
                    <td className="py-3 px-4 text-white/80">{s.roles?.join(", ") || "—"}</td>
                    <td className="py-3 px-4 text-center text-white/80">{s.totalScore ?? "—"}</td>
                    <td className="py-3 px-4 text-white/80">
                      {s.hasEvaluation ? (
                        <span className="text-neonBlue">Completed</span>
                      ) : (
                        <span className="text-amber-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/technical/${s.id}`}>
                        <NeonButton variant="secondary" className="!px-3 !py-1.5 text-sm">
                          Evaluate
                        </NeonButton>
                      </Link>
                    </td>
                  </GlassTableRow>
                ))}
              </GlassTableBody>
            </GlassTable>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
