"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SubmissionTable from "@/components/admin/SubmissionTable";
import DownloadTab from "@/components/admin/DownloadTab";
import FilterPanel, { sortSubmissions, type SortColumn, type SortDirection } from "@/components/admin/FilterPanel";
import GlassCard from "@/components/ui/GlassCard";
import GlowTabs, { type GlowTab } from "@/components/ui/GlowTabs";
import GlowTextarea from "@/components/ui/GlowTextarea";
import NeonButton from "@/components/ui/NeonButton";

type Tab = "submissions" | "download" | "questions";

const TABS: GlowTab[] = [
  { id: "submissions", label: "Submissions" },
  { id: "download", label: "Download" },
  { id: "questions", label: "Question Paper" },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<unknown[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>("submittedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [roles, setRoles] = useState<unknown[]>([]);
  const [questions, setQuestions] = useState<{ theory: unknown[]; practical: unknown[] } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "submissions" || tab === "download") {
      fetch("/api/admin/get-submissions")
        .then((r) => r.json())
        .then(setSubmissions)
        .catch(() => setSubmissions([]));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "questions") {
      fetch("/api/admin/roles")
        .then((r) => r.json())
        .then((data) => {
          setRoles(data);
          if (data.length > 0 && !selectedRole) setSelectedRole(data[0].id);
        })
        .catch(() => setRoles([]));
    }
  }, [tab, selectedRole]);

  useEffect(() => {
    if (tab === "questions" && selectedRole) {
      fetch(`/api/admin/questions?roleId=${selectedRole}`)
        .then((r) => r.json())
        .then(setQuestions)
        .catch(() => setQuestions(null));
    }
  }, [tab, selectedRole]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const sortedSubmissions = useMemo(
    () => sortSubmissions(submissions as Record<string, unknown>[], sortColumn, sortDirection),
    [submissions, sortColumn, sortDirection]
  );

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 p-4 border-r border-white/10">
        <Link href="/" className="font-display font-bold text-lg tracking-head mb-6 block text-white/90 hover:text-white transition-colors">
          Recruitment Exam
        </Link>
        <nav className="space-y-1">
          <button
            onClick={() => setTab("submissions")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
              tab === "submissions"
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setTab("download")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
              tab === "download"
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Download
          </button>
          <button
            onClick={() => setTab("questions")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
              tab === "questions"
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Question Paper
          </button>
          <Link
            href="/admin/technical"
            className="w-full text-left px-4 py-2 rounded-lg transition-all block text-white/70 hover:bg-white/5 hover:text-white"
          >
            Technical Interview
          </Link>
        </nav>
        <div className="mt-8 pt-4 border-t border-white/10">
          <NeonButton variant="secondary" onClick={handleLogout} className="w-full">
            Logout
          </NeonButton>
        </div>
      </aside>
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-bold text-2xl tracking-head">Admin Dashboard</h1>
        </div>
        <GlassCard className="p-6">
          <GlowTabs tabs={TABS} activeId={tab} onChange={(id) => setTab(id as Tab)} />
          <div className="mt-6">
            {tab === "submissions" && (
              <>
                <FilterPanel
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSortColumnChange={setSortColumn}
                  onSortDirectionChange={setSortDirection}
                />
                <SubmissionTable submissions={sortedSubmissions} />
              </>
            )}
            {tab === "download" && <DownloadTab submissions={sortedSubmissions} />}
            {tab === "questions" && (
              <QuestionPaperTab
                roles={roles}
                setRoles={setRoles}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                questions={questions}
                onRefresh={() => {
                  fetch("/api/admin/roles")
                    .then((r) => r.json())
                    .then(setRoles)
                    .catch(() => setRoles([]));
                  if (selectedRole) {
                    fetch(`/api/admin/questions?roleId=${selectedRole}`)
                      .then((r) => r.json())
                      .then(setQuestions)
                      .catch(() => setQuestions(null));
                  }
                }}
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function QuestionPaperTab({
  roles,
  setRoles,
  selectedRole,
  setSelectedRole,
  questions,
  onRefresh,
}: {
  roles: unknown[];
  setRoles: (r: unknown[]) => void;
  selectedRole: string | null;
  setSelectedRole: (v: string | null) => void;
  questions: { theory: unknown[]; practical: unknown[] } | null;
  onRefresh: () => void;
}) {
  const [newRoleName, setNewRoleName] = useState("");
  const [newQText, setNewQText] = useState("");
  const [newQType, setNewQType] = useState<"theory" | "practical">("theory");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const addRole = async () => {
    if (!newRoleName.trim()) return;
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName.trim() }),
    });
    if (res.ok) {
      setNewRoleName("");
      onRefresh();
      const data = await fetch("/api/admin/roles").then((r) => r.json());
      const last = (data as { id: string }[])[data.length - 1];
      if (last) setSelectedRole(last.id);
    }
  };

  const addQuestion = async () => {
    if (!newQText.trim() || !selectedRole) return;
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newQType,
        roleId: selectedRole,
        questionText: newQText.trim(),
      }),
    });
    if (res.ok) {
      setNewQText("");
      onRefresh();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    onRefresh();
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingText.trim()) return;
    const res = await fetch(`/api/admin/questions/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText: editingText.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingText("");
      onRefresh();
    } else {
      const d = await res.json();
      alert(d.error || "Update failed");
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question? (Only if never used in an exam)")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (res.ok) onRefresh();
    else {
      const d = await res.json();
      alert(d.error || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium mb-2 text-white/90">Add Role</h2>
        <div className="flex gap-2">
          <input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Role name"
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-neonBlue/60"
          />
          <NeonButton onClick={addRole}>Add</NeonButton>
        </div>
      </div>
      <div>
        <h2 className="font-medium mb-2 text-white/90">Select Role</h2>
        <select
          value={selectedRole ?? ""}
          onChange={(e) => setSelectedRole(e.target.value || null)}
          className="w-full max-w-xs px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-neonBlue/60 [&>option]:bg-deepBg"
        >
          {((roles ?? []) as { id: string; name: string }[]).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      {selectedRole && (
        <>
          <div>
            <h2 className="font-medium mb-2 text-white/90">Add Question</h2>
            <p className="text-white/50 text-xs mb-2">Use Enter or Shift+Enter for line breaks. Paste preserves formatting.</p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as "theory" | "practical")}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white [&>option]:bg-deepBg"
                >
                  <option value="theory">Theory</option>
                  <option value="practical">Practical</option>
                </select>
                <NeonButton onClick={addQuestion} className="shrink-0">Add</NeonButton>
              </div>
              <GlowTextarea
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="Question text (line breaks preserved when pasted or using Enter)"
                rows={5}
                className="font-mono text-sm min-h-[120px]"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">Theory Questions</h3>
            <div className="space-y-2">
              {((questions?.theory ?? []) as { id: string; questionText: string; isActive: boolean }[]).map((q) => (
                <GlassCard key={q.id} className="p-4 flex justify-between items-start gap-4">
                  {editingId === q.id ? (
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <GlowTextarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={5}
                        className="font-mono text-sm min-h-[100px]"
                        placeholder="Question text"
                        autoFocus
                      />
                      <span className="flex gap-2">
                        <NeonButton className="!px-3 !py-1.5 text-xs" onClick={saveEdit}>Save</NeonButton>
                        <NeonButton variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={cancelEdit}>Cancel</NeonButton>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-sm bg-black/30 p-4 rounded-xl border border-white/10 ${!q.isActive ? "line-through text-white/50" : "text-white/90"}`}>
                        {q.questionText}
                      </div>
                      <span className="flex gap-2 shrink-0">
                        <NeonButton variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => startEdit(q.id, q.questionText)}>Edit</NeonButton>
                        <NeonButton variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => toggleActive(q.id, q.isActive)}>
                          {q.isActive ? "Archive" : "Activate"}
                        </NeonButton>
                        <NeonButton variant="danger" className="!px-2 !py-1 text-xs" onClick={() => deleteQuestion(q.id)}>Delete</NeonButton>
                      </span>
                    </>
                  )}
                </GlassCard>
              ))}
            </div>
            {(!questions?.theory || questions.theory.length === 0) && (
              <p className="text-white/50 text-sm">No theory questions. Add at least 5 per role.</p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-white/90">Practical Questions</h3>
            <div className="space-y-2">
              {((questions?.practical ?? []) as { id: string; questionText: string; isActive: boolean }[]).map((q) => (
                <GlassCard key={q.id} className="p-4 flex justify-between items-start gap-4">
                  {editingId === q.id ? (
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <GlowTextarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={5}
                        className="font-mono text-sm min-h-[100px]"
                        placeholder="Question text"
                        autoFocus
                      />
                      <span className="flex gap-2">
                        <NeonButton className="!px-3 !py-1.5 text-xs" onClick={saveEdit}>Save</NeonButton>
                        <NeonButton variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={cancelEdit}>Cancel</NeonButton>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-sm bg-black/30 p-4 rounded-xl border border-white/10 ${!q.isActive ? "line-through text-white/50" : "text-white/90"}`}>
                        {q.questionText}
                      </div>
                      <span className="flex gap-2 shrink-0">
                        <NeonButton variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => startEdit(q.id, q.questionText)}>Edit</NeonButton>
                        <NeonButton variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => toggleActive(q.id, q.isActive)}>
                          {q.isActive ? "Archive" : "Activate"}
                        </NeonButton>
                        <NeonButton variant="danger" className="!px-2 !py-1 text-xs" onClick={() => deleteQuestion(q.id)}>Delete</NeonButton>
                      </span>
                    </>
                  )}
                </GlassCard>
              ))}
            </div>
            {(!questions?.practical || questions.practical.length === 0) && (
              <p className="text-white/50 text-sm">No practical questions. Add at least 2 per role.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
