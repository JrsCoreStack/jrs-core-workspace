"use client"

import Link from "next/link"

/* ────────────────────────────────────────────────────────────── */
/*  Full-page error cards (404, 500, offline)                    */
/* ────────────────────────────────────────────────────────────── */

type ErrorVariant = "not-found" | "server-error" | "offline"

interface ErrorStateProps {
  variant: ErrorVariant
  onRetry?: () => void
}

const CONTENT: Record<ErrorVariant, {
  icon: React.ReactNode
  iconBg: string
  title: string
  desc: string
  code: string
  primaryLabel: string
  secondaryLabel?: string
}> = {
  "not-found": {
    icon: <IconSearch />,
    iconBg: "var(--rf-bg-elevated)",
    title: "Página não encontrada",
    desc: "A tela que você tentou acessar não existe ou foi movida.",
    code: "404 · Not Found",
    primaryLabel: "Voltar ao Cockpit",
  },
  "server-error": {
    icon: <IconWarning />,
    iconBg: "var(--rf-danger-soft)",
    title: "Erro no servidor",
    desc: "Algo deu errado do nosso lado. Nossa equipe já foi notificada.",
    code: "500 · Internal Server Error",
    primaryLabel: "Tentar novamente",
    secondaryLabel: "Suporte",
  },
  "offline": {
    icon: <IconOffline />,
    iconBg: "rgba(100,100,100,0.10)",
    title: "Sem conexão",
    desc: "Verifique sua internet e tente novamente. Os dados locais estão disponíveis.",
    code: "Offline mode",
    primaryLabel: "Reconectar",
  },
}

export function ErrorState({ variant, onRetry }: ErrorStateProps) {
  const c = CONTENT[variant]
  const isNotFound = variant === "not-found"

  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid var(--rf-border-default)",
      borderRadius: 22, padding: "36px 24px",
      textAlign: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12,
      maxWidth: 420, margin: "0 auto",
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: c.iconBg,
        color: variant === "server-error" ? "var(--rf-danger)" : "var(--rf-text-muted)",
        display: "grid", placeItems: "center", marginBottom: 4,
      }}>
        {c.icon}
      </div>

      <div style={{
        fontFamily: 'var(--rf-font-display, "Plus Jakarta Sans", system-ui, sans-serif)',
        fontSize: 18, fontWeight: 700,
        color: "var(--rf-text-primary)",
      }}>
        {c.title}
      </div>

      <div style={{ fontSize: 13, color: "var(--rf-text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
        {c.desc}
      </div>

      <div style={{
        fontFamily: "monospace", fontSize: 11,
        color: "var(--rf-text-muted)",
        background: "var(--rf-bg-elevated)",
        padding: "4px 10px", borderRadius: 6,
        border: "1px solid var(--rf-border-subtle)",
      }}>
        {c.code}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {isNotFound ? (
          <Link href="/cockpit" style={{
            padding: "10px 24px",
            background: "var(--rf-accent)", color: "#fff",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            textDecoration: "none",
          }}>
            {c.primaryLabel}
          </Link>
        ) : (
          <button
            onClick={onRetry}
            style={{
              padding: "10px 24px",
              background: "var(--rf-accent)", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {c.primaryLabel}
          </button>
        )}
        {c.secondaryLabel && (
          <button style={{
            padding: "8px 16px",
            background: "transparent", color: "var(--rf-text-secondary)",
            border: "1px solid var(--rf-border-default)", borderRadius: 10,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>
            {c.secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Inline error banner (falha ao carregar componente)           */
/* ────────────────────────────────────────────────────────────── */

interface InlineErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function InlineError({
  title = "Falha ao carregar",
  message = "Não foi possível buscar os dados. Verifique sua conexão ou tente novamente.",
  onRetry,
}: InlineErrorProps) {
  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 14, padding: 20,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "var(--rf-danger-soft)", color: "var(--rf-danger)",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--rf-text-secondary)" }}>{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "8px 16px", flexShrink: 0,
            background: "transparent", color: "var(--rf-text-secondary)",
            border: "1px solid var(--rf-border-default)", borderRadius: 10,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Recarregar
        </button>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Destructive confirmation dialog                              */
/* ────────────────────────────────────────────────────────────── */

interface DestructiveConfirmProps {
  title?: string
  subtitle?: string
  warning?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function DestructiveConfirm({
  title = "Excluir ritual?",
  subtitle = "Esta ação não pode ser desfeita.",
  warning = "Todos os históricos e registros vinculados serão perdidos permanentemente.",
  confirmLabel = "Sim, excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: DestructiveConfirmProps) {
  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 22, padding: 24,
      maxWidth: 400, margin: "0 auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--rf-danger-soft)", color: "var(--rf-danger)",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--rf-font-display, "Plus Jakarta Sans", system-ui, sans-serif)',
            fontSize: 15, fontWeight: 700, color: "var(--rf-text-primary)",
          }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--rf-text-secondary)", marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {warning && (
        <div style={{
          background: "var(--rf-danger-soft)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 10, padding: "10px 14px",
          marginBottom: 16, fontSize: 12, color: "var(--rf-danger)",
        }}>
          {warning}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: 9,
            background: "transparent", color: "var(--rf-text-secondary)",
            border: "1px solid var(--rf-border-default)", borderRadius: 10,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: 9,
            background: "var(--rf-danger)", color: "#fff",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}

/* ── SVG icons ── */
function IconSearch() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="11" y1="16" x2="11.01" y2="16" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconOffline() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}
