"use client"

import { cn } from "@/lib/utils"

/** Bloco base de skeleton com shimmer RF */
export function RfSk({
  className,
  style,
  circle = false,
}: {
  className?: string
  style?: React.CSSProperties
  circle?: boolean
}) {
  return (
    <div
      className={cn("rf-sk", className)}
      style={{
        borderRadius: circle ? "50%" : undefined,
        ...style,
      }}
    />
  )
}

/** Grade 2x2 de cards KPI — usado no Cockpit */
export function SkeletonKpiGrid({ cols = 2 }: { cols?: 2 | 4 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
    }}>
      {Array.from({ length: cols === 4 ? 4 : 4 }).map((_, i) => (
        <div key={i} style={{
          background: "var(--rf-bg-surface)",
          border: "1px solid var(--rf-border-default)",
          borderRadius: 14, padding: 16,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <RfSk style={{ height: 12, width: "60%" }} />
          <RfSk style={{ height: 26, width: "75%" }} />
          <RfSk style={{ height: 20, width: "40%", borderRadius: 9999 }} />
          <RfSk style={{ height: 12, width: "80%" }} />
          <RfSk style={{ height: 4, borderRadius: 9999 }} />
        </div>
      ))}
    </div>
  )
}

/** Lista de rituais/itens com avatar, título e badge */
export function SkeletonRitualList({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          background: "var(--rf-bg-surface)",
          border: "1px solid var(--rf-border-default)",
          borderRadius: 12, padding: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <RfSk circle style={{ width: 40, height: 40, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <RfSk style={{ height: 14, width: `${50 + i * 10}%` }} />
            <RfSk style={{ height: 11, width: `${30 + i * 5}%` }} />
          </div>
          <RfSk style={{ width: 80, height: 28, borderRadius: 9999, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

/** Skeleton do topbar de página */
export function SkeletonTopbar() {
  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid var(--rf-border-subtle)",
      borderRadius: 14, padding: 16, marginBottom: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <RfSk style={{ height: 22, width: 220 }} />
          <RfSk style={{ height: 12, width: 160 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <RfSk style={{ width: 80, height: 32, borderRadius: 8 }} />
          <RfSk style={{ width: 110, height: 32, borderRadius: 8 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {[90, 90, 90].map((w, i) => (
          <RfSk key={i} style={{ width: w, height: 28, borderRadius: 9999 }} />
        ))}
      </div>
    </div>
  )
}

/** Skeleton completo do Cockpit */
export function SkeletonCockpit() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      <SkeletonTopbar />
      <SkeletonKpiGrid cols={2} />
    </div>
  )
}

/** Skeleton da página de KPIs */
export function SkeletonKpisPage() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      <SkeletonTopbar />
      <SkeletonKpiGrid cols={4} />
      <div style={{ marginTop: 16 }}>
        <SkeletonRitualList rows={4} />
      </div>
    </div>
  )
}

/** Skeleton da página de Rituais */
export function SkeletonRituaisPage() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      <SkeletonTopbar />
      <SkeletonRitualList rows={5} />
    </div>
  )
}

/** Skeleton de card de perfil do usuário */
export function SkeletonProfile() {
  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid var(--rf-border-default)",
      borderRadius: 20, padding: 24,
    }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <RfSk circle style={{ width: 72, height: 72, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <RfSk style={{ height: 20, width: 160 }} />
          <RfSk style={{ height: 12, width: 120 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[60, 80, 70].map((w, i) => (
              <RfSk key={i} style={{ width: w, height: 22, borderRadius: 9999 }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[0, 1, 2].map(i => (
          <RfSk key={i} style={{ height: 60 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <RfSk key={i} style={{ height: 48 }} />
        ))}
      </div>
    </div>
  )
}

/** Skeleton genérico de card Kanban */
export function SkeletonKanbanBoard({ cols = 3 }: { cols?: number }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
      {Array.from({ length: cols }).map((_, c) => (
        <div key={c} style={{
          minWidth: 260, flex: "0 0 260px",
          background: "var(--rf-bg-surface)",
          border: "1px solid var(--rf-border-default)",
          borderRadius: 14, padding: 14,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <RfSk circle style={{ width: 8, height: 8 }} />
            <RfSk style={{ height: 14, flex: 1 }} />
            <RfSk style={{ width: 24, height: 24, borderRadius: 6 }} />
          </div>
          {Array.from({ length: 2 + c }).map((_, r) => (
            <div key={r} style={{
              background: "var(--rf-bg-elevated)",
              borderRadius: 10, padding: 12,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <RfSk style={{ height: 12, width: "80%" }} />
              <RfSk style={{ height: 10, width: "55%" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <RfSk circle style={{ width: 24, height: 24 }} />
                <RfSk style={{ height: 4, width: "50%", alignSelf: "center", borderRadius: 9999 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
