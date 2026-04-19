"use client"

type FeedbackVariant = "saving" | "saved" | "error"

interface InlineFeedbackProps {
  variant: FeedbackVariant
  message?: string
}

const DEFAULTS: Record<FeedbackVariant, string> = {
  saving: "Salvando alterações...",
  saved:  "Alterações salvas com sucesso",
  error:  "Falha ao salvar — verifique sua conexão",
}

const STYLES: Record<FeedbackVariant, React.CSSProperties> = {
  saving: {
    background: "var(--rf-bg-elevated)",
    border: "1px solid var(--rf-border-default)",
    color: "var(--rf-text-secondary)",
  },
  saved: {
    background: "var(--rf-success-soft)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "var(--rf-success)",
  },
  error: {
    background: "var(--rf-danger-soft)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "var(--rf-danger)",
  },
}

export function InlineFeedback({ variant, message }: InlineFeedbackProps) {
  const text = message ?? DEFAULTS[variant]

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      ...STYLES[variant],
    }}>
      {variant === "saving" && <SavingIcon />}
      {variant === "saved"  && <SavedIcon  />}
      {variant === "error"  && <ErrorIcon  />}
      {text}
    </div>
  )
}

function SavingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 40 40" style={{ animation: "rf-spin 1s linear infinite", flexShrink: 0 }}>
      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--rf-border-default)" strokeWidth="3" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--rf-accent)" strokeWidth="3" strokeDasharray="40,60" strokeLinecap="round" />
    </svg>
  )
}

function SavedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/* ── Progress State ── */

type ProgressStatus = "loading" | "success" | "error"

interface ProgressStateProps {
  label: string
  percent: number
  status?: ProgressStatus
  subLabel?: string
}

const FILL_COLOR: Record<ProgressStatus, string> = {
  loading: "linear-gradient(90deg, var(--rf-accent), var(--rf-cyan))",
  success: "var(--rf-success)",
  error:   "var(--rf-danger)",
}

const PCT_COLOR: Record<ProgressStatus, string> = {
  loading: "var(--rf-text-muted)",
  success: "var(--rf-success)",
  error:   "var(--rf-danger)",
}

export function ProgressState({ label, percent, status = "loading", subLabel }: ProgressStateProps) {
  const pctText = status === "error" ? "Falhou" : `${percent}%`

  return (
    <div style={{
      background: "var(--rf-bg-surface)",
      border: "1px solid var(--rf-border-default)",
      borderRadius: 14, padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)" }}>{label}</span>
        <span style={{ fontSize: 12, color: PCT_COLOR[status], fontFamily: "monospace" }}>{pctText}</span>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: "var(--rf-border-subtle)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${percent}%`,
          borderRadius: 9999,
          background: FILL_COLOR[status],
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      {subLabel && (
        <div style={{ fontSize: 11, color: PCT_COLOR[status], marginTop: 6 }}>{subLabel}</div>
      )}
    </div>
  )
}
