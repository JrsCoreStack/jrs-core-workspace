import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
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
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: "var(--rf-bg-elevated)",
          color: "var(--rf-text-muted)",
          display: "grid", placeItems: "center", marginBottom: 4,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="11" y1="16" x2="11.01" y2="16" />
          </svg>
        </div>

        <div style={{
          fontFamily: "var(--rf-font-display,'Syne',sans-serif)",
          fontSize: 20, fontWeight: 700,
          color: "var(--rf-text-primary)",
        }}>
          Página não encontrada
        </div>

        <div style={{ fontSize: 13, color: "var(--rf-text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
          A tela que você tentou acessar não existe ou foi movida.
        </div>

        <div style={{
          fontFamily: "monospace", fontSize: 11,
          color: "var(--rf-text-muted)",
          background: "var(--rf-bg-elevated)",
          padding: "4px 10px", borderRadius: 6,
          border: "1px solid var(--rf-border-subtle)",
        }}>
          404 · Not Found
        </div>

        <Button asChild style={{ marginTop: 4 }}>
          <Link href="/cockpit">Voltar ao Cockpit</Link>
        </Button>
      </div>
    </div>
  )
}
