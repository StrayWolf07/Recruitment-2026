"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowInput from "@/components/ui/GlowInput";
import GlowTextarea from "@/components/ui/GlowTextarea";
import NeonButton from "@/components/ui/NeonButton";

const RATING_OPTIONS = [
  { value: "VERY_GOOD", label: "Very Good" },
  { value: "GOOD", label: "Good" },
  { value: "AVERAGE", label: "Average" },
  { value: "POOR", label: "Poor" },
] as const;

const OVERALL_OPTIONS = ["Excellent", "Very Good", "Good", "Average"];
const FURTHER_ACTION_OPTIONS = ["Hold", "Next Round", "Suitable", "Not Suitable"];

const CATEGORIES = [
  { key: "conduct", label: "Conduct" },
  { key: "discipline", label: "Discipline" },
  { key: "knowledge", label: "Knowledge" },
  { key: "analysis", label: "Analysis" },
  { key: "communication", label: "Communication" },
  { key: "maturity", label: "Maturity of Answer" },
  { key: "reliability", label: "Reliability" },
  { key: "understanding", label: "Understanding" },
  { key: "attitude", label: "Attitude" },
] as const;

type RatingKey = (typeof CATEGORIES)[number]["key"];
type RatingValue = (typeof RATING_OPTIONS)[number]["value"];

export default function TechnicalInterviewFormPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<{ studentName?: string; college?: string; roles: string[]; totalScore?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ratings, setRatings] = useState<Record<RatingKey, RatingValue | "">>({
    conduct: "",
    discipline: "",
    knowledge: "",
    analysis: "",
    communication: "",
    maturity: "",
    reliability: "",
    understanding: "",
    attitude: "",
  });
  const [remarks, setRemarks] = useState<Record<RatingKey, string>>({
    conduct: "",
    discipline: "",
    knowledge: "",
    analysis: "",
    communication: "",
    maturity: "",
    reliability: "",
    understanding: "",
    attitude: "",
  });
  const [overallRating, setOverallRating] = useState("");
  const [furtherAction, setFurtherAction] = useState("");
  const [suggestedRole, setSuggestedRole] = useState("");
  const [suggestedProject, setSuggestedProject] = useState("");
  const [suggestedLead, setSuggestedLead] = useState("");
  const [others, setOthers] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerPlace, setInterviewerPlace] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  useEffect(() => {
    fetch(`/api/admin/technical-evaluation?sessionId=${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        setSession(data.session);
        const ev = data.evaluation;
        if (ev) {
          CATEGORIES.forEach(({ key }) => {
            const rKey = `${key}Rating` as keyof typeof ev;
            const mKey = `${key}Remarks` as keyof typeof ev;
            if (ev[rKey]) setRatings((prev) => ({ ...prev, [key]: ev[rKey] }));
            if (ev[mKey]) setRemarks((prev) => ({ ...prev, [key]: ev[mKey] ?? "" }));
          });
          setOverallRating(ev.overallRating ?? "");
          setFurtherAction(ev.furtherAction ?? "");
          setSuggestedRole(ev.suggestedRole ?? "");
          setSuggestedProject(ev.suggestedProject ?? "");
          setSuggestedLead(ev.suggestedLead ?? "");
          setOthers(ev.others ?? "");
          setInterviewerName(ev.interviewerName ?? "");
          setInterviewerPlace(ev.interviewerPlace ?? "");
          setInterviewDate(ev.interviewDate ? ev.interviewDate.slice(0, 10) : "");
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        sessionId,
        overallRating: overallRating || null,
        furtherAction: furtherAction || null,
        suggestedRole: suggestedRole.trim() || null,
        suggestedProject: suggestedProject.trim() || null,
        suggestedLead: suggestedLead.trim() || null,
        others: others.trim() || null,
        interviewerName: interviewerName.trim() || null,
        interviewerPlace: interviewerPlace.trim() || null,
        interviewDate: interviewDate || null,
      };
      CATEGORIES.forEach(({ key }) => {
        payload[`${key}Rating`] = ratings[key] || null;
        payload[`${key}Remarks`] = remarks[key].trim() || null;
      });

      const res = await fetch("/api/admin/technical/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");
      router.push("/admin/technical");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-8"><span className="text-white/70">Loading...</span></div>;
  if (error && !session) return <div className="min-h-screen p-8 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <Link href="/admin/technical" className="text-neonBlue hover:text-neonBlue/80 mb-6 inline-block transition-colors">
        ← Back to Technical Interview
      </Link>
      <h1 className="font-display font-bold text-2xl tracking-head mb-6">Technical Interview Evaluation</h1>

      {session && (
        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-white/50">Candidate:</span> <span className="text-white/90">{session.studentName || "—"}</span></div>
            <div><span className="text-white/50">College:</span> <span className="text-white/90">{session.college || "—"}</span></div>
            <div><span className="text-white/50">Role:</span> <span className="text-white/90">{session.roles?.join(", ") || "—"}</span></div>
            <div><span className="text-white/50">Exam Score:</span> <span className="text-neonBlue">{session.totalScore ?? "—"}</span></div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-6 mb-8">
        {CATEGORIES.map(({ key, label }) => (
          <GlassCard key={key} className="p-4">
            <h3 className="font-medium text-white/90 mb-3">{label}</h3>
            <div className="flex flex-wrap gap-4 mb-3">
              {RATING_OPTIONS.map(({ value, label: l }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                  <input
                    type="radio"
                    name={key}
                    value={value}
                    checked={ratings[key] === value}
                    onChange={() => setRatings((prev) => ({ ...prev, [key]: value }))}
                    className="accent-neonBlue"
                  />
                  {l}
                </label>
              ))}
            </div>
            <GlowTextarea
              placeholder="Remarks"
              value={remarks[key]}
              onChange={(e) => setRemarks((prev) => ({ ...prev, [key]: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 mb-6">
        <h3 className="font-medium text-white/90 mb-3">Overall Rating</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {OVERALL_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
              <input
                type="radio"
                name="overall"
                value={opt}
                checked={overallRating === opt}
                onChange={() => setOverallRating(opt)}
                className="accent-neonBlue"
              />
              {opt}
            </label>
          ))}
        </div>

        <h3 className="font-medium text-white/90 mb-3">Further Action</h3>
        <div className="flex flex-wrap gap-4 mb-6">
          {FURTHER_ACTION_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
              <input
                type="radio"
                name="further"
                value={opt}
                checked={furtherAction === opt}
                onChange={() => setFurtherAction(opt)}
                className="accent-neonBlue"
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Suggested Role</label>
            <GlowInput value={suggestedRole} onChange={(e) => setSuggestedRole(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Suggested Project</label>
            <GlowInput value={suggestedProject} onChange={(e) => setSuggestedProject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Suggested Team Lead</label>
            <GlowInput value={suggestedLead} onChange={(e) => setSuggestedLead(e.target.value)} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-1">Others</label>
          <GlowTextarea value={others} onChange={(e) => setOthers(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Interviewer Name</label>
            <GlowInput value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Place</label>
            <GlowInput value={interviewerPlace} onChange={(e) => setInterviewerPlace(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Date</label>
            <GlowInput type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
          </div>
        </div>
      </GlassCard>

      <NeonButton onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving..." : "Save Evaluation"}
      </NeonButton>
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
