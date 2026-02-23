"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlowSelect from "@/components/ui/GlowSelect";
import GlassTable, { GlassTableHead, GlassTableBody, GlassTableRow } from "@/components/ui/GlassTable";

interface Submission {
  id: string;
  studentEmail: string;
  totalTabSwitches?: number;
  totalTimeAway?: number;
}

interface LogEntry {
  id: string;
  eventType: string;
  timestamp: string;
  durationAway?: number | null;
}

interface SessionStats {
  totalTabSwitches: number;
  totalTimeAway: number;
  fullscreenExits: number;
  inactivityEvents: number;
}

function formatTimeAway(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function LogsTable({ submissions }: { submissions: unknown[] }) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    if (selectedSession) {
      fetch(`/api/admin/get-logs?sessionId=${selectedSession}`)
        .then((r) => r.json())
        .then((data) => {
          setLogs(data.logs ?? []);
          setStats(data.session ?? null);
        })
        .catch(() => {
          setLogs([]);
          setStats(null);
        });
    } else {
      setLogs([]);
      setStats(null);
    }
  }, [selectedSession]);

  const items = submissions as Submission[];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-white/80 mb-1">Select submission to view logs</label>
        <GlowSelect
          value={selectedSession ?? ""}
          onChange={(e) => setSelectedSession(e.target.value || null)}
        >
          <option value="">— Select —</option>
          {items.map((s) => (
            <option key={s.id} value={s.id}>
              {s.studentEmail} ({s.id.slice(0, 8)})
            </option>
          ))}
        </GlowSelect>
      </div>
      {selectedSession && stats && (
        <GlassCard className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><span className="text-white/50">Tab Switches:</span> <span className="text-neonBlue">{stats.totalTabSwitches}</span></div>
            <div><span className="text-white/50">Time Away:</span> <span className="text-neonBlue">{formatTimeAway(stats.totalTimeAway)}</span></div>
            <div><span className="text-white/50">Fullscreen Exits:</span> <span className="text-neonPink">{stats.fullscreenExits}</span></div>
            <div><span className="text-white/50">Inactivity:</span> <span className="text-neonPink">{stats.inactivityEvents}</span></div>
          </div>
        </GlassCard>
      )}
      {selectedSession && (
        <GlassCard className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-neonBlue" />
            Timeline
          </h3>
          <GlassTable>
            <GlassTableHead>
              <tr>
                <th className="text-left py-2 px-4 text-white/80">Event Type</th>
                <th className="text-left py-2 px-4 text-white/80">Timestamp</th>
                <th className="text-left py-2 px-4 text-white/80">Duration</th>
              </tr>
            </GlassTableHead>
            <GlassTableBody>
              {logs.map((l) => (
                <GlassTableRow key={l.id}>
                  <td className="py-2 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-neonBlue/20 text-neonBlue text-xs font-medium">
                      {l.eventType}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-white/80">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 text-white/80">
                    {l.durationAway != null
                      ? l.durationAway >= 1000
                        ? `${(l.durationAway / 1000).toFixed(1)}s`
                        : `${l.durationAway}ms`
                      : "—"}
                  </td>
                </GlassTableRow>
              ))}
            </GlassTableBody>
          </GlassTable>
          {logs.length === 0 && <p className="text-white/50 py-4 text-center">No logs.</p>}
        </GlassCard>
      )}
    </div>
  );
}
