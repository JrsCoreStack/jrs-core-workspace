"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { COCKPIT_AREAS, areaColor, areaLabel, normalizeAreaSlug } from "@/lib/cockpit/constants"
import { Calendar, Copy, CornerDownLeft, Loader2, ThumbsUp, X } from "lucide-react"
import type { ActionPlan } from "./action-plan-card"

const COLLABORATORS = [
  "Evandro",
  "José Pedro",
  "Ricardo",
  "Vinicius",
  "João Pedro",
  "Cairo",
]

const STATUSES: { value: ActionPlan["status"]; label: string }[] = [
  { value: "planned", label: "Planejado" },
  { value: "in_progress", label: "Em execução" },
  { value: "blocked", label: "Bloqueado" },
  { value: "delivered", label: "Entregue" },
  { value: "archived", label: "Arquivado" },
]

const LIKES_STORAGE_KEY = "cockpit-ap-comment-likes"

type ErpUser = { id: string; name: string; email: string }

function loadCommentLikes(planId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {}
    return all[planId] ?? {}
  } catch {
    return {}
  }
}

function persistCommentLikes(planId: string, map: Record<string, boolean>) {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {}
    all[planId] = map
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

function dueTimelinePercent(createdAt: string | undefined, dueDate: string, todayIso: string): number {
  const end = new Date(dueDate + "T12:00:00").getTime()
  const fallbackStart = end - 45 * 86400000
  const start = createdAt
    ? new Date(createdAt.slice(0, 10) + "T12:00:00").getTime()
    : fallbackStart
  const now = new Date(todayIso + "T12:00:00").getTime()
  if (end <= start) return 100
  const p = ((now - start) / (end - start)) * 100
  return Math.min(100, Math.max(0, p))
}

function daysRemainingLabel(dueDate: string, todayIso: string): string {
  const d = new Date(dueDate + "T12:00:00").getTime()
  const t = new Date(todayIso + "T12:00:00").getTime()
  const diff = Math.ceil((d - t) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"} em atraso`
  if (diff === 0) return "Vence hoje"
  return `${diff} dia${diff === 1 ? "" : "s"} restante${diff === 1 ? "" : "s"}`
}

function formatDateBr(dueDate: string) {
  return new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

function formatHistoryAt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function CommentRichText({ text }: { text: string }) {
  const parts = text.split(/(@[^\s@]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="font-medium text-primary">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

// ─── Status badge (tema + semântica) ─────────────────────────────────────────
function statusBadgeClass(status: ActionPlan["status"]): string {
  const map: Record<ActionPlan["status"], string> = {
    planned: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-primary/10 text-primary border-primary/25",
    blocked: "bg-destructive/10 text-destructive border-destructive/25",
    delivered: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:text-emerald-300",
    archived: "bg-muted text-muted-foreground border-border",
  }
  return map[status] ?? map.planned
}

/** Chips do histórico: mesma linguagem do card (Bloqueado = laranja) + faixa equivalente para em execução */
function historyStatusChipClass(status: ActionPlan["status"]): string {
  switch (status) {
    case "blocked":
      return "border-orange-400 bg-orange-50 text-orange-500 dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
    case "in_progress":
      return "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-300"
    default:
      return statusBadgeClass(status)
  }
}

function parseHistoryStatusChange(
  action: string,
): { from: ActionPlan["status"]; to: ActionPlan["status"] } | null {
  const m = action.trim().match(/^Status:\s*([^\s→]+)\s*→\s*(.+)$/i)
  if (!m) return null
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")
  const keys: ActionPlan["status"][] = ["planned", "in_progress", "blocked", "delivered", "archived"]
  const fromRaw = norm(m[1] ?? "")
  const toRaw = norm(m[2] ?? "")
  const from = keys.includes(fromRaw as ActionPlan["status"]) ? (fromRaw as ActionPlan["status"]) : null
  const to = keys.includes(toRaw as ActionPlan["status"]) ? (toRaw as ActionPlan["status"]) : null
  if (!from || !to) return null
  return { from, to }
}

function HistoryActionText({ action }: { action: string }) {
  const statusChange = parseHistoryStatusChange(action)
  if (statusChange) {
    const { from, to } = statusChange
    return (
      <div className="space-y-1.5">
        <p className="text-[12px] font-medium leading-snug text-foreground">Status alterado</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              historyStatusChipClass(from),
            )}
          >
            {STATUSES.find((s) => s.value === from)?.label ?? from}
          </span>
          <span className="text-[11px] text-muted-foreground" aria-hidden>
            →
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              historyStatusChipClass(to),
            )}
          >
            {STATUSES.find((s) => s.value === to)?.label ?? to}
          </span>
        </div>
      </div>
    )
  }
  return <p className="text-[12px] font-medium leading-snug text-foreground">{action}</p>
}

// ─── Priority badge ──────────────────────────────────────────────────────────
function priorityBadgeClass(priority: ActionPlan["priority"]): string {
  const map: Record<ActionPlan["priority"], string> = {
    high: "bg-amber-500/10 text-amber-950 border-amber-500/25 dark:text-amber-200",
    medium: "bg-orange-500/10 text-orange-950 border-orange-500/25 dark:text-orange-200",
    low: "bg-lime-500/10 text-lime-950 border-lime-500/25 dark:text-lime-200",
  }
  return map[priority]
}

function priorityDotColor(priority: ActionPlan["priority"]): string {
  return priority === "high" ? "#ca8a04" : priority === "medium" ? "#ea580c" : "#65a30d"
}

function priorityLabel(priority: ActionPlan["priority"]): string {
  return priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"
}

type Draft = {
  title: string
  description: string
  area: string
  ownerName: string
  dueDate: string
  priority: ActionPlan["priority"]
  status: ActionPlan["status"]
  dependsOn: string
}

// ─── Sidebar field wrapper ───────────────────────────────────────────────────
function SideField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

export function ActionPlanDetailsDialog({
  open,
  onOpenChange,
  plan,
  onPlanUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: ActionPlan | null
  onPlanUpdated?: () => void
}) {
  const [draft, setDraft] = useState<Draft>({
    title: "",
    description: "",
    area: "",
    ownerName: "",
    dueDate: "",
    priority: "medium",
    status: "planned",
    dependsOn: "none",
  })
  const [saving, setSaving] = useState(false)
  const [otherPlans, setOtherPlans] = useState<{ id: string; title: string }[]>([])
  const [commentText, setCommentText] = useState("")
  const [sendingComment, setSendingComment] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [erpUsers, setErpUsers] = useState<ErpUser[]>([])
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionFilter, setMentionFilter] = useState("")
  const [mentionPickIndex, setMentionPickIndex] = useState(0)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const todayIso = new Date().toISOString().slice(0, 10)

  const overdue =
    !!plan &&
    plan.status !== "delivered" &&
    plan.status !== "archived" &&
    plan.dueDate < todayIso

  useEffect(() => {
    if (!open || !plan) return
    setDraft({
      title: plan.title,
      description: (plan.notes ?? "").trim() ? plan.notes! : "",
      area: String(normalizeAreaSlug(plan.area)),
      ownerName: plan.ownerName,
      dueDate: plan.dueDate,
      priority: plan.priority,
      status: plan.status,
      dependsOn: plan.dependsOnPlanId ?? "none",
    })
    setLikedComments(loadCommentLikes(plan.id))
  }, [open, plan?.id])

  const patchPlan = useCallback(
    async (body: Record<string, unknown>, opts?: { silent?: boolean }) => {
      if (!plan?.id) return
      setSaving(true)
      try {
        await api.put(`/cockpit/action-plans/${plan.id}`, body)
        if (!opts?.silent) toast.success("Alterações salvas.")
        onPlanUpdated?.()
      } catch (e) {
        toastApiError(e, { fallback: "Não foi possível salvar." })
      } finally {
        setSaving(false)
      }
    },
    [plan?.id, onPlanUpdated],
  )

  useEffect(() => {
    if (!open || !plan) return
    let alive = true
    const cur = String(plan.id)
    void api
      .get("/cockpit/action-plans")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        const rows = list
          .filter((p: { id: string }) => String(p.id) !== cur)
          .map((p: { id: string; title: string }) => ({ id: String(p.id), title: String(p.title ?? "") }))
        if (alive) setOtherPlans(rows)
      })
      .catch(() => { if (alive) setOtherPlans([]) })
    return () => { alive = false }
  }, [open, plan?.id])

  useEffect(() => {
    if (!open) return
    let alive = true
    void api
      .get<ErpUser[]>("/user")
      .then((res) => {
        const raw = res.data ?? []
        const list = raw.map((u) => ({
          id: String(u.id ?? ""),
          name: String(u.name ?? "").trim() || "—",
          email: String(u.email ?? "").trim(),
        }))
        if (alive) setErpUsers(list)
      })
      .catch(() => { if (alive) setErpUsers([]) })
    return () => { alive = false }
  }, [open])

  const mentionCandidates = useMemo(() => {
    if (!mentionOpen) return []
    const q = mentionFilter.toLowerCase()
    return erpUsers
      .filter((u) => {
        const nm = u.name.toLowerCase()
        const em = u.email.toLowerCase()
        return !q || nm.includes(q) || em.includes(q)
      })
      .slice(0, 8)
  }, [mentionOpen, mentionFilter, erpUsers])

  useEffect(() => { setMentionPickIndex(0) }, [mentionCandidates.length, mentionOpen, mentionFilter])

  const insertMention = useCallback(
    (user: ErpUser) => {
      const el = textareaRef.current
      if (!el) return
      const pos = el.selectionStart
      const before = commentText.slice(0, pos)
      const after = commentText.slice(pos)
      const safeName = user.name.replace(/\s+/g, " ").trim()
      const nextBefore = before.replace(/@([\wÀ-ÿ.\-]*)$/, `@${safeName} `)
      const next = nextBefore + after
      setCommentText(next)
      setMentionOpen(false)
      setMentionFilter("")
      requestAnimationFrame(() => {
        el.focus()
        const c = nextBefore.length
        el.setSelectionRange(c, c)
      })
    },
    [commentText],
  )

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mentionOpen || mentionCandidates.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setMentionPickIndex((i) => Math.min(i + 1, mentionCandidates.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setMentionPickIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      insertMention(mentionCandidates[mentionPickIndex]!)
    } else if (e.key === "Escape") {
      setMentionOpen(false)
    }
  }

  function copyPlanId(id: string) {
    void navigator.clipboard.writeText(id).then(
      () => toast.success("ID copiado."),
      () => toast.error("Não foi possível copiar."),
    )
  }

  function toggleCommentLike(commentId: string) {
    if (!plan?.id) return
    setLikedComments((prev) => {
      const next = { ...prev, [commentId]: !prev[commentId] }
      persistCommentLikes(plan.id, next)
      return next
    })
  }

  const idPrefix6 = plan ? plan.id.replace(/-/g, "").slice(0, 6) : ""
  const timelinePct = plan ? dueTimelinePercent(plan.createdAt, plan.dueDate, todayIso) : 0

  const dependsLabel = useMemo(() => {
    if (draft.dependsOn === "none") return "Nenhum"
    const t = otherPlans.find((p) => p.id === draft.dependsOn)?.title?.trim()
    return t || draft.dependsOn.slice(0, 8)
  }, [draft.dependsOn, otherPlans])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(92vh,920px)] w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-[min(924px,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Plano de Ação</DialogTitle>
        <DialogDescription className="sr-only">Editar e acompanhar o plano</DialogDescription>

        {plan ? (
          <div className="flex min-h-0 flex-1 flex-col text-foreground">

            {/* ── Header: badges | título central | fechar ───────────────── */}
            <div className="grid shrink-0 grid-cols-1 items-center gap-3 border-b border-border px-5 py-4 sm:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] sm:gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-self-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[11px] font-semibold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        statusBadgeClass(draft.status),
                      )}
                    >
                      {STATUSES.find((s) => s.value === draft.status)?.label ?? "—"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuRadioGroup
                      value={draft.status}
                      onValueChange={(v) => {
                        const nv = v as ActionPlan["status"]
                        setDraft((d) => ({ ...d, status: nv }))
                        void patchPlan({ status: nv }, { silent: true })
                      }}
                    >
                      {STATUSES.map((s) => (
                        <DropdownMenuRadioItem key={s.value} value={s.value}>
                          {s.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-2 ring-background"
                    style={{ backgroundColor: priorityDotColor(draft.priority) }}
                    aria-hidden
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[11px] font-semibold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          priorityBadgeClass(draft.priority),
                        )}
                      >
                        {priorityLabel(draft.priority)}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuRadioGroup
                        value={draft.priority}
                        onValueChange={(v) => {
                          const nv = v as ActionPlan["priority"]
                          setDraft((d) => ({ ...d, priority: nv }))
                          void patchPlan({ priority: nv }, { silent: true })
                        }}
                      >
                        <DropdownMenuRadioItem value="high">Alta</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="medium">Média</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="low">Baixa</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {overdue ? (
                  <span className="shrink-0 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                    Atrasado
                  </span>
                ) : null}
              </div>

              <Input
                value={draft.title}
                onChange={(e) => {
                  const v = e.target.value
                  setDraft((d) => ({ ...d, title: v }))
                  if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current)
                  titleDebounceRef.current = setTimeout(() => {
                    void patchPlan({ title: v.trim() }, { silent: true })
                  }, 700)
                }}
                onBlur={(e) => {
                  if (titleDebounceRef.current) {
                    clearTimeout(titleDebounceRef.current)
                    titleDebounceRef.current = null
                  }
                  const t = e.target.value.trim()
                  if (t && t !== plan.title) void patchPlan({ title: t }, { silent: true })
                }}
                className="min-h-9 w-full min-w-0 border-0 bg-transparent text-center text-lg font-semibold leading-tight text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:text-xl"
                placeholder="Título do plano"
                maxLength={255}
              />

              <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-self-end">
                {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden /> : null}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Body: main col + sidebar ────────────────────────────── */}
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

              {/* Main column */}
              <div className="min-h-0 flex-[1.65] overflow-y-auto overscroll-contain px-5 py-5 lg:border-r lg:border-border">
                <div className="space-y-7">

                  {/* Descrição */}
                  <div>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Descrição da estratégia
                    </h3>
                    <Textarea
                      value={draft.description}
                      onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      onBlur={(e) => {
                        const desc = e.target.value.trim()
                        const prev = (plan.notes ?? "").trim()
                        if (desc !== prev) void patchPlan({ description: desc || null }, { silent: true })
                      }}
                      placeholder="Descreva o plano, critérios de sucesso, links..."
                      rows={5}
                      className="min-h-[120px] resize-y rounded-xl border border-border bg-muted/30 px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/40"
                    />
                  </div>

                  {/* Comentários */}
                  <div>
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Comentários
                    </h3>

                    <div className="space-y-4">
                      {(() => {
                        const raw = plan.comments ?? []
                        const sorted = [...raw].sort(
                          (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
                        )
                        const replies = new Map<string, typeof sorted>()
                        for (const c of sorted) {
                          const pid = c.parent_id ?? ""
                          if (!pid) continue
                          if (!replies.has(pid)) replies.set(pid, [])
                          replies.get(pid)!.push(c)
                        }
                        const roots = sorted.filter((c) => !c.parent_id)

                        if (roots.length === 0) {
                          return (
                            <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm italic text-muted-foreground">
                              Nenhum comentário ainda.
                            </p>
                          )
                        }

                        return roots.map((c) => (
                          <div key={c.id} className="space-y-3">
                            {/* Root comment */}
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                {initials(c.by)}
                              </div>
                              <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm border border-border bg-muted/40 px-4 py-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-1">
                                  <span className="text-[13px] font-semibold text-foreground">{c.by}</span>
                                  <span className="text-[11px] text-muted-foreground">{formatHistoryAt(c.at)}</span>
                                </div>
                                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                                  <CommentRichText text={c.text} />
                                </p>
                                <div className="mt-3 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setReplyToId(c.id); setCommentText("") }}
                                    className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
                                  >
                                    Responder
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleCommentLike(c.id)}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                      likedComments[c.id]
                                        ? "border-sky-500/35 bg-sky-500/10 text-sky-600 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-400"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                                    )}
                                  >
                                    <ThumbsUp className={cn("h-3 w-3", likedComments[c.id] && "fill-current")} />
                                    Curtir
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Replies */}
                            {(replies.get(c.id) ?? []).map((ch) => (
                              <div key={ch.id} className="ml-12 flex gap-3 border-l-2 border-primary/30 pl-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                  {initials(ch.by)}
                                </div>
                                <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm border border-border bg-muted/30 px-3.5 py-2.5">
                                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                                    <span className="text-[13px] font-semibold text-foreground">{ch.by}</span>
                                    <span className="text-[11px] text-muted-foreground">{formatHistoryAt(ch.at)}</span>
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                                    <CommentRichText text={ch.text} />
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => toggleCommentLike(ch.id)}
                                    className={cn(
                                      "mt-2 flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                                      likedComments[ch.id]
                                        ? "border-sky-500/35 bg-sky-500/10 text-sky-600 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-400"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                                    )}
                                  >
                                    <ThumbsUp className={cn("h-3 w-3", likedComments[ch.id] && "fill-current")} />
                                    Curtir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      })()}

                      {replyToId && (
                        <p className="text-xs text-muted-foreground">
                          Respondendo a um comentário.{" "}
                          <button
                            type="button"
                            className="font-semibold text-primary underline underline-offset-2"
                            onClick={() => setReplyToId(null)}
                          >
                            Cancelar
                          </button>
                        </p>
                      )}

                      {/* Comment input */}
                      <div className="flex gap-3 pt-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {initials(draft.ownerName || "?")}
                        </div>

                        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring/30">
                          {mentionOpen && mentionCandidates.length > 0 ? (
                            <ul
                              className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-40 overflow-auto rounded-xl border border-border bg-popover py-1 text-sm text-popover-foreground shadow-lg"
                              role="listbox"
                            >
                              {mentionCandidates.map((u, idx) => (
                                <li key={u.id}>
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={idx === mentionPickIndex}
                                    className={cn(
                                      "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left",
                                      idx === mentionPickIndex ? "bg-accent" : "hover:bg-muted/80",
                                    )}
                                    onMouseDown={(ev) => ev.preventDefault()}
                                    onClick={() => insertMention(u)}
                                  >
                                    <span className="font-medium">{u.name}</span>
                                    <span className="text-[11px] text-muted-foreground">{u.email}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          <textarea
                            ref={textareaRef}
                            value={commentText}
                            onChange={(e) => {
                              const v = e.target.value
                              const pos = e.target.selectionStart
                              setCommentText(v)
                              const before = v.slice(0, pos)
                              const m = before.match(/@([\wÀ-ÿ.\-]*)$/)
                              if (m) {
                                setMentionOpen(true)
                                setMentionFilter(m[1] ?? "")
                              } else {
                                setMentionOpen(false)
                                setMentionFilter("")
                              }
                            }}
                            onKeyDown={handleCommentKeyDown}
                            onBlur={() => {
                              window.setTimeout(() => {
                                setMentionOpen(false)
                                setMentionFilter("")
                              }, 200)
                            }}
                            rows={3}
                            placeholder={replyToId ? "Resposta… (@nome)" : "Escreva um comentário… (@nome)"}
                            className="min-h-[72px] w-full resize-y border-0 bg-transparent px-3.5 pt-3 pb-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                          />

                          <div className="flex items-center justify-between border-t border-border px-3 py-2">
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <CornerDownLeft className="h-3 w-3 opacity-60" />
                              Enter para mencionar alguém
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              disabled={sendingComment || !commentText.trim() || !plan.id}
                              onClick={async () => {
                                if (!plan?.id || !commentText.trim()) return
                                const wasReply = !!replyToId
                                setSendingComment(true)
                                try {
                                  await api.post(`/cockpit/action-plans/${plan.id}/comments`, {
                                    text: commentText.trim(),
                                    by: draft.ownerName,
                                    ...(replyToId ? { parent_id: replyToId } : {}),
                                  })
                                  setCommentText("")
                                  setReplyToId(null)
                                  toast.success(wasReply ? "Resposta enviada." : "Comentário adicionado.")
                                  onPlanUpdated?.()
                                } catch (e) {
                                  toastApiError(e, { fallback: "Não foi possível enviar o comentário." })
                                } finally {
                                  setSendingComment(false)
                                }
                              }}
                            >
                              {sendingComment ? "Enviando…" : replyToId ? "Responder" : "Comentar"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Sidebar ──────────────────────────────────────────────── */}
              <aside className="flex w-full shrink-0 flex-col border-t border-border bg-muted/25 lg:w-[min(100%,400px)] lg:max-w-[38%] lg:border-t-0 lg:border-l">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">

                  <SideField label="Responsável">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-full min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background px-3 text-left text-sm font-medium shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {initials(draft.ownerName)}
                          </div>
                          <span className="truncate">{draft.ownerName || "Selecionar…"}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuRadioGroup
                          value={draft.ownerName}
                          onValueChange={(v) => {
                            setDraft((d) => ({ ...d, ownerName: v }))
                            void patchPlan({ owner_name: v }, { silent: true })
                          }}
                        >
                          {COLLABORATORS.map((name) => (
                            <DropdownMenuRadioItem key={name} value={name}>
                              {name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SideField>

                  <SideField label="Prazo final">
                    <div className="rounded-xl border border-border bg-background px-3.5 py-3 shadow-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          type="date"
                          value={draft.dueDate}
                          onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                          onBlur={(e) => {
                            const v = e.target.value
                            if (v && v !== plan.dueDate) void patchPlan({ due_date: v }, { silent: true })
                          }}
                          className="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-foreground shadow-none focus-visible:ring-0"
                        />
                        <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
                          {formatDateBr(draft.dueDate)}
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width]",
                            overdue ? "bg-destructive" : "bg-primary",
                          )}
                          style={{ width: `${timelinePct}%` }}
                        />
                      </div>
                      <p
                        className={cn(
                          "mt-1.5 text-[11px]",
                          overdue ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {daysRemainingLabel(plan.dueDate, todayIso)}
                      </p>
                    </div>
                  </SideField>

                  <SideField label="Setor">
                    <div className="flex min-w-0 gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 text-left text-sm font-medium shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: areaColor(draft.area) }}
                              aria-hidden
                            />
                            <span className="truncate">{areaLabel(draft.area) || "Selecionar…"}</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                          <DropdownMenuRadioGroup
                            value={draft.area}
                            onValueChange={(v) => {
                              setDraft((d) => ({ ...d, area: v }))
                              void patchPlan({ area: v }, { silent: true })
                            }}
                          >
                            {COCKPIT_AREAS.map((a) => (
                              <DropdownMenuRadioItem key={a.slug} value={a.slug}>
                                {a.name}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div
                        className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-border bg-background px-2 font-mono text-xs text-muted-foreground shadow-sm"
                        title={plan.id}
                      >
                        <span className="tabular-nums">{idPrefix6}</span>
                        <button
                          type="button"
                          onClick={() => copyPlanId(plan.id)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Copiar ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </SideField>

                  <SideField label="Depende de">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-full min-w-0 items-center rounded-xl border border-border bg-background px-3 text-left text-sm font-medium shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="truncate">{dependsLabel}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="max-h-64 w-72 overflow-y-auto" align="start">
                        <DropdownMenuRadioGroup
                          value={draft.dependsOn}
                          onValueChange={(v) => {
                            setDraft((d) => ({ ...d, dependsOn: v }))
                            void patchPlan({ depends_on_plan_id: v === "none" ? null : v }, { silent: true })
                          }}
                        >
                          <DropdownMenuRadioItem value="none">Nenhum</DropdownMenuRadioItem>
                          {otherPlans.map((p) => (
                            <DropdownMenuRadioItem key={p.id} value={p.id}>
                              {p.title || p.id.slice(0, 8)}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SideField>

                  {plan.dependsOnPlanId && draft.dependsOn !== "none" ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-foreground">
                      <span className="font-semibold">Predecessor: </span>
                      <Link
                        href={`/cockpit/planos-de-acao?id=${plan.dependsOnPlanId}`}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Abrir plano vinculado
                      </Link>
                    </div>
                  ) : null}

                  <div className="h-px bg-border" />

                  <div>
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Histórico de alterações
                    </h3>

                    <div className="space-y-0">
                      {(() => {
                        const history = plan.history ?? []
                        if (history.length === 0) {
                          return <p className="text-xs italic text-muted-foreground">Nenhum registro de alteração.</p>
                        }
                        return history.map((h, i) => (
                          <div key={`${h.at}-${i}`} className="relative flex gap-3 pb-4">
                            {i < history.length - 1 ? (
                              <div className="absolute top-5 bottom-0 left-[9px] w-px bg-border" />
                            ) : null}
                            <div
                              className={cn(
                                "relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-background shadow-sm",
                                i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                              )}
                            />
                            <div className="min-w-0 flex-1 pt-0.5">
                              <HistoryActionText action={h.action} />
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {h.at ? formatHistoryAt(h.at) : "—"}
                                {h.by ? (
                                  <>
                                    {" "}
                                    · <span className="font-semibold text-foreground/80">{h.by}</span>
                                  </>
                                ) : null}
                              </p>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 border-t border-border bg-muted/20 px-5 py-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}