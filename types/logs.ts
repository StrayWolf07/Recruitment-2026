export interface LogEntry {
  id: string;
  sessionId: string;
  eventType: "blur" | "focus";
  timestamp: string;
  duration?: number | null;
}
