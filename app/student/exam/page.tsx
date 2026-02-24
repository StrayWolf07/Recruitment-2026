"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import GlowTextarea from "@/components/ui/GlowTextarea";
import NeonButton from "@/components/ui/NeonButton";
import Timer from "@/components/ui/Timer";
import { initTabTracker, requestExamFullscreen, type LogEventType } from "@/lib/tabTracker";

interface Question {
  id: string;
  section: string;
  questionType: string;
  questionText: string;
  orderIndex: number;
}

interface SessionData {
  sessionId: string;
  phase: string;
  startTime: string;
  endTime: string;
  questions: Question[];
  answers: Record<string, { answerText?: string; firstOpened?: string; firstTyped?: string; lastModified?: string; totalTimeSpent: number }>;
}

const ALLOWED_EXT = ["zip", "stl", "glb", "obj", "pdf"];
const MAX_SIZE_DEV = 10 * 1024 * 1024 * 1024; // 10GB for local dev

function PracticalUploadPanel({
  sessionId,
  questionId,
  files,
  onUpload,
  onDelete,
  disabled,
}: {
  sessionId: string;
  questionId: string;
  files: { id: number; filename: string; sizeBytes: number; uploadedAt: string }[];
  onUpload: () => void;
  onDelete: (fileId: number) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      alert("Allowed: zip, stl, glb, obj, pdf");
      e.target.value = "";
      return;
    }
    const maxSize = MAX_SIZE_DEV;
    if (file.size > maxSize) {
      alert(`Max ${Math.round(maxSize / 1024 / 1024)}MB per file`);
      e.target.value = "";
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      if (presignRes.ok) {
        const { url, key, maxSize: presignMax } = await presignRes.json();
        const maxBytes = typeof presignMax === "number" ? presignMax : maxSize;
        if (file.size > maxBytes) {
          setUploadError(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
          setUploading(false);
          setUploadProgress(null);
          e.target.value = "";
          return;
        }
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (ev) => {
            if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.open("PUT", url);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.send(file);
        });
        const registerRes = await fetch("/api/student/register-practical-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionId,
            key,
            filename: file.name,
            sizeBytes: file.size,
          }),
        });
        if (!registerRes.ok) {
          const err = await registerRes.json().catch(() => ({}));
          throw new Error(err.error ?? "Failed to register file");
        }
        onUpload();
      } else if (presignRes.status === 503) {
        const fd = new FormData();
        fd.set("sessionId", sessionId);
        fd.set("questionId", questionId);
        fd.set("file", file);
        const res = await fetch("/api/student/upload-practical-file", { method: "POST", body: fd });
        if (res.ok) onUpload();
        else {
          const err = await res.json().catch(() => ({}));
          setUploadError(err.error ?? "Upload failed");
        }
      } else {
        const err = await presignRes.json().catch(() => ({}));
        setUploadError(err.error ?? "Upload failed");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = "";
    }
  };
  return (
    <GlassCard className="mt-4 p-4">
      <p className="text-white/80 text-sm mb-2">Upload files (zip, stl, glb, obj, pdf). Max size may apply in production.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.stl,.glb,.obj,.pdf"
        onChange={handleSelect}
        className="hidden"
      />
      <NeonButton variant="secondary" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
        {uploading ? "Uploading…" : "Choose File"}
      </NeonButton>
      {uploadProgress != null && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-neonBlue transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
      {uploadError && <p className="mt-2 text-red-400 text-sm">{uploadError}</p>}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 text-sm text-white/80">
              <span>{f.filename} ({(f.sizeBytes / 1024).toFixed(1)} KB)</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onDelete(f.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

export default function StudentExamPage() {
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [practicalFiles, setPracticalFiles] = useState<Record<string, { id: number; filename: string; sizeBytes: number; uploadedAt: string }[]>>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const terminatedRef = useRef(false);

  const theoryQuestions = (data?.questions ?? []).filter((q) => q.section === "theory");
  const practicalQuestions = (data?.questions ?? []).filter((q) => q.section === "practical");
  const currentSection = data?.phase ?? "theory";
  const isTheory = currentSection === "theory";
  const displayedQuestions = isTheory ? theoryQuestions : practicalQuestions;
  const totalQuestions = theoryQuestions.length + practicalQuestions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  const currentQuestionIdRef = useRef<string | null>(null);

  const sendQuestionActivity = useCallback((questionId: string, action: "open" | "close") => {
    if (!data?.sessionId) return;
    fetch("/api/student/question-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: data.sessionId,
        questionId,
        action,
        clientTs: Date.now(),
      }),
    }).catch(() => {});
  }, [data?.sessionId]);

  const logEvent = useCallback(async (eventType: LogEventType, durationAwayMs?: number, questionId?: string) => {
    if (terminatedRef.current) return;
    try {
      await fetch("/api/student/log-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          timestamp: new Date().toISOString(),
          duration_away: durationAwayMs,
          question_id: questionId ?? currentQuestionIdRef.current,
        }),
      });
    } catch {
      // ignore
    }
  }, []);

  const saveAnswer = useCallback(
    (
      examQuestionId: string,
      answerText: string,
      opts?: { firstOpened?: string; firstTyped?: string; lastModified?: string }
    ) => {
      fetch("/api/student/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examQuestionId,
          answerText,
          firstOpened: opts?.firstOpened,
          firstTyped: opts?.firstTyped,
          lastModified: opts?.lastModified ?? new Date().toISOString(),
        }),
      });
    },
    []
  );

  useEffect(() => {
    fetch("/api/student/session")
      .then((r) => {
        if (r.status === 404) {
          router.push("/student/profile");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          const init: Record<string, string> = {};
          for (const [k, v] of Object.entries(d.answers ?? {})) {
            const a = v as { answerText?: string };
            if (a?.answerText) init[k] = a.answerText;
          }
          setAnswers(init);
        }
      })
      .catch(() => router.push("/student/login"));
  }, [router]);

  useEffect(() => {
    if (!data) return;
    requestExamFullscreen();
  }, [data]);

  const forceSubmit = useCallback(
    async (opts?: { theoryTabViolation?: boolean; terminationReason?: string }) => {
      if (submittingRef.current || !data?.sessionId) return;
      submittingRef.current = true;
      terminatedRef.current = true;
      setTerminated(true);

      const now = new Date().toISOString();
      await Promise.all(
        Object.entries(answers).map(([qid, val]) =>
          fetch("/api/student/save-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examQuestionId: qid,
              answerText: val,
              firstOpened: data?.answers?.[qid]?.firstOpened,
              firstTyped: data?.answers?.[qid]?.firstTyped ?? (val ? now : undefined),
              lastModified: now,
            }),
          })
        )
      );

      const res = await fetch("/api/student/submit-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts ?? {}),
      });
      if (res.ok) {
        router.push("/student/submitted");
        router.refresh();
      }
    },
    [data, answers, router]
  );

  const handleTheoryViolation = useCallback(() => {
    if (terminatedRef.current || submittingRef.current) return;
    forceSubmit({
      theoryTabViolation: true,
      terminationReason: "Tab switched during theory section",
    });
  }, [forceSubmit]);

  useEffect(() => {
    terminatedRef.current = terminated;
  }, [terminated]);

  useEffect(() => {
    if (!data) return;
    const cleanup = initTabTracker({
      onEvent: logEvent,
      onFullscreenExitWarning: () => setFullscreenWarning(true),
      getCurrentQuestionId: () => currentQuestionIdRef.current,
      getCurrentSection: () => (data?.phase === "practical" ? "practical" : "theory"),
      onTheoryViolation: handleTheoryViolation,
    });
    return cleanup;
  }, [data, logEvent, handleTheoryViolation]);

  useEffect(() => {
    if (!data?.sessionId || !data?.questions?.length) return;
    const firstId = data.questions.filter((q) => q.section === data.phase)[0]?.id;
    if (!firstId) return;
    sendQuestionActivity(firstId, "open");
    currentQuestionIdRef.current = firstId;
    return () => {
      sendQuestionActivity(firstId, "close");
      currentQuestionIdRef.current = null;
    };
  }, [data?.sessionId, data?.phase, data?.questions, sendQuestionActivity]);

  useEffect(() => {
    if (!data?.sessionId || data?.phase !== "practical") return;
    const pq = (data?.questions ?? []).filter((q) => q.section === "practical");
    if (pq.length === 0) return;
    void Promise.all(
      pq.map((q) =>
        fetch(`/api/student/practical-files?sessionId=${data.sessionId}&questionId=${q.id}`)
          .then((r) => r.json())
          .then((d: { files?: { id: number; filename: string; sizeBytes: number; uploadedAt: string }[] }) =>
            d.files ?? []
          )
      )
    ).then((results) => {
      const map: Record<string, { id: number; filename: string; sizeBytes: number; uploadedAt: string }[]> = {};
      pq.forEach((q, i) => {
        map[q.id] = results[i] ?? [];
      });
      setPracticalFiles(map);
    });
  }, [data?.sessionId, data?.phase, data?.questions]);

  useEffect(() => {
    if (!data || terminated) return;
    const end = new Date(data.endTime).getTime();
    const check = () => {
      if (Date.now() >= end && !submittingRef.current && !terminatedRef.current) {
        void forceSubmit();
      }
    };
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [data, router, terminated, forceSubmit]);

  const firstOpenedRef = useRef<Record<string, boolean>>({});

  const handleAnswerChange = (examQuestionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [examQuestionId]: value }));
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const existing = data?.answers?.[examQuestionId];
      saveAnswer(examQuestionId, value, {
        firstOpened: existing?.firstOpened,
        firstTyped: existing?.firstTyped,
      });
    }, 500);
  };

  const handleQuestionFocus = (examQuestionId: string) => {
    const prev = currentQuestionIdRef.current;
    if (prev && prev !== examQuestionId) {
      sendQuestionActivity(prev, "close");
    }
    sendQuestionActivity(examQuestionId, "open");
    currentQuestionIdRef.current = examQuestionId;
    if (!firstOpenedRef.current[examQuestionId]) {
      firstOpenedRef.current[examQuestionId] = true;
      saveAnswer(examQuestionId, answers[examQuestionId] ?? "", {
        firstOpened: new Date().toISOString(),
      });
    }
  };

  const handleQuestionBlur = (examQuestionId: string) => {
    sendQuestionActivity(examQuestionId, "close");
    currentQuestionIdRef.current = null;
    const val = answers[examQuestionId];
    const existing = data?.answers?.[examQuestionId];
    saveAnswer(examQuestionId, val ?? "", {
      firstOpened: existing?.firstOpened,
      firstTyped: existing?.firstTyped ?? (val ? new Date().toISOString() : undefined),
      lastModified: new Date().toISOString(),
    });
  };

  const goToPractical = async () => {
    if (currentQuestionIdRef.current) {
      sendQuestionActivity(currentQuestionIdRef.current, "close");
      currentQuestionIdRef.current = null;
    }
    const res = await fetch("/api/student/next-section", { method: "POST" });
    if (res.ok) {
      setData((p) => (p ? { ...p, phase: "practical" } : null));
    }
  };

  const submit = async () => {
    if (terminated || submittingRef.current) return;
    if (currentQuestionIdRef.current) {
      sendQuestionActivity(currentQuestionIdRef.current, "close");
      currentQuestionIdRef.current = null;
    }
    await forceSubmit();
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center p-8"><span className="text-white/70">Loading...</span></div>;

  const endTime = new Date(data.endTime).getTime();
  const submitted = terminated;

  if (terminated) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <GlassCard className="p-8 border-red-500/50 bg-red-500/10 text-center">
          <h1 className="font-display font-bold text-xl text-red-200 mb-4">
            Test Terminated
          </h1>
          <p className="text-white/90 mb-2">
            Test terminated due to tab switching during theory section.
          </p>
          <p className="text-white/70 text-sm">
            Your submission has been recorded.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      {fullscreenWarning && (
        <GlassCard className="mb-4 p-4 border-amber-400/50 bg-amber-500/10">
          <p className="text-amber-200 text-sm">You exited fullscreen.</p>
        </GlassCard>
      )}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h1 className="font-display font-bold text-xl tracking-head">
              {isTheory ? "Theory" : "Practical"} Section
            </h1>
            <span className="text-white/60 text-sm">Progress: {answeredCount}/{totalQuestions}</span>
          </div>
          <div className="space-y-4 mb-6">
            {displayedQuestions.map((q) => (
              <GlassCard key={q.id} className="p-5">
                <div className="whitespace-pre-wrap break-words font-mono text-sm bg-black/30 p-4 rounded-xl border border-white/10 text-white/90 mb-4">
                  {q.questionText}
                </div>
                <GlowTextarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  onFocus={() => handleQuestionFocus(q.id)}
                  onBlur={() => handleQuestionBlur(q.id)}
                  disabled={submitted || terminated}
                  rows={4}
                />
                {q.section === "practical" && (
                  <PracticalUploadPanel
                    sessionId={data.sessionId}
                    questionId={q.id}
                    files={practicalFiles[q.id] ?? []}
                    onUpload={() => {
                      fetch(`/api/student/practical-files?sessionId=${data.sessionId}&questionId=${q.id}`)
                        .then((r) => r.json())
                        .then((d: { files?: { id: number; filename: string; sizeBytes: number; uploadedAt: string }[] }) =>
                          setPracticalFiles((prev) => ({ ...prev, [q.id]: d.files ?? [] }))
                        );
                    }}
                    onDelete={(fileId) => {
                      fetch("/api/student/practical-files", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileId }),
                      }).then(() => {
                        setPracticalFiles((prev) => ({
                          ...prev,
                          [q.id]: (prev[q.id] ?? []).filter((f) => f.id !== fileId),
                        }));
                      });
                    }}
                    disabled={submitted || terminated}
                  />
                )}
              </GlassCard>
            ))}
          </div>
          <div className="flex gap-4">
            {isTheory && practicalQuestions.length > 0 && (
              <NeonButton onClick={goToPractical} variant="secondary">
                Next: Practical
              </NeonButton>
            )}
            {(currentSection === "practical" || practicalQuestions.length === 0) && (
              <NeonButton onClick={submit}>
                Submit Exam
              </NeonButton>
            )}
          </div>
        </div>
        <div className="lg:w-72 shrink-0">
          <GlassCard className="p-5 sticky top-4">
            <p className="text-white/60 text-sm mb-2">Timer</p>
            <Timer endTime={endTime} />
            <p className="mt-4 text-white/60 text-sm">Progress</p>
            <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-neonBlue rounded-full transition-all duration-500"
                style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
