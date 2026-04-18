"use client"

import * as React from "react"
 import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { CreateCalendarExceptionDialog } from "@/components/cockpit/dialogs/create-calendar-exception-dialog"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import api from "@/utils/api"
import { COCKPIT_AREAS } from "@/lib/cockpit/constants"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export default function CockpitCalendarioPage() {
  // Mantém demo igual à imagem (março/2026 com dia 27 destacado)
  const [cursorDate, setCursorDate] = useState(() => new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [showExcecaoModal, setShowExcecaoModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [rituals, setRituals] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [areaFilter, setAreaFilter] = useState<string>("all")

  /** Atualiza periodicamente para badges (ex.: "Em breve" → após o horário) e "hoje" na UI. */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const areaParams = areaFilter !== "all" ? { area: areaFilter } : {}
        const [rRes, mRes] = await Promise.all([
          api.get("/cockpit/rituals", { params: areaParams }),
          api.get("/cockpit/meetings", { params: areaParams }),
        ])
        if (!alive) return
        setRituals(rRes.data ?? [])
        setMeetings(mRes.data ?? [])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [areaFilter])

  const monthStart = useMemo(() => new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1), [cursorDate])
  const monthLabel = useMemo(
    () => monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    [monthStart]
  )

  const grid = useMemo(() => buildMonthGrid(monthStart), [monthStart])

  // Dias visíveis conforme a view selecionada
  const weekDays = useMemo(() => getWeekDays(cursorDate), [cursorDate])
  const visibleDays = useMemo(() => {
    if (view === "week") return weekDays
    if (view === "day") return [new Date(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate(), 12, 0, 0)]
    return grid.days
  }, [view, cursorDate, weekDays, grid.days])

  const eventsByDay = useMemo(
    () => buildEventsForDateRange(visibleDays, rituals, meetings),
    [visibleDays, rituals, meetings]
  )

  // Label dinâmico na toolbar conforme a view
  const viewLabel = useMemo(() => {
    if (view === "week") {
      const s = weekDays[0], e = weekDays[6]
      const sm = capitalize(s.toLocaleDateString("pt-BR", { month: "short" }))
      const em = capitalize(e.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }))
      return s.getMonth() === e.getMonth()
        ? `${s.getDate()} – ${e.getDate()} de ${em}`
        : `${s.getDate()} ${sm} – ${e.getDate()} ${em}`
    }
    if (view === "day") {
      return capitalize(cursorDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long", year: "numeric" }))
    }
    return capitalize(monthLabel)
  }, [view, cursorDate, weekDays, monthLabel])

  function handlePrev() {
    if (view === "month") setCursorDate(addMonths(cursorDate, -1))
    else if (view === "week") setCursorDate(addDays(cursorDate, -7))
    else setCursorDate(addDays(cursorDate, -1))
  }

  function handleNext() {
    if (view === "month") setCursorDate(addMonths(cursorDate, 1))
    else if (view === "week") setCursorDate(addDays(cursorDate, 7))
    else setCursorDate(addDays(cursorDate, 1))
  }

  const next48h = useMemo(() => {
    // Para o painel lateral sempre usar o mês completo como base
    const monthEvents = buildEventsForDateRange(grid.days, rituals, meetings)
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(end.getHours() + 48)
    return collectUpcoming(monthEvents, start, end).slice(0, 5)
  }, [grid.days, rituals, meetings, now])

  const notTracked = useMemo(() => {
    const monthEvents = buildEventsForDateRange(grid.days, rituals, meetings)
    const out: CalendarEvent[] = []
    for (const day of grid.days) {
      const list = monthEvents.get(iso(day)) ?? []
      out.push(...list.filter((e) => e.status === "not_tracked"))
    }
    return out.slice(0, 6)
  }, [grid.days, rituals, meetings])

  function handleExportar() {
    const allEvents: CalendarEvent[] = []
    for (const day of visibleDays) {
      const list = eventsByDay.get(iso(day)) ?? []
      allEvents.push(...list)
    }
    const header = ["Data", "Horário", "Título", "Status"]
    const statusLabels: Record<string, string> = {
      done: "Realizado", scheduled: "Agendado", today: "Hoje",
      not_tracked: "Não rastreado", cancelled: "Cancelado",
    }
    const rows = allEvents.map((e) => [
      e.date.split("-").reverse().join("/"), e.time, e.title,
      statusLabels[e.status] ?? e.status,
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `calendario-${view}-${iso(cursorDate)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        title="Calendário de Rituais"
        description="Agenda de todos os rituais da empresa — março 2026"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setShowExcecaoModal(true)}>
              <Plus className="h-4 w-4" />
              Criar Exceção
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
              <a
                href={
                  areaFilter !== "all"
                    ? `/api-proxy/cockpit/rituals/export/ics?area=${encodeURIComponent(areaFilter)}`
                    : "/api-proxy/cockpit/rituals/export/ics"
                }
                download="cockpit-rituais.ics"
              >
                <Download className="h-4 w-4" />
                iCal (.ics)
              </a>
            </Button>
            <Button variant="default" size="sm" className="gap-2" onClick={handleExportar}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        {/* Toolbar */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Área</span>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Todas</option>
                  {COCKPIT_AREAS.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Navegação < label > */}
              <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 max-w-[min(100%,200px)] truncate px-2 text-center text-sm font-semibold text-foreground sm:max-w-none sm:min-w-[140px]">
                  {viewLabel}
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Botões de view: Hoje | Semana | Mês */}
              <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
                <Button
                  type="button" size="sm"
                  className={cn("h-8 px-3", view === "day"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground")}
                  onClick={() => { setView("day"); setCursorDate(new Date()) }}
                >
                  Hoje
                </Button>
                <Button
                  type="button" size="sm"
                  className={cn("h-8 px-3", view === "week"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground")}
                  onClick={() => setView("week")}
                >
                  Semana
                </Button>
                <Button
                  type="button" size="sm"
                  className={cn("h-8 px-3", view === "month"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground")}
                  onClick={() => setView("month")}
                >
                  Mês
                </Button>
              </div>
            </div>

            <Legend />
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          {/* Área principal: renderiza view conforme selecionado */}
          {view === "month" && (
            <MonthView
              grid={grid}
              monthStart={monthStart}
              eventsByDay={eventsByDay}
              cursorDate={cursorDate}
              onDayClick={(d) => setCursorDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0))}
            />
          )}
          {view === "week" && (
            <WeekView
              days={weekDays}
              eventsByDay={eventsByDay}
              cursorDate={cursorDate}
              todayBase={now}
              onDayClick={(d) => { setCursorDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)); setView("day") }}
            />
          )}
          {view === "day" && (
            <DayView
              date={cursorDate}
              events={eventsByDay.get(iso(cursorDate)) ?? []}
            />
          )}

          {/* Right sidebar */}
          <aside className="min-w-0 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <SidebarMiniCalendar
                selected={cursorDate}
                onSelect={setCursorDate}
                monthStart={monthStart}
                todayBase={now}
                onPrev={() => setCursorDate(addMonths(cursorDate, -1))}
                onNext={() => setCursorDate(addMonths(cursorDate, 1))}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Próximas 48h
                </div>
                <div className="text-xs text-muted-foreground">{next48h.length} eventos</div>
              </div>
              <div className="mt-4 space-y-4">
                {next48h.map((e) => {
                  const pendingHref = isUpcomingPendingPastStart(e, now) ? pendingResolveHref(e) : null
                  return (
                    <div key={e.id} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: statusDot(e.status) }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {e.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{e.whenLabel}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", upcomingSidebarBadgeClass(e, now))}>
                          {upcomingSidebarBadgeLabel(e, now)}
                        </span>
                        {pendingHref && (
                          <Link
                            href={pendingHref}
                            className="text-[11px] font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {e.meetingId ? "Abrir reunião" : "Ir ao ritual"}
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Não rastreados
                </div>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold text-destructive">
                  {notTracked.length}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {notTracked.map((e) => (
                  <div key={e.id} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusDot("not_tracked") }} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{e.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{e.whenLabel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal Criar Exceção */}
      <CreateCalendarExceptionDialog
        open={showExcecaoModal}
        onClose={() => setShowExcecaoModal(false)}
        rituals={rituals}
        defaultDate={iso(cursorDate)}
      />
    </>
  )
}

type CalendarStatus = "done" | "scheduled" | "today" | "not_tracked" | "cancelled"

type CalendarEvent = {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  title: string
  status: CalendarStatus
  whenLabel: string
  /** Para atalho quando o horário já passou e falta registro (ata / status da reunião). */
  ritualId?: string
  meetingId?: string
}

function Legend() {
  const items: { label: string; status: CalendarStatus }[] = [
    { label: "Realizado", status: "done" },
    { label: "Agendado", status: "scheduled" },
    { label: "Hoje", status: "today" },
    { label: "Não rastreado", status: "not_tracked" },
    { label: "Cancelado", status: "cancelled" },
  ]
  return (
    <div className="flex w-full flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3 lg:w-auto lg:justify-end">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusDot(i.status) }} />
          {i.label}
        </div>
      ))}
    </div>
  )
}

function statusDot(s: CalendarStatus): string {
  if (s === "done") return "#22c55e"
  if (s === "scheduled") return "#3b82f6"
  if (s === "today") return "#f59e0b"
  if (s === "not_tracked") return "#94a3b8"
  return "#ef4444"
}

function badgeLabel(s: CalendarStatus): string {
  if (s === "done") return "Realizado"
  if (s === "scheduled") return "Agendado"
  if (s === "today") return "Em breve"
  if (s === "not_tracked") return "Não rastreado"
  return "Cancelado"
}

function badgeClass(s: CalendarStatus): string {
  if (s === "done") return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
  if (s === "scheduled") return "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
  if (s === "today") return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
  if (s === "not_tracked") return "border-border bg-muted text-muted-foreground"
  return "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
}

function parseEventLocalDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  const parts = (timeStr || "00:00").split(":")
  const hh = Number(parts[0]) || 0
  const mm = Number(parts[1]) || 0
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

/** Próximas 48h: "Em breve" só antes do horário; depois indica que falta registro/conclusão. */
function upcomingSidebarBadgeLabel(e: CalendarEvent, now: Date): string {
  if (e.status === "today") {
    const start = parseEventLocalDateTime(e.date, e.time)
    if (now.getTime() >= start.getTime()) return "Pendente"
  }
  return badgeLabel(e.status)
}

function upcomingSidebarBadgeClass(e: CalendarEvent, now: Date): string {
  if (e.status === "today") {
    const start = parseEventLocalDateTime(e.date, e.time)
    if (now.getTime() >= start.getTime()) {
      return "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
    }
  }
  return badgeClass(e.status)
}

function isUpcomingPendingPastStart(e: CalendarEvent, now: Date): boolean {
  if (e.status !== "today") return false
  return now.getTime() >= parseEventLocalDateTime(e.date, e.time).getTime()
}

/** Onde concluir o registro: reunião existente (ata) ou página do ritual (nova reunião). */
function pendingResolveHref(e: CalendarEvent): string | null {
  const rid = e.ritualId?.trim()
  if (!rid) return null
  const mid = e.meetingId?.trim()
  if (mid) return `/cockpit/rituais/${rid}/reunioes/${mid}`
  return `/cockpit/rituais/${rid}`
}

function buildMonthGrid(monthStart: Date) {
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  const startDow = firstDay.getDay()
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - startDow)
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(d)
  }
  return { days }
}

function buildEventsForDateRange(
  days: Date[],
  rituals: Record<string, unknown>[],
  meetings: Record<string, unknown>[]
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()

  const add = (e: CalendarEvent) => {
    const list = map.get(e.date) ?? []
    // avoid duplicates by id
    if (list.some((x) => x.id === e.id)) return
    list.push(e)
    list.sort((a, b) => (a.time < b.time ? -1 : 1))
    map.set(e.date, list)
  }

  const isBusinessDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5

  // Parse ritual schedule to determine which days it occurs
  function ritualMatchesDay(r: Record<string, unknown>, d: Date): boolean {
    const freq = ((r.freq as string) ?? (r.frequency as string) ?? "").toLowerCase()
    const schedule = ((r.schedule as string) ?? "").toLowerCase()
    const dayOfWeek = d.getDay()

    if (freq === "daily" || freq === "diário") return isBusinessDay(d)
    if (freq === "weekly" || freq === "semanal") {
      if (schedule.includes("seg") || schedule.includes("segunda")) return dayOfWeek === 1
      if (schedule.includes("ter") || schedule.includes("terça")) return dayOfWeek === 2
      if (schedule.includes("qua") || schedule.includes("quarta")) return dayOfWeek === 3
      if (schedule.includes("qui") || schedule.includes("quinta")) return dayOfWeek === 4
      if (schedule.includes("sex") || schedule.includes("sexta")) return dayOfWeek === 5
      return dayOfWeek === 1
    }
    if (freq === "biweekly" || freq === "quinzenal") {
      const weekNum = Math.floor(d.getDate() / 7)
      return weekNum % 2 === 0 && dayOfWeek === 3
    }
    if (freq === "monthly" || freq === "mensal") {
      return d.getDate() <= 7 && dayOfWeek === 1
    }
    return false
  }

  // Generate events from rituals
  for (const r of rituals) {
    if ((r.is_active as boolean) === false) continue
    const name = (r.name as string) ?? "Ritual"
    const scheduleStr = (r.schedule as string) ?? ""
    const timeMatch = scheduleStr.match(/(\d{2}:\d{2})/)
    const time = timeMatch ? timeMatch[1] : "09:00"
    const rId = String(r.id ?? "")

    for (const d of days) {
      if (!ritualMatchesDay(r, d)) continue
      const date = iso(d)
      add({
        id: `ritual-${rId}-${date}`,
        date,
        time,
        title: name,
        status: "scheduled",
        whenLabel: `${dayLabelRelative(d)} · ${time}`,
        ritualId: rId,
      })
    }
  }

  // Override with actual meetings from API (done / not_tracked / cancelled)
  for (const m of meetings) {
    const ritual = rituals.find((r) => r.id === m.ritual_id)
    const title = (ritual?.name as string) ?? "Ritual"
    const ritualSchedule = (ritual?.schedule as string) ?? ""
    const ritualTimeMatch = ritualSchedule.match(/(\d{2}:\d{2})/)
    const time = ritualTimeMatch ? ritualTimeMatch[1] : "09:00"
    const status: CalendarStatus =
      m.state === "done" ? "done"
      : m.state === "cancelled" ? "cancelled"
      : m.state === "not_tracked" ? "not_tracked"
      : "scheduled"
    const occurredRaw = (m.occurred_at as string) ?? (m.date as string) ?? ""
    const date = occurredRaw.slice(0, 10)
    if (!date) continue

    // Remove the generated "scheduled" event for this ritual+date and replace with actual
    const existing = map.get(date) ?? []
    const rId = String(m.ritual_id ?? "")
    const filtered = existing.filter((e) => e.id !== `ritual-${rId}-${date}`)
    filtered.push({
      id: `meeting-${m.id}`,
      date,
      time,
      title,
      status,
      whenLabel: `${date.split("-").reverse().slice(0, 2).join("/")} · ${time}`,
      ritualId: rId,
      meetingId: String(m.id ?? ""),
    })
    filtered.sort((a, b) => (a.time < b.time ? -1 : 1))
    map.set(date, filtered)
  }

  // Mark today's events
  const today = new Date().toISOString().slice(0, 10)
  const todayList = map.get(today)
  if (todayList) {
    map.set(today, todayList.map((e) => ({
      ...e,
      status: e.status === "done" || e.status === "not_tracked" || e.status === "cancelled" ? e.status : "today",
    })))
  }

  return map
}

function collectUpcoming(map: Map<string, CalendarEvent[]>, start: Date, end: Date) {
  const out: CalendarEvent[] = []
  for (const [date, list] of map.entries()) {
    const d = new Date(date + "T12:00:00")
    if (d >= start && d <= end) out.push(...list)
  }
  out.sort((a, b) => (a.date === b.date ? (a.time < b.time ? -1 : 1) : a.date < b.date ? -1 : 1))
  return out
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, Math.min(d.getDate(), 28), 12, 0, 0)
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function dayLabelRelative(d: Date) {
  const base = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const b = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  const diff = Math.round((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000))
  if (diff === 0) return "Hoje"
  if (diff === 1) return "Amanhã"
  if (diff === -1) return "Ontem"
  return d.toLocaleDateString("pt-BR")
}

function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta, 12, 0, 0)
}

function getWeekDays(d: Date): Date[] {
  const dow = d.getDay()
  const sunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow, 12, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + i)
    return day
  })
}

// ─── MonthView ─────────────────────────────────────────────────────────────────

const DAY_ABBR = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

function MonthView({
  grid, monthStart, eventsByDay, cursorDate, onDayClick,
}: {
  grid: { days: Date[] }
  monthStart: Date
  eventsByDay: Map<string, CalendarEvent[]>
  cursorDate: Date
  onDayClick: (d: Date) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {DAY_ABBR.map((d) => (
          <div key={d} className="px-3 py-2 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.days.map((day) => {
          const dayIso = iso(day)
          const list = eventsByDay.get(dayIso) ?? []
          const isCurrentMonth = day.getMonth() === monthStart.getMonth()
          const isSelected = sameDay(day, cursorDate)
          return (
            <div
              key={dayIso}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[110px] cursor-pointer border-t border-l p-2 border-border transition-colors hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isSelected && "bg-emerald-50/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("text-xs font-semibold", isSelected && "text-e")}>{day.getDate()}</div>
                {isSelected && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {day.getDate()}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {list.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "truncate rounded-md px-2 py-1 text-[11px] leading-tight",
                      e.status === "done" && "bg-emerald-50 text-emerald-900",
                      e.status === "scheduled" && "bg-sky-50 text-sky-900",
                      e.status === "today" && "bg-amber-50 text-amber-900",
                      e.status === "not_tracked" && "bg-slate-100 text-slate-700",
                      e.status === "cancelled" && "bg-rose-50 text-rose-900"
                    )}
                  >
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: statusDot(e.status) }} />
                    {e.title}{" "}
                    <span className="text-[10px] opacity-70">{e.time}</span>
                  </div>
                ))}
                {list.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{list.length - 3} mais</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── WeekView ──────────────────────────────────────────────────────────────────

function WeekView({
  days, eventsByDay, cursorDate, todayBase, onDayClick,
}: {
  days: Date[]
  eventsByDay: Map<string, CalendarEvent[]>
  cursorDate: Date
  todayBase: Date
  onDayClick: (d: Date) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Cabeçalho com dias da semana */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {days.map((day, i) => {
          const isToday = sameDay(day, todayBase)
          const isSelected = sameDay(day, cursorDate)
          return (
            <div
              key={i}
              className={cn(
                "border-l first:border-l-0 border-border px-2 py-3 text-center",
                isSelected && "bg-emerald-50/60"
              )}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{DAY_ABBR[i]}</div>
              <div className={cn(
                "mx-auto mt-1.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                isToday && "bg-primary text-primary-foreground",
                !isToday && isSelected && "bg-emerald-100 text-emerald-900",
                !isToday && !isSelected && "text-foreground"
              )}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Eventos por coluna */}
      <div className="grid grid-cols-7 min-h-[420px]">
        {days.map((day, i) => {
          const list = eventsByDay.get(iso(day)) ?? []
          const isSelected = sameDay(day, cursorDate)
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              className={cn(
                "cursor-pointer border-l first:border-l-0 border-t border-border p-2 space-y-1.5 transition-colors hover:bg-muted/50",
                isSelected && "bg-emerald-50/40"
              )}
            >
              {list.length === 0 && (
                <div className="pt-4 text-center text-[11px] text-muted-foreground/40">—</div>
              )}
              {list.map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-[11px] leading-tight",
                    e.status === "done" && "bg-emerald-50 text-emerald-800 border border-emerald-100",
                    e.status === "scheduled" && "bg-sky-50 text-sky-800 border border-sky-100",
                    e.status === "today" && "bg-amber-50 text-amber-800 border border-amber-100",
                    e.status === "not_tracked" && "bg-muted text-muted-foreground border border-border",
                    e.status === "cancelled" && "bg-rose-50 text-rose-700 border border-rose-100 line-through opacity-60"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusDot(e.status) }} />
                    <span className="font-bold">{e.time}</span>
                  </div>
                  <div className="mt-0.5 truncate font-medium">{e.title}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DayView ───────────────────────────────────────────────────────────────────

const TIMELINE_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

function DayView({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const dateLabel = capitalize(date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header do dia */}
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <div className="text-sm font-bold text-foreground">{dateLabel}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {events.length === 0 ? "Nenhum evento neste dia" : `${events.length} evento${events.length !== 1 ? "s" : ""} agendado${events.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-slate-100 dark:divide-border">
        {TIMELINE_HOURS.map((h) => {
          const hourStr = String(h).padStart(2, "0") + ":00"
          const eventsAtHour = events.filter((e) => {
            const eHour = parseInt(e.time.split(":")[0], 10)
            return eHour === h
          })
          const isCurrentHour = h === 9 // simula hora atual (demo)

          return (
            <div key={h} className={cn("flex min-h-[60px] items-start gap-0", isCurrentHour && "bg-amber-50/30 dark:bg-amber-500/5")}>
              {/* Coluna do horário */}
              <div className={cn(
                "w-20 shrink-0 px-4 py-3 text-right text-xs font-medium",
                isCurrentHour ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              )}>
                {hourStr}
                {isCurrentHour && <div className="text-[10px] text-amber-500">agora</div>}
              </div>

              {/* Separador vertical */}
              <div className={cn(
                "w-px self-stretch",
                isCurrentHour ? "bg-amber-400" : "bg-muted"
              )} />

              {/* Eventos */}
              <div className="flex-1 space-y-2 p-2">
                {eventsAtHour.length === 0 && (
                  <div className="h-full" />
                )}
                {eventsAtHour.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "rounded-xl px-4 py-3 border",
                      e.status === "done" && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10",
                      e.status === "scheduled" && "border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-500/10",
                      e.status === "today" && "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-500/10",
                      e.status === "not_tracked" && "border-border bg-muted text-muted-foreground",
                      e.status === "cancelled" && "border-rose-200 bg-rose-50 text-rose-700 line-through opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: statusDot(e.status) }} />
                        <span className="text-sm font-semibold">{e.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium opacity-70">{e.time}</span>
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", badgeClass(e.status))}>
                          {badgeLabel(e.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Mini-calendário customizado (igual à referência) ─────────────────────────

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"]

function SidebarMiniCalendar({
  selected,
  onSelect,
  monthStart,
  todayBase,
  onPrev,
  onNext,
}: {
  selected: Date
  onSelect: (d: Date) => void
  monthStart: Date
  todayBase: Date
  onPrev: () => void
  onNext: () => void
}) {
  const { days } = buildMonthGrid(monthStart)

  const todayMidnight = new Date(
    todayBase.getFullYear(),
    todayBase.getMonth(),
    todayBase.getDate()
  ).getTime()

  const label = capitalize(
    monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  )

  return (
    <div className="w-full select-none">
      {/* Cabeçalho: mês/ano à esquerda, setas à direita */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {label}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Cabeçalho D S T Q Q S S */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((lbl, i) => (
          <div
            key={i}
            className="flex items-center justify-center py-1 text-[11px] font-medium text-muted-foreground"
          >
            {lbl}
          </div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === monthStart.getMonth()
          const isSelected = sameDay(day, selected)
          const dayMidnight = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate()
          ).getTime()
          const isPast = isCurrentMonth && dayMidnight < todayMidnight
          const isWeekday = day.getDay() >= 1 && day.getDay() <= 5
          const showDot = isPast && isWeekday && !isSelected

          return (
            <button
              key={iso(day)}
              type="button"
              onClick={() =>
                onSelect(
                  new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0)
                )
              }
              className={cn(
                "flex flex-col items-center justify-center rounded-md py-0.5 text-xs font-medium leading-none transition-colors",
                "hover:bg-muted",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && !isSelected && "text-foreground"
              )}
            >
              <span className="flex h-6 w-full items-center justify-center">
                {day.getDate()}
              </span>
              <span className="flex h-1.5 items-center justify-center">
                {showDot && (
                  <span className="h-1 w-1 rounded-full bg-primary/70" />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

