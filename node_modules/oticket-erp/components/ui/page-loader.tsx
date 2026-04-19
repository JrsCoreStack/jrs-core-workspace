"use client"

interface PageLoaderProps {
  message?: string
  subMessage?: string
}

/**
 * Loading de página completa com ícone Orbit animado.
 * Use em suspense boundaries ou estados de carregamento inicial.
 */
export function PageLoader({
  message = "Carregando Orbit...",
  subMessage = "Sincronizando dados da equipe",
}: PageLoaderProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 20,
      minHeight: "100vh",
      background: "var(--rf-bg-base)",
    }}>
      {/* Orbit logo animado */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        {/* anel base */}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid var(--rf-border-subtle)",
        }} />
        {/* anel externo */}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "var(--rf-accent)",
          animation: "rf-spin 1s linear infinite",
        }} />
        {/* anel interno — contra-rotação */}
        <div style={{
          position: "absolute", inset: 10,
          borderRadius: "50%",
          border: "1.5px solid transparent",
          borderTopColor: "var(--rf-cyan)",
          animation: "rf-spin-ccw 0.7s linear infinite",
        }} />
        {/* centro com logo */}
        <div style={{
          position: "absolute", inset: 20,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#1a1040,#7b61ff)",
          display: "grid", placeItems: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="16" cy="16" r="6"  stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
            <circle cx="16" cy="16" r="2.5" fill="white" />
          </svg>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{
          fontFamily: "var(--rf-font-display, 'Space Grotesk', sans-serif)",
          fontSize: 15, fontWeight: 700,
          color: "var(--rf-text-primary)",
        }}>
          {message}
        </div>
        <div style={{ fontSize: 12, color: "var(--rf-text-muted)" }}>
          {subMessage}
        </div>
      </div>

      {/* barra de progresso infinita */}
      <div style={{
        width: 200, height: 3,
        background: "var(--rf-border-subtle)",
        borderRadius: 9999, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(90deg, var(--rf-accent), var(--rf-cyan))",
          borderRadius: 9999,
          animation: "rf-bar-load 2s ease-in-out infinite",
        }} />
      </div>
    </div>
  )
}

/** Versão compacta para usar dentro de cards/seções */
export function SectionLoader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 14, padding: "40px 24px",
    }}>
      <div style={{ position: "relative", width: 40, height: 40 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid var(--rf-border-subtle)",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "var(--rf-accent)",
          animation: "rf-spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          border: "1.5px solid transparent",
          borderTopColor: "var(--rf-cyan)",
          animation: "rf-spin-ccw 0.7s linear infinite",
        }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--rf-text-muted)" }}>{message}</span>
    </div>
  )
}
