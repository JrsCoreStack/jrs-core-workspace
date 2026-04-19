import { SkeletonTopbar, RfSk } from "@/components/ui/rf-skeleton"

export default function CalendarioLoading() {
  return (
    <div style={{ padding: "20px", maxWidth: 1400, margin: "0 auto" }}>
      <SkeletonTopbar />

      {/* grade mensal skeleton */}
      <div style={{
        background: "var(--rf-bg-surface)",
        border: "1px solid var(--rf-border-default)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {/* cabeçalho dias da semana */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7,1fr)",
          borderBottom: "1px solid var(--rf-border-subtle)",
          padding: "8px 0",
        }}>
          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
            <div key={d} style={{
              textAlign: "center", fontSize: 11,
              color: "var(--rf-text-muted)",
              fontFamily: "monospace", textTransform: "uppercase",
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* células do mês */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} style={{
            display: "grid", gridTemplateColumns: "repeat(7,1fr)",
            borderBottom: row < 4 ? "1px solid var(--rf-border-subtle)" : undefined,
          }}>
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} style={{
                padding: 8, minHeight: 80,
                borderRight: col < 6 ? "1px solid var(--rf-border-subtle)" : undefined,
              }}>
                <RfSk style={{ height: 14, width: 20, marginBottom: 6 }} />
                {col % 3 === 0 && <RfSk style={{ height: 20, borderRadius: 6, marginBottom: 4 }} />}
                {col % 2 === 1 && row % 2 === 0 && <RfSk style={{ height: 20, borderRadius: 6 }} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
