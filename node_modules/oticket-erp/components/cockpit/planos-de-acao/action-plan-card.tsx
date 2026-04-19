"use client"

import { areaLabel } from "@/lib/cockpit/constants"

export type ActionPlan = {
  id: string
  title: string
  area: string
  ritualId: string | null
  meetingId: string | null
  ownerName: string
  dueDate: string
  createdAt?: string
  priority: "high" | "medium" | "low"
  status: "planned" | "in_progress" | "blocked" | "delivered" | "archived"
  blockedNote?: string
  notes?: string | null
  history?: Array<{ action: string; at: string; by: string }>
  dependsOnPlanId?: string | null
  comments?: Array<{ id: string; text: string; at: string; by: string; parent_id?: string | null }>
  progress?: number
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

/* Area badge color map → hex pairs [bg, text] */
const AREA_BADGE: Record<string, [string, string]> = {
  COMMERCIAL:  ["rgba(123,97,255,0.12)", "#7b61ff"],
  MARKETING:   ["rgba(236,72,153,0.10)", "#ec4899"],
  FINANCIAL:   ["rgba(249,115,22,0.10)", "#f97316"],
  TECHNOLOGY:  ["rgba(0,212,255,0.08)",  "#00d4ff"],
  OPERATIONAL: ["rgba(0,212,255,0.08)",  "#00d4ff"],
  STRATEGIC:   ["rgba(34,197,94,0.10)",  "#22c55e"],
  PLAY:        ["rgba(245,158,11,0.10)", "#f59e0b"],
}

function areaBadgeStyle(area: string): { background: string; color: string } {
  const colors = AREA_BADGE[area.toUpperCase()] ?? ["rgba(123,97,255,0.12)", "#7b61ff"]
  return { background: colors[0], color: colors[1] }
}

function statusBorderColor(status: ActionPlan["status"]): string {
  if (status === "planned")    return "#6366f1"
  if (status === "in_progress") return "#f59e0b"
  if (status === "blocked")    return "#ef4444"
  if (status === "delivered")  return "#22c55e"
  return "var(--rf-text-muted, #3d4455)"
}

function priorityBadgeStyle(priority: ActionPlan["priority"]): { background: string; color: string; label: string; arrow: string } {
  if (priority === "high")   return { background: "rgba(239,68,68,0.10)", color: "#ef4444", label: "Alta",  arrow: "⬆" }
  if (priority === "medium") return { background: "rgba(245,158,11,0.10)", color: "#f59e0b", label: "Média", arrow: "→" }
  return                            { background: "rgba(34,197,94,0.10)", color: "#22c55e", label: "Baixa", arrow: "⬇" }
}

/* Deterministic avatar gradient from owner name */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#7b61ff,#00d4ff)",
  "linear-gradient(135deg,#22c55e,#16a34a)",
  "linear-gradient(135deg,#f97316,#dc2626)",
  "linear-gradient(135deg,#ec4899,#9333ea)",
  "linear-gradient(135deg,#f59e0b,#ea580c)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
]
function avatarGradient(name: string) {
  const hash = name.trim().toLowerCase().split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export function ActionPlanCard({
  plan,
  onOpenDetails,
}: {
  plan: ActionPlan
  onOpenDetails?: (planId: string) => void
}) {
  const todayIso = new Date().toISOString().slice(0, 10)
  const overdue = plan.status !== "delivered" && plan.status !== "archived" && plan.dueDate < todayIso
  const blocked = plan.status === "blocked"
  const delivered = plan.status === "delivered"
  const borderColor = statusBorderColor(plan.status)
  const areaBadge = areaBadgeStyle(plan.area)
  const priStyle = priorityBadgeStyle(plan.priority)
  const areaName = areaLabel(plan.area)

  return (
    <>
      <style>{`
        .apc-card {
          background: var(--rf-bg-surface);
          border: 1px solid var(--rf-border-default);
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .apc-card:hover {
          border-color: var(--rf-border-strong);
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          transform: translateY(-1px);
        }
        .apc-card:active {
          transform: scale(0.98) translateY(0);
        }
        .apc-left-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 0;
        }
        .apc-blocked-banner {
          background: rgba(239,68,68,0.10);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 600;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
        }
        .apc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 6px;
          gap: 6px;
        }
        .apc-badges { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
        .apc-badge {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .apc-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--rf-text-primary);
          line-height: 1.35;
          margin-bottom: 8px;
        }
        .apc-title.done { text-decoration: line-through; color: var(--rf-text-muted); }
        .apc-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }
        .apc-meta-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--rf-text-secondary);
        }
        .apc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--rf-border-subtle);
        }
        .apc-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 8px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .apc-progress-wrap { flex: 1; margin: 0 8px; }
        .apc-progress-bar {
          height: 3px;
          border-radius: 9999px;
          background: var(--rf-border-subtle);
          overflow: hidden;
        }
        .apc-progress-fill {
          height: 100%;
          border-radius: 9999px;
        }
        .apc-progress-pct {
          font-size: 10px;
          color: var(--rf-text-muted);
          text-align: right;
          margin-top: 2px;
        }
        .apc-done-check {
          color: #22c55e;
          flex-shrink: 0;
        }
      `}</style>

      <div
        className="apc-card"
        style={{ paddingLeft: 15 }}
        role={onOpenDetails ? "button" : undefined}
        tabIndex={onOpenDetails ? 0 : undefined}
        onClick={() => onOpenDetails?.(plan.id)}
        onKeyDown={(e) => {
          if (!onOpenDetails) return
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenDetails(plan.id) }
        }}
      >
        {/* Left color bar */}
        <div className="apc-left-bar" style={{ background: borderColor }} />

        {/* Blocked banner */}
        {blocked && (
          <div className="apc-blocked-banner">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {plan.blockedNote?.trim() || "Bloqueado"}
          </div>
        )}

        {/* Header: badges + menu icon */}
        <div className="apc-header">
          <div className="apc-badges">
            <span className="apc-badge" style={areaBadge}>{areaName}</span>
            <span className="apc-badge" style={{ background: priStyle.background, color: priStyle.color }}>
              {priStyle.arrow} {priStyle.label}
            </span>
          </div>
          {delivered && (
            <svg className="apc-done-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Title */}
        <div className={`apc-title${delivered ? " done" : ""}`}>{plan.title}</div>

        {/* Meta */}
        {(plan.dueDate || overdue) && (
          <div className="apc-meta">
            <div className="apc-meta-row" style={overdue ? { color: "#ef4444" } : delivered ? { color: "#22c55e" } : {}}>
              {overdue ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : delivered ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
              {overdue
                ? `Atrasado · ${formatDate(plan.dueDate)}`
                : delivered
                  ? `Entregue · ${formatDate(plan.dueDate)}`
                  : formatDate(plan.dueDate)}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="apc-footer">
          <div className="apc-avatar" style={{ background: avatarGradient(plan.ownerName) }}>
            {initials(plan.ownerName)}
          </div>
          {typeof plan.progress === "number" ? (
            <div className="apc-progress-wrap">
              <div className="apc-progress-bar">
                <div
                  className="apc-progress-fill"
                  style={{
                    width: `${plan.progress}%`,
                    background: overdue
                      ? "#ef4444"
                      : blocked
                        ? "#ef4444"
                        : delivered
                          ? "#22c55e"
                          : plan.status === "in_progress"
                            ? "#f59e0b"
                            : "#6366f1",
                  }}
                />
              </div>
              <div className="apc-progress-pct">{plan.progress}%</div>
            </div>
          ) : (
            <span style={{ fontSize: 10, color: "var(--rf-text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
              {plan.ownerName.split(" ")[0]}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
