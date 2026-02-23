"use client";

export type SortColumn =
  | "name"
  | "college"
  | "degree"
  | "branch"
  | "cgpa"
  | "roles"
  | "tabSwitches"
  | "theoryViolation"
  | "terminationReason"
  | "terminatedEarly"
  | "status"
  | "score"
  | "submittedAt";

export type SortDirection = "asc" | "desc";

const SORT_OPTIONS: { value: SortColumn; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "college", label: "College" },
  { value: "degree", label: "Degree" },
  { value: "branch", label: "Branch" },
  { value: "cgpa", label: "CGPA" },
  { value: "roles", label: "Roles" },
  { value: "tabSwitches", label: "Tab Switches" },
  { value: "theoryViolation", label: "Theory Violation" },
  { value: "terminationReason", label: "Termination Reason" },
  { value: "terminatedEarly", label: "Terminated Early" },
  { value: "status", label: "Status" },
  { value: "score", label: "Score" },
  { value: "submittedAt", label: "Submitted At" },
];

export default function FilterPanel({
  sortColumn,
  sortDirection,
  onSortColumnChange,
  onSortDirectionChange,
}: {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSortColumnChange: (col: SortColumn) => void;
  onSortDirectionChange: (dir: SortDirection) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">Sort by:</span>
        <select
          value={sortColumn}
          onChange={(e) => onSortColumnChange(e.target.value as SortColumn)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neonBlue/60 [&>option]:bg-deepBg"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">Direction:</span>
        <select
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neonBlue/60 [&>option]:bg-deepBg"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}

export function sortSubmissions<T extends Record<string, unknown>>(
  items: T[],
  column: SortColumn,
  direction: SortDirection
): T[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    let aVal: unknown = a.studentName ?? "";
    let bVal: unknown = b.studentName ?? "";
    switch (column) {
      case "name":
        aVal = (a.studentName ?? "").toString().toLowerCase();
        bVal = (b.studentName ?? "").toString().toLowerCase();
        break;
      case "college":
        aVal = (a.college ?? "").toString().toLowerCase();
        bVal = (b.college ?? "").toString().toLowerCase();
        break;
      case "degree":
        aVal = (a.degree ?? "").toString().toLowerCase();
        bVal = (b.degree ?? "").toString().toLowerCase();
        break;
      case "branch":
        aVal = (a.branch ?? "").toString().toLowerCase();
        bVal = (b.branch ?? "").toString().toLowerCase();
        break;
      case "cgpa":
        aVal = a.cgpa ?? -1;
        bVal = b.cgpa ?? -1;
        break;
      case "roles":
        aVal = Array.isArray(a.roles) ? (a.roles as string[]).join(",") : "";
        bVal = Array.isArray(b.roles) ? (b.roles as string[]).join(",") : "";
        break;
      case "tabSwitches":
        aVal = a.totalTabSwitches ?? 0;
        bVal = b.totalTabSwitches ?? 0;
        break;
      case "theoryViolation":
        aVal = a.theoryTabViolation ? 1 : 0;
        bVal = b.theoryTabViolation ? 1 : 0;
        break;
      case "terminationReason":
        aVal = (a.terminationReason ?? "").toString().toLowerCase();
        bVal = (b.terminationReason ?? "").toString().toLowerCase();
        break;
      case "terminatedEarly":
        aVal = a.terminatedEarly ? 1 : 0;
        bVal = b.terminatedEarly ? 1 : 0;
        break;
      case "status":
        aVal = (a.evaluationStatus ?? "").toString().toLowerCase();
        bVal = (b.evaluationStatus ?? "").toString().toLowerCase();
        break;
      case "score":
        aVal = a.totalScore ?? -1;
        bVal = b.totalScore ?? -1;
        break;
      case "submittedAt":
        aVal = (a.submittedAt ?? "").toString();
        bVal = (b.submittedAt ?? "").toString();
        break;
      default:
        break;
    }
    if (typeof aVal === "string" && typeof bVal === "string") {
      return dir * aVal.localeCompare(bVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return dir * (aVal - bVal);
    }
    return dir * String(aVal).localeCompare(String(bVal));
  });
}
