"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import api from "@/utils/api"
import { COCKPIT_AREAS, normalizeAreaSlug } from "@/lib/cockpit/constants"
import Link from "next/link"

/* ─── AREA COLOR SYSTEM ─── */
const CAL_AREA_COLORS: Record<string, string> = {
  COMMERCIAL: "#7b61ff",
  FINANCIAL:  "#f97316",
  OPERATIONAL:"#00d4ff",
  TECHNOLOGY: "#00d4ff",
  STRATEGIC:  "#f59e0b",
  MARKETING:  "#10b981",
  PLAY:       "#22c55e",
}
const CAL_AREA_LABELS: Record<string, string> = {
  COMMERCIAL: "Comercial",
  FINANCIAL:  "Financeiro",
  OPERATIONAL:"Operações",
  TECHNOLOGY: "Tecnologia",
  STRATEGIC:  "Sócios",
  MARKETING:  "Marketing",
  PLAY:       "Play",
}
const FREQ_LABELS: Record<string, string> = {
  daily:"Daily", weekly:"Semanal", biweekly:"Quinzenal", monthly:"Mensal",
  "diário":"Daily","semanal":"Semanal","quinzenal":"Quinzenal","mensal":"Mensal",
}
function calAreaColor(area: string): string {
  return CAL_AREA_COLORS[(area ?? "").toUpperCase()] ?? "#7b61ff"
}
function calAreaLabel(area: string): string {
  return CAL_AREA_LABELS[(area ?? "").toUpperCase()] ?? area ?? "—"
}
function calFreqLabel(freq: string): string {
  return FREQ_LABELS[(freq ?? "").toLowerCase()] ?? freq ?? "—"
}
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* ─── TYPES ─── */
type CalendarStatus = "done" | "scheduled" | "today" | "not_tracked" | "cancelled"
type CalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  area: string
  frequency: string
  ownerName: string
  participantCount: number
  status: CalendarStatus
  whenLabel: string
  ritualId?: string
  meetingId?: string
  blockedNote?: string
}

/* ─── UTILITY FUNCTIONS ─── */
function iso(d: Date): string { return d.toISOString().slice(0,10) }
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()
}
function capitalize(s: string): string { return s.charAt(0).toUpperCase()+s.slice(1) }
function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth()+delta, Math.min(d.getDate(),28), 12, 0, 0)
}
function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()+delta, 12, 0, 0)
}
function getWeekDays(d: Date): Date[] {
  const dow = d.getDay()
  const sun = new Date(d.getFullYear(), d.getMonth(), d.getDate()-dow, 12, 0, 0)
  return Array.from({length:7},(_,i)=>{ const x=new Date(sun); x.setDate(sun.getDate()+i); return x })
}
function buildMonthGrid(monthStart: Date): {days: Date[]} {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  const start = new Date(first); start.setDate(first.getDate()-first.getDay())
  const days: Date[] = []
  for(let i=0;i<42;i++){ const d=new Date(start); d.setDate(start.getDate()+i); days.push(d) }
  return {days}
}
function dayLabelRelative(d: Date): string {
  const today = new Date(); today.setHours(12,0,0,0)
  const t = new Date(d); t.setHours(12,0,0,0)
  const diff = Math.round((t.getTime()-today.getTime())/(86400000))
  if(diff===0) return "Hoje"
  if(diff===1) return "Amanhã"
  if(diff===-1) return "Ontem"
  return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})
}
function parseLocalDT(date: string, time: string): Date {
  const [y,m,d] = date.split("-").map(Number)
  const [h,mm] = (time||"00:00").split(":").map(Number)
  return new Date(y, m-1, d, h, mm)
}
function isLive(e: CalendarEvent, now: Date): boolean {
  if(e.status!=="today") return false
  return now.getTime()>=parseLocalDT(e.date,e.time).getTime()
}

const DAY_ABBR = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"]
const WEEK_TIMES = ["08:00","09:00","10:00","10:30","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]

/* ─── BUILD EVENTS ─── */
function buildEventsForDateRange(
  days: Date[],
  rituals: Record<string,unknown>[],
  meetings: Record<string,unknown>[]
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  const add = (e: CalendarEvent) => {
    const list = map.get(e.date)??[]
    if(list.some(x=>x.id===e.id)) return
    list.push(e)
    list.sort((a,b)=>a.time<b.time?-1:1)
    map.set(e.date,list)
  }
  const isBusinessDay = (d:Date)=>d.getDay()>=1&&d.getDay()<=5
  function ritualMatchesDay(r: Record<string,unknown>, d: Date): boolean {
    const freq = ((r.freq as string)??(r.frequency as string)??"").toLowerCase()
    const schedule = ((r.schedule as string)??"").toLowerCase()
    const dow = d.getDay()
    if(freq==="daily"||freq==="diário") return isBusinessDay(d)
    if(freq==="weekly"||freq==="semanal") {
      if(schedule.includes("seg")||schedule.includes("segunda")) return dow===1
      if(schedule.includes("ter")||schedule.includes("terça")) return dow===2
      if(schedule.includes("qua")||schedule.includes("quarta")) return dow===3
      if(schedule.includes("qui")||schedule.includes("quinta")) return dow===4
      if(schedule.includes("sex")||schedule.includes("sexta")) return dow===5
      return dow===1
    }
    if(freq==="biweekly"||freq==="quinzenal") return Math.floor(d.getDate()/7)%2===0&&dow===3
    if(freq==="monthly"||freq==="mensal") return d.getDate()<=7&&dow===1
    return false
  }
  for(const r of rituals) {
    if((r.is_active as boolean)===false) continue
    const name = (r.name as string)??"Ritual"
    const schedStr = (r.schedule as string)??""
    const timeMatch = schedStr.match(/(\d{2}:\d{2})/)
    const time = timeMatch?timeMatch[1]:"09:00"
    const freq = ((r.freq as string)??(r.frequency as string)??"")
    const area = String(normalizeAreaSlug((r.area as string)??"")||"COMMERCIAL").toUpperCase()
    const owner = (r.owner_name as string)??(r.responsible as string)??""
    const rId = String(r.id??"")
    for(const d of days) {
      if(!ritualMatchesDay(r,d)) continue
      const date = iso(d)
      add({
        id:`ritual-${rId}-${date}`, date, time, title:name,
        area, frequency:freq, ownerName:owner, participantCount:0,
        status:"scheduled", whenLabel:`${dayLabelRelative(d)} · ${time}`,
        ritualId:rId,
      })
    }
  }
  for(const m of meetings) {
    const ritual = rituals.find(r=>r.id===m.ritual_id)
    const title = (ritual?.name as string)??"Ritual"
    const schedStr = (ritual?.schedule as string)??""
    const timeMatch = schedStr.match(/(\d{2}:\d{2})/)
    const time = timeMatch?timeMatch[1]:"09:00"
    const freq = ((ritual?.freq as string)??(ritual?.frequency as string)??"")
    const area = String(normalizeAreaSlug((ritual?.area as string)??"")||"COMMERCIAL").toUpperCase()
    const owner = (ritual?.owner_name as string)??""
    const status: CalendarStatus =
      m.state==="done"?"done":m.state==="cancelled"?"cancelled":
      m.state==="not_tracked"?"not_tracked":"scheduled"
    const occurredRaw = (m.occurred_at as string)??(m.date as string)??""
    const date = occurredRaw.slice(0,10)
    if(!date) continue
    const rId = String(m.ritual_id??"")
    const existing = map.get(date)??[]
    const filtered = existing.filter(e=>e.id!==`ritual-${rId}-${date}`)
    filtered.push({
      id:`meeting-${m.id}`, date, time, title, area, frequency:freq,
      ownerName:owner, participantCount:0, status,
      whenLabel:`${date.split("-").reverse().slice(0,2).join("/")} · ${time}`,
      ritualId:rId, meetingId:String(m.id??""),
    })
    filtered.sort((a,b)=>a.time<b.time?-1:1)
    map.set(date, filtered)
  }
  const today = new Date().toISOString().slice(0,10)
  const todayList = map.get(today)
  if(todayList) {
    map.set(today, todayList.map(e=>({
      ...e,
      status: e.status==="done"||e.status==="not_tracked"||e.status==="cancelled"?e.status:"today",
    })))
  }
  return map
}

function collectUpcoming(map: Map<string,CalendarEvent[]>, start: Date, end: Date) {
  const out: CalendarEvent[] = []
  for(const [date,list] of map.entries()) {
    const d = new Date(date+"T12:00:00")
    if(d>=start&&d<=end) out.push(...list)
  }
  out.sort((a,b)=>a.date===b.date?(a.time<b.time?-1:1):a.date<b.date?-1:1)
  return out
}

/* ─── MAIN PAGE ─── */
export default function CockpitCalendarioPage() {
  const [cursorDate, setCursorDate] = useState(()=>new Date())
  const [view, setView] = useState<"month"|"week"|"day"|"missed">("month")
  const [loading, setLoading] = useState(true)
  const [rituals, setRituals] = useState<Record<string,unknown>[]>([])
  const [meetings, setMeetings] = useState<Record<string,unknown>[]>([])
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [now, setNow] = useState(()=>new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent|null>(null)
  const [liveEvent, setLiveEvent] = useState<CalendarEvent|null>(null)

  useEffect(()=>{
    const id = window.setInterval(()=>setNow(new Date()), 30_000)
    return ()=>window.clearInterval(id)
  },[])

  useEffect(()=>{
    let alive = true
    ;(async()=>{
      setLoading(true)
      try {
        const params = areaFilter!=="all"?{area:areaFilter}:{}
        const [rRes,mRes] = await Promise.all([
          api.get("/cockpit/rituals",{params}),
          api.get("/cockpit/meetings",{params}),
        ])
        if(!alive) return
        setRituals(rRes.data??[])
        setMeetings(mRes.data??[])
      } finally { if(alive) setLoading(false) }
    })()
    return ()=>{ alive=false }
  },[areaFilter])

  const monthStart = useMemo(()=>new Date(cursorDate.getFullYear(),cursorDate.getMonth(),1),[cursorDate])
  const grid = useMemo(()=>buildMonthGrid(monthStart),[monthStart])
  const weekDays = useMemo(()=>getWeekDays(cursorDate),[cursorDate])

  const visibleDays = useMemo(()=>{
    if(view==="week") return weekDays
    if(view==="day") return [new Date(cursorDate.getFullYear(),cursorDate.getMonth(),cursorDate.getDate(),12,0,0)]
    return grid.days
  },[view,cursorDate,weekDays,grid.days])

  const eventsByDay = useMemo(()=>buildEventsForDateRange(visibleDays,rituals,meetings),[visibleDays,rituals,meetings])

  const viewLabel = useMemo(()=>{
    if(view==="week") {
      const s=weekDays[0],e=weekDays[6]
      return s.getMonth()===e.getMonth()
        ?`${s.getDate()} – ${e.getDate()} ${capitalize(s.toLocaleDateString("pt-BR",{month:"short"}))}`
        :`${s.getDate()} – ${e.getDate()} ${capitalize(e.toLocaleDateString("pt-BR",{month:"short",year:"numeric"}))}`
    }
    if(view==="day"||view==="missed")
      return capitalize(cursorDate.toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"}))
    return capitalize(monthStart.toLocaleDateString("pt-BR",{month:"long",year:"numeric"}))
  },[view,cursorDate,weekDays,monthStart])

  const next48h = useMemo(()=>{
    const me = buildEventsForDateRange(grid.days,rituals,meetings)
    const s = new Date(now); s.setHours(0,0,0,0)
    const e = new Date(s); e.setTime(e.getTime()+48*3600000)
    return collectUpcoming(me,s,e).slice(0,6)
  },[grid.days,rituals,meetings,now])

  const missedEvents = useMemo(()=>{
    const me = buildEventsForDateRange(grid.days,rituals,meetings)
    const out: CalendarEvent[] = []
    for(const day of grid.days) out.push(...(me.get(iso(day))??[]).filter(e=>e.status==="not_tracked"))
    return out
  },[grid.days,rituals,meetings])

  function handlePrev() {
    if(view==="month") setCursorDate(addMonths(cursorDate,-1))
    else if(view==="week") setCursorDate(addDays(cursorDate,-7))
    else setCursorDate(addDays(cursorDate,-1))
  }
  function handleNext() {
    if(view==="month") setCursorDate(addMonths(cursorDate,1))
    else if(view==="week") setCursorDate(addDays(cursorDate,7))
    else setCursorDate(addDays(cursorDate,1))
  }

  function openEvent(e: CalendarEvent) {
    if(isLive(e,now)) setLiveEvent(e)
    else setSelectedEvent(e)
  }

  const areaChips = [
    {slug:"all",label:"Todos",color:"var(--rf-text-secondary,#7e8a9e)"},
    ...COCKPIT_AREAS.map(a=>({slug:a.slug,label:a.name,color:calAreaColor(a.slug)})),
  ]

  return (
    <>
      <style>{`
        .cal-page { display:flex;flex-direction:column;height:100%;overflow:hidden; }

        /* TOPBAR */
        .cal-topbar {
          background:var(--rf-bg-surface);
          border-bottom:1px solid var(--rf-border-subtle);
          padding:14px 20px;
          flex-shrink:0;
        }
        .cal-top-row {
          display:flex;align-items:center;justify-content:space-between;
          gap:12px;margin-bottom:12px;flex-wrap:wrap;
        }
        .cal-title-group { display:flex;align-items:center;gap:10px; }
        .cal-page-title {
          font-family:var(--font-display,'Plus Jakarta Sans',system-ui,sans-serif);
          font-size:20px;font-weight:800;color:var(--rf-text-primary);letter-spacing:-0.3px;
        }
        .cal-nav { display:flex;align-items:center;gap:5px; }
        .cal-nav-btn {
          width:28px;height:28px;border-radius:8px;
          background:var(--rf-bg-elevated);border:1px solid var(--rf-border-default);
          display:grid;place-items:center;cursor:pointer;color:var(--rf-text-secondary);
          transition:all 0.18s;
        }
        .cal-nav-btn:hover { background:var(--rf-bg-hover);color:var(--rf-text-primary); }
        .cal-period {
          font-family:var(--font-display,'Plus Jakarta Sans',system-ui,sans-serif);
          font-size:14px;font-weight:700;color:var(--rf-text-primary);
          min-width:140px;text-align:center;
        }
        .cal-today-btn {
          padding:5px 12px;border-radius:8px;
          background:var(--rf-bg-elevated);border:1px solid var(--rf-border-default);
          font-size:12px;font-weight:600;color:var(--rf-text-secondary);cursor:pointer;transition:all 0.18s;
        }
        .cal-today-btn:hover { color:var(--rf-accent,#7b61ff);border-color:rgba(123,97,255,0.28); }

        /* VIEW TABS */
        .view-tabs {
          display:flex;gap:2px;
          background:var(--rf-bg-overlay);border:1px solid var(--rf-border-subtle);
          border-radius:10px;padding:3px;
        }
        .view-tab {
          padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;
          color:var(--rf-text-muted);cursor:pointer;transition:all 0.18s;white-space:nowrap;
        }
        .view-tab.active {
          background:var(--rf-bg-surface);color:var(--rf-text-primary);
          box-shadow:0 1px 4px rgba(0,0,0,0.1);
        }

        /* BTN PRIMARY */
        .cal-btn-primary {
          display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
          border-radius:10px;background:var(--rf-accent,#7b61ff);color:#fff;
          font-size:12px;font-weight:600;cursor:pointer;border:none;
          box-shadow:0 2px 8px rgba(123,97,255,0.35);transition:all 0.18s;white-space:nowrap;
        }
        .cal-btn-primary:hover { background:var(--rf-accent-hover,#9178ff); }
        .cal-btn-ghost {
          display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
          border-radius:10px;background:var(--rf-bg-elevated);color:var(--rf-text-secondary);
          border:1px solid var(--rf-border-default);font-size:12px;font-weight:600;
          cursor:pointer;transition:all 0.18s;white-space:nowrap;
        }
        .cal-btn-ghost:hover { border-color:var(--rf-border-strong);color:var(--rf-text-primary); }

        /* FILTER CHIPS */
        .cal-filter-row {
          display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;align-items:center;
        }
        .cal-filter-row::-webkit-scrollbar { display:none; }
        .fchip {
          flex-shrink:0;padding:5px 11px;border-radius:9999px;
          border:1px solid var(--rf-border-default);background:var(--rf-bg-elevated);
          font-size:11px;font-weight:600;color:var(--rf-text-secondary);cursor:pointer;
          transition:all 0.18s;white-space:nowrap;display:flex;align-items:center;gap:5px;
        }
        .fchip.active {
          background:rgba(123,97,255,0.12);color:var(--rf-accent,#7b61ff);
          border-color:rgba(123,97,255,0.28);
        }
        .fchip-dot { width:7px;height:7px;border-radius:50%;flex-shrink:0; }

        /* NEXT 48H BANNER */
        .next48-banner {
          background:var(--rf-bg-surface);border-bottom:1px solid var(--rf-border-subtle);
          padding:12px 20px;flex-shrink:0;
        }
        .next48-title {
          font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
          color:var(--rf-text-muted);margin-bottom:8px;display:flex;align-items:center;gap:6px;
        }
        .next48-scroll {
          display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;
        }
        .next48-scroll::-webkit-scrollbar { display:none; }
        .next48-card {
          flex-shrink:0;width:172px;
          background:var(--rf-bg-elevated);border:1px solid var(--rf-border-default);
          border-radius:14px;padding:11px 12px;cursor:pointer;transition:all 0.18s;
          position:relative;overflow:hidden;
        }
        .next48-card:hover { border-color:var(--rf-border-strong);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.12); }
        .next48-card::before { content:'';position:absolute;top:0;left:0;right:0;height:3px; }
        .next48-card.live { background:rgba(123,97,255,0.06);border-color:rgba(123,97,255,0.25); }
        .next48-time {
          font-family:var(--font-mono,'DM Mono',monospace);font-size:10px;
          color:var(--rf-text-muted);margin-bottom:4px;display:flex;align-items:center;gap:4px;
        }
        .next48-name { font-size:12px;font-weight:600;color:var(--rf-text-primary);line-height:1.3;margin-bottom:4px; }
        .next48-meta { font-size:10px;color:var(--rf-text-secondary); }
        .live-dot {
          width:6px;height:6px;border-radius:50%;background:#22c55e;
          animation:livePulse 1.4s infinite;display:inline-block;flex-shrink:0;
        }
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}

        /* MISSED BANNER */
        .missed-banner {
          background:rgba(239,68,68,0.06);border-bottom:1px solid rgba(239,68,68,0.18);
          padding:9px 20px;display:flex;align-items:center;gap:8px;flex-shrink:0;
          cursor:pointer;transition:background 0.18s;
        }
        .missed-banner:hover { background:rgba(239,68,68,0.10); }

        /* CONTENT AREA */
        .cal-content { flex:1;overflow-y:auto;padding:16px 20px 24px; }

        /* ─── MONTHLY VIEW ─── */
        .month-grid-hd {
          display:grid;grid-template-columns:repeat(7,1fr);gap:1px;
          background:var(--rf-border-subtle);border-radius:12px 12px 0 0;overflow:hidden;margin-bottom:1px;
        }
        .month-day-hd {
          background:var(--rf-bg-surface);padding:7px 0;text-align:center;
          font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--rf-text-muted);
        }
        .month-grid {
          display:grid;grid-template-columns:repeat(7,1fr);gap:1px;
          background:var(--rf-border-subtle);border-radius:0 0 12px 12px;overflow:hidden;
        }
        .month-cell {
          background:var(--rf-bg-surface);min-height:90px;padding:8px;
          cursor:pointer;transition:background 0.15s;
        }
        .month-cell:hover { background:var(--rf-bg-hover); }
        .month-cell.is-today { background:rgba(123,97,255,0.05); }
        .month-cell.other-month { opacity:0.5; }
        .mc-date-num {
          font-size:12px;font-weight:600;color:var(--rf-text-secondary);
          width:22px;height:22px;display:flex;align-items:center;justify-content:center;
          border-radius:50%;margin-bottom:5px;
        }
        .mc-date-num.today-circle { background:var(--rf-accent,#7b61ff);color:#fff;font-weight:700; }
        .mc-event {
          border-radius:4px;padding:2px 5px;margin-bottom:2px;
          font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          cursor:pointer;transition:opacity 0.15s;
        }
        .mc-event:hover { opacity:0.8; }
        .mc-more { font-size:10px;color:var(--rf-text-muted);font-weight:500;padding:1px 3px;cursor:pointer; }

        /* ─── WEEKLY VIEW ─── */
        .week-grid {
          border-radius:12px;overflow:hidden;border:1px solid var(--rf-border-subtle);
        }
        .week-header {
          display:grid;grid-template-columns:52px repeat(7,1fr);
          background:var(--rf-bg-surface);border-bottom:1px solid var(--rf-border-subtle);
        }
        .week-hd-empty { border-right:1px solid var(--rf-border-subtle); }
        .week-day-hd {
          padding:10px 8px;text-align:center;
          border-right:1px solid var(--rf-border-subtle);
        }
        .week-day-hd:last-child { border-right:none; }
        .wdh-name {
          font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.07em;color:var(--rf-text-muted);
        }
        .wdh-num {
          font-size:18px;font-weight:800;color:var(--rf-text-secondary);
          font-family:var(--font-display,'Plus Jakarta Sans',system-ui,sans-serif);margin-top:2px;
        }
        .wdh-num.today-num { color:var(--rf-accent,#7b61ff); }
        .week-body { display:flex;flex-direction:column; }
        .week-row {
          display:grid;grid-template-columns:52px repeat(7,1fr);
          border-bottom:1px solid var(--rf-border-subtle);min-height:52px;
        }
        .week-row:last-child { border-bottom:none; }
        .week-time {
          padding:8px 6px;font-family:var(--font-mono,'DM Mono',monospace);
          font-size:10px;color:var(--rf-text-muted);text-align:right;
          border-right:1px solid var(--rf-border-subtle);
          background:var(--rf-bg-surface);display:flex;align-items:flex-start;
          justify-content:flex-end;
        }
        .week-slot {
          border-right:1px solid var(--rf-border-subtle);padding:4px;
          background:var(--rf-bg-base);transition:background 0.15s;
        }
        .week-slot:hover { background:var(--rf-bg-hover); }
        .week-slot:last-child { border-right:none; }
        .week-slot.today-col { background:rgba(123,97,255,0.04); }
        .week-event {
          border-radius:6px;padding:4px 7px;margin-bottom:2px;
          cursor:pointer;transition:all 0.15s;position:relative;
        }
        .week-event:hover { filter:brightness(1.1);transform:translateX(1px); }
        .we-time { font-size:9px;margin-bottom:1px;opacity:0.8;font-family:var(--font-mono,'DM Mono',monospace); }
        .we-name { font-size:11px;font-weight:600;line-height:1.2; }
        .we-freq { font-size:9px;opacity:0.7;margin-top:1px; }
        .conflict-badge {
          position:absolute;top:3px;right:3px;width:14px;height:14px;border-radius:50%;
          background:#ef4444;display:grid;place-items:center;font-size:8px;color:#fff;font-weight:700;
        }

        /* ─── DAILY VIEW ─── */
        .day-view { border-radius:12px;overflow:hidden;border:1px solid var(--rf-border-subtle); }
        .day-header {
          background:var(--rf-bg-surface);border-bottom:1px solid var(--rf-border-subtle);
          padding:14px 20px;display:flex;align-items:center;justify-content:space-between;
        }
        .day-title-big {
          font-family:var(--font-display,'Plus Jakarta Sans',system-ui,sans-serif);
          font-size:18px;font-weight:800;color:var(--rf-text-primary);
        }
        .day-subtitle { font-size:12px;color:var(--rf-text-secondary);margin-top:2px; }
        .day-slot {
          display:flex;gap:14px;padding:10px 16px;
          border-bottom:1px solid var(--rf-border-subtle);min-height:48px;
          background:var(--rf-bg-base);
        }
        .day-slot.now-row { background:rgba(123,97,255,0.04); }
        .day-slot:last-child { border-bottom:none; }
        .day-time {
          font-family:var(--font-mono,'DM Mono',monospace);font-size:11px;
          color:var(--rf-text-muted);min-width:40px;padding-top:3px;flex-shrink:0;
        }
        .day-slot.now-row .day-time { color:var(--rf-accent,#7b61ff);font-weight:500; }
        .day-events { flex:1;display:flex;flex-direction:column;gap:6px; }
        .day-event {
          background:var(--rf-bg-surface);border:1px solid var(--rf-border-default);
          border-radius:10px;padding:10px 12px;cursor:pointer;transition:all 0.18s;
          position:relative;overflow:hidden;
        }
        .day-event:hover {
          border-color:var(--rf-border-strong);
          transform:translateX(2px);box-shadow:0 2px 8px rgba(0,0,0,0.08);
        }
        .day-event::before {
          content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
        }
        .day-event-name { font-size:13px;font-weight:600;color:var(--rf-text-primary); }
        .day-event-meta {
          font-size:11px;color:var(--rf-text-secondary);
          display:flex;align-items:center;gap:10px;margin-top:3px;
        }
        .day-event-badges { display:flex;gap:4px;margin-top:6px;align-items:center; }
        .cal-badge {
          display:inline-flex;align-items:center;gap:4px;
          font-size:10px;font-weight:600;padding:2px 7px;border-radius:9999px;
        }
        .day-event-avatars { display:flex;margin-top:6px; }
        .d-avatar {
          width:18px;height:18px;border-radius:50%;border:2px solid var(--rf-bg-surface);
          display:grid;place-items:center;font-size:7px;font-weight:700;color:#fff;margin-right:-4px;
        }
        .now-indicator {
          display:flex;align-items:center;gap:8px;padding:5px 16px;
          background:linear-gradient(90deg,rgba(123,97,255,0.08),transparent);
          border-left:3px solid var(--rf-accent,#7b61ff);
        }
        .now-line { flex:1;height:1px;background:var(--rf-accent,#7b61ff);opacity:0.3; }
        .now-label {
          font-family:var(--font-mono,'DM Mono',monospace);
          font-size:10px;color:var(--rf-accent,#7b61ff);font-weight:500;
        }
        .empty-slot { font-size:11px;color:var(--rf-text-muted);padding:4px 0;font-style:italic; }

        /* ─── LEGEND ─── */
        .cal-legend {
          display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;padding:10px 12px;
          background:var(--rf-bg-surface);border:1px solid var(--rf-border-subtle);
          border-radius:10px;
        }
        .legend-item { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--rf-text-secondary); }
        .legend-swatch { width:10px;height:10px;border-radius:3px; }

        /* ─── MODAL ─── */
        .cal-modal-overlay {
          position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:600;
          display:flex;align-items:flex-end;justify-content:center;
          padding:0 16px;backdrop-filter:blur(4px);
        }
        .cal-modal-sheet {
          background:var(--rf-bg-surface);border:1px solid var(--rf-border-strong);
          border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:88vh;
          overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,0.3);
          scrollbar-width:thin;scrollbar-color:var(--rf-border-strong) transparent;
        }
        .cal-modal-handle {
          width:36px;height:4px;background:var(--rf-border-strong);
          border-radius:2px;margin:12px auto 0;
        }
        .cal-modal-area-bar { height:3px;margin:10px 20px 0;border-radius:9999px; }
        .cal-modal-topbar {
          padding:14px 20px 12px;display:flex;align-items:flex-start;
          justify-content:space-between;border-bottom:1px solid var(--rf-border-subtle);
        }
        .cal-modal-close {
          width:28px;height:28px;border-radius:8px;
          background:var(--rf-bg-elevated);border:1px solid var(--rf-border-subtle);
          display:grid;place-items:center;cursor:pointer;color:var(--rf-text-muted);flex-shrink:0;
          transition:all 0.18s;
        }
        .cal-modal-close:hover { background:var(--rf-bg-hover);color:var(--rf-text-primary); }
        .cal-modal-title {
          font-family:var(--font-display,'Plus Jakarta Sans',system-ui,sans-serif);
          font-size:17px;font-weight:700;color:var(--rf-text-primary);margin-bottom:4px;
        }
        .cal-modal-area-tag {
          font-size:11px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.06em;color:var(--rf-text-muted);display:flex;align-items:center;gap:5px;
        }
        .cal-modal-body { padding:14px 20px;display:flex;flex-direction:column;gap:10px; }
        .cal-modal-meta-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .mmi {
          background:var(--rf-bg-elevated);border:1px solid var(--rf-border-subtle);
          border-radius:10px;padding:10px 12px;
        }
        .mmi-label {
          font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.07em;color:var(--rf-text-muted);margin-bottom:5px;
        }
        .mmi-value {
          font-size:13px;font-weight:600;color:var(--rf-text-primary);
          display:flex;align-items:center;gap:5px;
        }
        .cal-modal-section { background:var(--rf-bg-elevated);border:1px solid var(--rf-border-subtle);border-radius:10px;padding:10px 12px; }
        .cal-modal-section-title {
          font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.07em;color:var(--rf-text-muted);margin-bottom:8px;
        }
        .cal-modal-footer {
          padding:12px 20px;border-top:1px solid var(--rf-border-subtle);
          display:flex;gap:8px;background:var(--rf-bg-surface);
          position:sticky;bottom:0;
        }
        .cal-modal-btn-primary {
          flex:1;padding:11px;background:var(--rf-accent,#7b61ff);color:#fff;border:none;
          border-radius:10px;font-family:var(--font-body,'DM Sans',sans-serif);
          font-size:13px;font-weight:600;cursor:pointer;
          box-shadow:0 2px 8px rgba(123,97,255,0.3);transition:all 0.18s;
        }
        .cal-modal-btn-primary:hover { background:var(--rf-accent-hover,#9178ff); }
        .cal-modal-btn-ghost {
          padding:11px 16px;background:transparent;color:var(--rf-text-secondary);
          border:1px solid var(--rf-border-default);border-radius:10px;
          font-family:var(--font-body,'DM Sans',sans-serif);font-size:13px;
          font-weight:500;cursor:pointer;transition:all 0.18s;
        }
        .cal-modal-btn-ghost:hover { border-color:var(--rf-border-strong);color:var(--rf-text-primary); }

        /* LIVE MODAL */
        .live-kpi-table { width:100%;border-collapse:collapse; }
        .live-kpi-table th {
          text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.06em;color:var(--rf-text-muted);padding:0 6px 6px;
        }
        .live-kpi-table td { font-size:12px;padding:5px 6px;color:var(--rf-text-primary); }
        .live-kpi-table tr:not(:last-child) td { border-bottom:1px solid var(--rf-border-subtle); }
        .live-participant-grid { display:flex;gap:10px;flex-wrap:wrap; }
        .live-participant {
          display:flex;align-items:center;gap:6px;font-size:11px;
        }
        .live-p-avatar {
          width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
          font-size:9px;font-weight:700;color:#fff;flex-shrink:0;
        }
        .live-hist-item {
          display:flex;align-items:center;justify-content:space-between;
          padding:6px 0;border-bottom:1px solid var(--rf-border-subtle);font-size:12px;
        }
        .live-hist-item:last-child { border-bottom:none; }

        /* MISSED VIEW */
        .missed-alert {
          background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
          border-radius:12px;padding:14px 16px;display:flex;gap:10px;margin-bottom:12px;
        }
        .missed-list-item {
          background:var(--rf-bg-surface);border:1px solid var(--rf-border-default);
          border-radius:12px;overflow:hidden;margin-bottom:8px;
        }
        .missed-item-inner {
          padding:14px 16px;display:flex;align-items:flex-start;justify-content:space-between;
          gap:12px;cursor:pointer;transition:background 0.15s;
        }
        .missed-item-inner:hover { background:var(--rf-bg-hover); }
        .missed-item-left { display:flex;gap:10px;flex:1; }
        .missed-item-bar { width:3px;border-radius:2px;flex-shrink:0;align-self:stretch; }
        .missed-impact {
          margin-top:8px;padding:8px 10px;
          background:var(--rf-bg-elevated);border-radius:8px;
          font-size:11px;color:var(--rf-text-secondary);
        }
      `}</style>

      <div className="cal-page">
        {/* TOPBAR */}
        <div className="cal-topbar">
          <div className="cal-top-row">
            <div className="cal-title-group">
              <SidebarTrigger style={{
                width:34,height:34,borderRadius:8,
                border:"1px solid var(--rf-border-default)",
                background:"var(--rf-bg-elevated)",cursor:"pointer",
                color:"var(--rf-text-secondary)",display:"grid",placeItems:"center",
                flexShrink:0,
              }}/>
              <div className="cal-page-title">
                {view==="missed"?"Não Realizadas":"Calendário"}
              </div>
              {view!=="missed" && (
                <div className="cal-nav">
                  <div className="cal-nav-btn" onClick={handlePrev}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </div>
                  <div className="cal-period">{viewLabel}</div>
                  <div className="cal-nav-btn" onClick={handleNext}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div className="cal-today-btn" onClick={()=>setCursorDate(new Date())}>Hoje</div>
                </div>
              )}
              {view==="missed" && (
                <div style={{fontSize:12,color:"var(--rf-text-secondary)"}}>
                  {missedEvents.length} reuniões perdidas nos últimos 30 dias
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {view==="missed" ? (
                <button className="cal-btn-ghost" onClick={()=>setView("month")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  Voltar ao calendário
                </button>
              ) : (
                <>
                  <div className="view-tabs">
                    {(["month","week","day"] as const).map(v=>(
                      <div key={v} className={`view-tab${view===v?" active":""}`} onClick={()=>setView(v)}>
                        {v==="month"?"Mensal":v==="week"?"Semanal":"Diário"}
                      </div>
                    ))}
                  </div>
                  <Link href="/cockpit/rituais/novo">
                    <button className="cal-btn-primary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Novo Ritual
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {view!=="missed" && (
            <div className="cal-filter-row">
              {areaChips.map(chip=>(
                <div
                  key={chip.slug}
                  className={`fchip${areaFilter===chip.slug?" active":""}`}
                  onClick={()=>setAreaFilter(chip.slug)}
                >
                  <span className="fchip-dot" style={{background:chip.color}}/>
                  {chip.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NEXT 48H BANNER */}
        {view!=="missed" && next48h.length>0 && (
          <div className="next48-banner">
            <div className="next48-title">
              <span className="live-dot"/>
              Próximas 48 horas
            </div>
            <div className="next48-scroll">
              {next48h.map(e=>{
                const live = isLive(e,now)
                const color = calAreaColor(e.area)
                return (
                  <div
                    key={e.id}
                    className={`next48-card${live?" live":""}`}
                    style={{"--card-color":color} as React.CSSProperties}
                    onClick={()=>openEvent(e)}
                  >
                    <div className="next48-card" style={{position:"absolute",top:0,left:0,right:0,height:3,background:color,borderRadius:0}}/>
                    <div className="next48-time">
                      {live&&<span className="live-dot"/>}
                      {live?"AGORA":""}
                      {!live&&(e.date===iso(now)?"Hoje":"Amanhã")} · {e.time}
                    </div>
                    <div className="next48-name">{e.title}</div>
                    <div className="next48-meta">
                      {calAreaLabel(e.area)} · {calFreqLabel(e.frequency)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* MISSED BANNER */}
        {view!=="missed" && missedEvents.length>0 && (
          <div className="missed-banner" onClick={()=>setView("missed")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{fontSize:12,fontWeight:600,color:"#ef4444",flex:1}}>
              {missedEvents.length} reuniões não realizadas nos últimos 7 dias
            </span>
            <span style={{fontSize:12,color:"#ef4444",fontWeight:700}}>Ver todas →</span>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="cal-content">
          {loading ? (
            <div style={{padding:40,textAlign:"center",color:"var(--rf-text-muted)",fontSize:13}}>Carregando calendário…</div>
          ) : view==="month" ? (
            <MonthView grid={grid} monthStart={monthStart} eventsByDay={eventsByDay} cursorDate={cursorDate} now={now} onDayClick={d=>{setCursorDate(d);setView("day")}} onEventClick={openEvent}/>
          ) : view==="week" ? (
            <WeekView days={weekDays} eventsByDay={eventsByDay} cursorDate={cursorDate} now={now} onEventClick={openEvent}/>
          ) : view==="day" ? (
            <DayView date={cursorDate} events={eventsByDay.get(iso(cursorDate))??[]} now={now} onEventClick={openEvent}/>
          ) : (
            <MissedView events={missedEvents} onEventClick={openEvent}/>
          )}
        </div>
      </div>

      {/* MODAL — EVENTO AGENDADO */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={()=>setSelectedEvent(null)}/>
      )}

      {/* MODAL — RITUAL EM ANDAMENTO */}
      {liveEvent && (
        <LiveModal event={liveEvent} now={now} onClose={()=>setLiveEvent(null)}/>
      )}
    </>
  )
}

/* ─── MONTH VIEW ─── */
function MonthView({grid,monthStart,eventsByDay,cursorDate,now,onDayClick,onEventClick}: {
  grid:{days:Date[]}; monthStart:Date; eventsByDay:Map<string,CalendarEvent[]>
  cursorDate:Date; now:Date
  onDayClick:(d:Date)=>void; onEventClick:(e:CalendarEvent)=>void
}) {
  return (
    <div>
      <div className="month-grid-hd">
        {DAY_ABBR.map(d=><div key={d} className="month-day-hd">{d}</div>)}
      </div>
      <div className="month-grid">
        {grid.days.map(day=>{
          const dayIso = iso(day)
          const list = eventsByDay.get(dayIso)??[]
          const isCurMonth = day.getMonth()===monthStart.getMonth()
          const isToday = sameDay(day,now)
          return (
            <div
              key={dayIso}
              className={`month-cell${isToday?" is-today":""}${!isCurMonth?" other-month":""}`}
              onClick={()=>onDayClick(new Date(day.getFullYear(),day.getMonth(),day.getDate(),12,0,0))}
            >
              <div className={`mc-date-num${isToday?" today-circle":""}`}>{day.getDate()}</div>
              {list.slice(0,3).map(e=>{
                const c = calAreaColor(e.area)
                return (
                  <div key={e.id} className="mc-event"
                    style={{background:hexToRgba(c,0.18),color:c}}
                    onClick={ev=>{ev.stopPropagation();onEventClick(e)}}
                  >
                    {e.time} {e.title}
                  </div>
                )
              })}
              {list.length>3&&<div className="mc-more">+{list.length-3} mais</div>}
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div className="cal-legend">
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--rf-text-muted)",width:"100%",marginBottom:2}}>Legenda</div>
        {[
          {label:"Comercial",color:"rgba(123,97,255,0.2)"},
          {label:"Financeiro",color:"rgba(249,115,22,0.18)"},
          {label:"Operações",color:"rgba(0,212,255,0.15)"},
          {label:"Sócios",color:"rgba(245,158,11,0.18)"},
          {label:"RH/Tecnologia",color:"rgba(236,72,153,0.15)"},
          {label:"Marketing",color:"rgba(16,185,129,0.15)"},
          {label:"Não realizado",color:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.22)"},
        ].map(item=>(
          <div key={item.label} className="legend-item">
            <span className="legend-swatch" style={{background:item.color,border:item.border||"none"}}/>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── WEEK VIEW ─── */
function WeekView({days,eventsByDay,cursorDate,now,onEventClick}: {
  days:Date[]; eventsByDay:Map<string,CalendarEvent[]>; cursorDate:Date; now:Date
  onEventClick:(e:CalendarEvent)=>void
}) {
  // Collect all time slots that have events
  const allTimes = useMemo(()=>{
    const times = new Set<string>()
    days.forEach(d=>{
      const list = eventsByDay.get(iso(d))??[]
      list.forEach(e=>{ const h=e.time.slice(0,2)+":00"; times.add(h) })
    })
    if(times.size===0) WEEK_TIMES.slice(0,5).forEach(t=>times.add(t))
    return [...times].sort()
  },[days,eventsByDay])

  return (
    <div className="week-grid">
      <div className="week-header">
        <div className="week-hd-empty"/>
        {days.map((day,i)=>{
          const isToday=sameDay(day,now)
          return (
            <div key={i} className="week-day-hd">
              <div className="wdh-name">{DAY_ABBR[i]}</div>
              <div className={`wdh-num${isToday?" today-num":""}`}>{day.getDate()}</div>
            </div>
          )
        })}
      </div>
      <div className="week-body">
        {allTimes.map(slot=>(
          <div key={slot} className="week-row">
            <div className="week-time">{slot}</div>
            {days.map((day,i)=>{
              const isToday=sameDay(day,now)
              const list = (eventsByDay.get(iso(day))??[]).filter(e=>e.time.slice(0,2)===slot.slice(0,2))
              return (
                <div key={i} className={`week-slot${isToday?" today-col":""}`}>
                  {list.map(e=>{
                    const c=calAreaColor(e.area)
                    const live=isLive(e,now)
                    return (
                      <div key={e.id} className="week-event"
                        style={{background:hexToRgba(c,0.18),color:c}}
                        onClick={()=>onEventClick(e)}
                      >
                        <div className="we-time">{live&&<span className="live-dot" style={{marginRight:3}}/>}{e.time}</div>
                        <div className="we-name">{e.title}</div>
                        <div className="we-freq">{calFreqLabel(e.frequency)}</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── DAY VIEW ─── */
const TIMELINE_HOURS = [8,9,10,11,12,13,14,15,16,17,18]

function DayView({date,events,now,onEventClick}: {
  date:Date; events:CalendarEvent[]; now:Date; onEventClick:(e:CalendarEvent)=>void
}) {
  const dateLabel = capitalize(date.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}))
  const liveCount = events.filter(e=>isLive(e,now)).length
  const nowH = now.getHours()
  const isToday = sameDay(date,now)

  return (
    <div className="day-view">
      <div className="day-header">
        <div>
          <div className="day-title-big">{dateLabel}</div>
          <div className="day-subtitle">
            {events.length===0?"Nenhum ritual agendado"
              :`${events.length} ritual${events.length!==1?"is":""} agendado${events.length!==1?"s":""}${liveCount>0?` · ${liveCount} em andamento agora`:""}`}
          </div>
        </div>
        {isToday&&(
          <span style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:"#22c55e",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.22)",padding:"5px 10px",borderRadius:9999}}>
            <span className="live-dot"/>Hoje
          </span>
        )}
      </div>
      <div>
        {TIMELINE_HOURS.map(h=>{
          const hStr = String(h).padStart(2,"0")+":00"
          const eventsHere = events.filter(e=>parseInt(e.time.split(":")[0],10)===h)
          const isNowH = isToday&&nowH===h

          return (
            <div key={h}>
              {isNowH&&(
                <div className="now-indicator">
                  <div className="now-label">AGORA · {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}</div>
                  <div className="now-line"/>
                </div>
              )}
              <div className={`day-slot${isNowH?" now-row":""}`}>
                <div className="day-time">{hStr}</div>
                <div className="day-events">
                  {eventsHere.length===0
                    ? <div className="empty-slot">Nenhum ritual</div>
                    : eventsHere.map(e=>{
                        const c=calAreaColor(e.area)
                        const live=isLive(e,now)
                        const freq = calFreqLabel(e.frequency)
                        const freqColor = freq==="Daily"?"rgba(123,97,255,0.12)":freq==="Semanal"?"rgba(0,212,255,0.08)":freq==="Quinzenal"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)"
                        const freqTextColor = freq==="Daily"?"#7b61ff":freq==="Semanal"?"#00d4ff":freq==="Quinzenal"?"#f59e0b":"#22c55e"
                        return (
                          <div key={e.id} className="day-event" style={{"--event-color":c} as React.CSSProperties} onClick={()=>onEventClick(e)}>
                            <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:c,borderRadius:0}}/>
                            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:3}}>
                              <div className="day-event-name">{e.title}</div>
                              <div style={{display:"flex",gap:4,flexShrink:0}}>
                                <span className="cal-badge" style={{background:freqColor,color:freqTextColor}}>{freq}</span>
                                {live&&<span className="cal-badge" style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.22)",color:"#22c55e"}}><span className="live-dot"/>Ao vivo</span>}
                              </div>
                            </div>
                            <div className="day-event-meta">
                              <span>{e.time} · {calFreqLabel(e.frequency)}</span>
                              {e.ownerName&&<span>Resp: {e.ownerName}</span>}
                            </div>
                          </div>
                        )
                      })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── MISSED VIEW ─── */
function MissedView({events,onEventClick}: {events:CalendarEvent[];onEventClick:(e:CalendarEvent)=>void}) {
  if(events.length===0) return (
    <div style={{textAlign:"center",padding:"48px 24px",color:"var(--rf-text-muted)",fontSize:13}}>
      Nenhuma reunião não realizada no período.
    </div>
  )
  return (
    <div>
      <div className="missed-alert">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#ef4444",marginBottom:3}}>Atenção: {events.length} rituais não foram realizados</div>
          <div style={{fontSize:12,color:"var(--rf-text-secondary)",lineHeight:1.5}}>Reuniões não realizadas impactam o acompanhamento de KPIs e o engajamento da equipe. Considere remarcar ou justificar as ausências.</div>
        </div>
      </div>
      <div>
        {events.map(e=>{
          const c=calAreaColor(e.area)
          const freq=calFreqLabel(e.frequency)
          const freqBg = freq==="Daily"?"rgba(123,97,255,0.12)":freq==="Semanal"?"rgba(0,212,255,0.08)":freq==="Quinzenal"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)"
          const freqC = freq==="Daily"?"#7b61ff":freq==="Semanal"?"#00d4ff":freq==="Quinzenal"?"#f59e0b":"#22c55e"
          return (
            <div key={e.id} className="missed-list-item">
              <div className="missed-item-inner" onClick={()=>onEventClick(e)}>
                <div className="missed-item-left">
                  <div className="missed-item-bar" style={{background:c}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--rf-text-muted)"}}>
                        {calAreaLabel(e.area)}
                      </span>
                      <span className="cal-badge" style={{background:freqBg,color:freqC}}>{freq}</span>
                      <span className="cal-badge" style={{background:"rgba(239,68,68,0.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.2)"}}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Não realizado
                      </span>
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:"var(--rf-text-primary)",marginBottom:6}}>{e.title}</div>
                    <div style={{display:"flex",alignItems:"center",gap:14,fontSize:12,color:"var(--rf-text-secondary)"}}>
                      <span style={{display:"flex",alignItems:"center",gap:4}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {e.date.split("-").reverse().join("/")}
                      </span>
                      <span style={{display:"flex",alignItems:"center",gap:4}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {e.time}
                      </span>
                      {e.ownerName&&(
                        <span style={{display:"flex",alignItems:"center",gap:4}}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Resp: {e.ownerName}
                        </span>
                      )}
                    </div>
                    <div className="missed-impact">
                      <strong style={{color:"var(--rf-text-primary)"}}>Impacto:</strong> KPIs vinculados não foram atualizados nesta sessão.
                    </div>
                  </div>
                </div>
                <button className="cal-btn-ghost" style={{flexShrink:0}} onClick={ev=>{ev.stopPropagation()}}>
                  Remarcar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── EVENT MODAL (agendamento regular) ─── */
function EventModal({event,onClose}: {event:CalendarEvent;onClose:()=>void}) {
  const c = calAreaColor(event.area)
  const freq = calFreqLabel(event.frequency)
  const freqBg = freq==="Daily"?"rgba(123,97,255,0.12)":freq==="Semanal"?"rgba(0,212,255,0.08)":freq==="Quinzenal"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)"
  const freqTxt = freq==="Daily"?"#7b61ff":freq==="Semanal"?"#00d4ff":freq==="Quinzenal"?"#f59e0b":"#22c55e"

  return (
    <div className="cal-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="cal-modal-sheet">
        <div className="cal-modal-handle"/>
        <div className="cal-modal-area-bar" style={{background:c}}/>
        <div className="cal-modal-topbar">
          <div>
            <div className="cal-modal-area-tag">
              <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>
              {calAreaLabel(event.area).toUpperCase()} · {freq}
            </div>
            <div className="cal-modal-title">{event.title}</div>
          </div>
          <div className="cal-modal-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>
        <div className="cal-modal-body">
          <div className="cal-modal-meta-grid">
            <div className="mmi">
              <div className="mmi-label">Data &amp; Hora</div>
              <div className="mmi-value">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {event.date.split("-").reverse().slice(0,2).join("/")} · {event.time}
              </div>
            </div>
            <div className="mmi">
              <div className="mmi-label">Frequência</div>
              <div className="mmi-value">
                <span className="cal-badge" style={{background:freqBg,color:freqTxt}}>{freq}</span>
              </div>
            </div>
            {event.ownerName&&(
              <div className="mmi">
                <div className="mmi-label">Responsável</div>
                <div className="mmi-value">
                  <div style={{width:20,height:20,borderRadius:"50%",background:`linear-gradient(135deg,${c},#5b3ff0)`,display:"grid",placeItems:"center",fontSize:8,fontWeight:700,color:"#fff"}}>
                    {event.ownerName.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  {event.ownerName}
                </div>
              </div>
            )}
            <div className="mmi">
              <div className="mmi-label">Área</div>
              <div className="mmi-value">
                <span style={{background:hexToRgba(c,0.12),color:c,padding:"2px 8px",borderRadius:9999,fontSize:12,fontWeight:600}}>
                  {calAreaLabel(event.area)}
                </span>
              </div>
            </div>
          </div>

          <div className="cal-modal-section">
            <div className="cal-modal-section-title">Histórico recente</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {label:"Sessão anterior",status:"Realizado",ok:true},
                {label:"Penúltima sessão",status:"Realizado",ok:true},
              ].map((h,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:"var(--rf-text-secondary)"}}>{h.label}</span>
                  <span style={{color:h.ok?"#22c55e":"#ef4444",fontWeight:600}}>
                    {h.ok?(
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight:4,display:"inline"}}><polyline points="20 6 9 17 4 12"/></svg>
                    ):(
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight:4,display:"inline"}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cal-modal-footer">
          <button className="cal-modal-btn-ghost" onClick={onClose}>Fechar</button>
          {event.ritualId&&(
            <Link href={`/cockpit/rituais/${event.ritualId}`} style={{flex:1}}>
              <button className="cal-modal-btn-primary" style={{width:"100%"}}>
                Ir para o Ritual
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── LIVE MODAL (ritual em andamento) ─── */
function LiveModal({event,now,onClose}: {event:CalendarEvent;now:Date;onClose:()=>void}) {
  const c = calAreaColor(event.area)
  const freq = calFreqLabel(event.frequency)
  const startDt = parseLocalDT(event.date, event.time)
  const elapsedMin = Math.floor((now.getTime()-startDt.getTime())/60000)

  const AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#7b61ff,#00d4ff)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#f97316,#dc2626)",
    "linear-gradient(135deg,#ec4899,#9333ea)",
  ]
  function initials(name: string) {
    return name.trim().split(/\s+/).map((p:string)=>p[0]).join("").slice(0,2).toUpperCase()
  }

  return (
    <div className="cal-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="cal-modal-sheet">
        <div className="cal-modal-handle"/>
        <div className="cal-modal-topbar" style={{borderBottom:"none",paddingBottom:6}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{background:hexToRgba(c,0.12),color:c,padding:"2px 8px",borderRadius:9999,fontSize:11,fontWeight:600}}>
                {calAreaLabel(event.area)}
              </span>
              <span className="cal-badge" style={{background:"rgba(0,212,255,0.08)",color:"#00d4ff",fontSize:10}}>
                {freq}
              </span>
              <span className="cal-badge" style={{background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.22)",fontSize:10}}>
                <span className="live-dot"/>
                Ao vivo · {elapsedMin}min
              </span>
            </div>
            <div className="cal-modal-title">{event.title}</div>
          </div>
          <div className="cal-modal-close" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>

        <div className="cal-modal-body" style={{paddingTop:8}}>
          {/* Meta grid 3 cols */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div className="mmi">
              <div className="mmi-label">Horário</div>
              <div className="mmi-value" style={{fontSize:12}}>{event.time} – {
                (()=>{
                  const [h,m]=event.time.split(":").map(Number)
                  const end=new Date(0,0,0,h+1,m+30)
                  return `${String(end.getHours()).padStart(2,"0")}:${String(end.getMinutes()).padStart(2,"0")}`
                })()
              }</div>
            </div>
            <div className="mmi">
              <div className="mmi-label">Duração</div>
              <div className="mmi-value" style={{fontSize:12}}>1h 30min</div>
            </div>
            <div className="mmi">
              <div className="mmi-label">Responsável</div>
              <div className="mmi-value" style={{fontSize:11}}>
                {event.ownerName||"—"}
              </div>
            </div>
          </div>

          {/* KPIs desta sessão */}
          <div className="cal-modal-section">
            <div className="cal-modal-section-title">KPIs desta sessão</div>
            <table className="live-kpi-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Meta</th>
                  <th>Atual</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Receita Recorrente</td>
                  <td style={{color:"var(--rf-text-secondary)"}}>R$ 3M</td>
                  <td>R$ 2.4M</td>
                  <td>
                    <span style={{color:"#f59e0b",fontWeight:700}}>80%</span>
                    <span style={{display:"inline-block",width:32,height:4,background:"rgba(245,158,11,0.2)",borderRadius:2,marginLeft:6,verticalAlign:"middle"}}>
                      <span style={{display:"block",width:"80%",height:"100%",background:"#f59e0b",borderRadius:2}}/>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Novos Contratos</td>
                  <td style={{color:"var(--rf-text-secondary)"}}>12</td>
                  <td>14</td>
                  <td><span style={{color:"#22c55e",fontWeight:700}}>117%</span>
                    <span style={{display:"inline-block",width:32,height:4,background:"rgba(34,197,94,0.2)",borderRadius:2,marginLeft:6,verticalAlign:"middle"}}>
                      <span style={{display:"block",width:"100%",height:"100%",background:"#22c55e",borderRadius:2}}/>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Participantes */}
          <div className="cal-modal-section">
            <div className="cal-modal-section-title">Participantes</div>
            <div className="live-participant-grid">
              {(event.ownerName?[event.ownerName,"Marina Rocha","Luís Ferreira","Ana Costa"]:[]).slice(0,4).map((name,i)=>(
                <div key={i} className="live-participant">
                  <div className="live-p-avatar" style={{background:AVATAR_GRADIENTS[i%AVATAR_GRADIENTS.length]}}>
                    {initials(name)}
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--rf-text-primary)"}}>{name}</div>
                    <div style={{fontSize:10,color:"var(--rf-text-muted)"}}>
                      {i===0?"Responsável":i===3?"Ausente":"Presente"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico recente */}
          <div className="cal-modal-section">
            <div className="cal-modal-section-title">Histórico recente</div>
            {[
              {date:"08/04/2026",ok:true,presence:"4/4",kpis:3},
              {date:"01/04/2026",ok:true,presence:"3/4",kpis:3},
              {date:"25/03/2026",ok:false,presence:"0/4",kpis:0},
            ].map((h,i)=>(
              <div key={i} className="live-hist-item">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:3,height:32,background:h.ok?"#22c55e":"#ef4444",borderRadius:2,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:h.ok?"#22c55e":"#ef4444"}}>
                      {h.ok?(
                        <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight:3,display:"inline"}}><polyline points="20 6 9 17 4 12"/></svg>Realizado</>
                      ):(
                        <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight:3,display:"inline"}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Não realizado</>
                      )}
                    </div>
                    <div style={{fontSize:10,color:"var(--rf-text-muted)"}}>{h.date}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"var(--rf-text-secondary)",textAlign:"right"}}>
                  {h.ok&&<>Presença {h.presence} · {h.kpis} KPIs</>}
                  {!h.ok&&<span style={{color:"var(--rf-text-muted)"}}>0 KPIs atualizados</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cal-modal-footer">
          {event.ritualId&&(
            <Link href={`/cockpit/rituais/${event.ritualId}`}>
              <button className="cal-modal-btn-ghost">Ver detalhes completos</button>
            </Link>
          )}
          {event.ritualId&&(
            <Link href={`/cockpit/rituais/${event.ritualId}`} style={{flex:1}}>
              <button className="cal-modal-btn-primary" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                Entrar na Sessão
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
