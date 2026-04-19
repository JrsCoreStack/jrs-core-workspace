"use client"

import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--rf-bg-base)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "var(--rf-bg-surface)",
        border: "1px solid var(--rf-border-default)",
        borderRadius: 22, padding: "36px 24px",
        textAlign: "center",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
        maxWidth: 420, width: "100%",
      }}>
        {/* ícone */}
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: "var(--rf-danger-soft)",
          color: "var(--rf-danger)",
          display: "grid", placeItems: "center", marginBottom: 4,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div style={{
          fontFamily: "var(--rf-font-display,'Syne',sans-serif)",
          fontSize: 20, fontWeight: 700,
          color: "var(--rf-text-primary)",
        }}>
          Erro no servidor
        </div>

        <div style={{ fontSize: 13, color: "var(--rf-text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
          Algo deu errado do nosso lado. Nossa equipe já foi notificada.
        </div>

        {error.digest && (
          <div style={{
            fontFamily: "monospace", fontSize: 11,
            color: "var(--rf-text-muted)",
            background: "var(--rf-bg-elevated)",
            padding: "4px 10px", borderRadius: 6,
            border: "1px solid var(--rf-border-subtle)",
          }}>
            {error.digest}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              background: "var(--rf-accent)", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Tentar novamente
          </button>
          <a
            href="mailto:suporte@orbit.app"
            style={{
              padding: "8px 16px",
              background: "transparent", color: "var(--rf-text-secondary)",
              border: "1px solid var(--rf-border-default)", borderRadius: 10,
              fontSize: 12, cursor: "pointer", textDecoration: "none",
              display: "flex", alignItems: "center",
            }}
          >
            Suporte
          </a>
        </div>
      </div>
    </div>
  )
}
