"use client"

import { useCallback, useState } from "react"
import api from "@/utils/api"

/* ── Types ── */
export interface CockpitKpi {
  id: string
  name: string
  code: string
  area: string
  data_type: string
  unit: string
  frequency: string
  consolidation: string
  current: number
  goal: number
  month_goal: number
  annual_goal: number
  deviation_pct: number
  trend: "up" | "down" | "flat"
  status: "above" | "attention" | "critical" | "empty"
  owner_name: string
  show_in_cockpit: boolean
  stale_periods: number
  results?: { period_label: string; value: number; target: number | null }[]
  goal_versions?: { id: string; annual_goal: number; month_goal: number; changed_at: string; changed_by: string }[]
  ritual_ids?: string[]
}

export interface CockpitRitual {
  id: string
  name: string
  description?: string
  frequency: string
  area: string
  owner_name: string
  schedule: string
  start_time: string
  duration_minutes: number
  color: string
  is_active: boolean
  participants: { initials: string; color: string }[]
  tracked_count: number
  total_count: number
  next_date?: string
}

export interface CockpitActionPlan {
  id: string
  title: string
  area: string
  owner_name: string
  due_date: string
  priority: "high" | "medium" | "low"
  status: "planned" | "in_progress" | "blocked" | "delivered" | "archived"
  blocked_note?: string
  notes?: string
  ritual_id?: string
  meeting_id?: string
  history?: { action: string; at: string; by: string }[]
}

export interface CockpitMeeting {
  id: string
  ritual_id: string
  occurred_at: string
  state: "scheduled" | "in_progress" | "done" | "cancelled" | "not_tracked"
  ata_content?: string
  topics?: string[]
}

export interface CockpitNotification {
  id: string
  title: string
  message: string
  source: "action_plan" | "kpi" | "ritual" | "meeting" | "calendar" | "system"
  /** Alinhado ao CreateCockpitNotificationDTO / entidade no oticket-api-erp */
  severity: "critical" | "alert" | "info"
  is_read: boolean
  created_at: string
  link_url?: string | null
  link_label?: string | null
  metadata?: Record<string, unknown>
}

export interface CockpitCalendarException {
  id: string
  ritual_id: string
  original_date: string
  new_date?: string
  type: string
  reason?: string
}

/* ── Hook ── */
export function useCockpitService() {
  const [loading, setLoading] = useState(false)

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true)
    try { return await fn() }
    finally { setLoading(false) }
  }, [])

  /* ── KPIs ── */
  const listKpis = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitKpi[]>("/cockpit/kpis", { params })).data), [wrap])

  const getKpi = useCallback((id: string) =>
    wrap(async () => (await api.get<CockpitKpi>(`/cockpit/kpis/${id}`)).data), [wrap])

  const createKpi = useCallback((data: Record<string, unknown>) =>
    wrap(async () => (await api.post<CockpitKpi>("/cockpit/kpis", data)).data), [wrap])

  const updateKpi = useCallback((id: string, data: Record<string, unknown>) =>
    wrap(async () => (await api.put<CockpitKpi>(`/cockpit/kpis/${id}`, data)).data), [wrap])

  const addKpiResult = useCallback(
    (
      id: string,
      data: {
        period_label: string
        value: number
        target?: number | null
        period_start?: string | null
        evidence_url?: string | null
        evidence_note?: string | null
      }
    ) => wrap(async () => (await api.post(`/cockpit/kpis/${id}/results`, data)).data),
    [wrap]
  )

  const runKpiStaleCheck = useCallback(() =>
    wrap(async () =>
      (await api.post<{ scanned: number; staleUpdated: number; notificationsCreated: number }>("/cockpit/kpis/stale-check")).data), [wrap])

  /* ── Rituals ── */
  const listRituals = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitRitual[]>("/cockpit/rituals", { params })).data), [wrap])

  const getRitual = useCallback((id: string) =>
    wrap(async () => (await api.get<CockpitRitual>(`/cockpit/rituals/${id}`)).data), [wrap])

  const createRitual = useCallback((data: Record<string, unknown>) =>
    wrap(async () => (await api.post<CockpitRitual>("/cockpit/rituals", data)).data), [wrap])

  const updateRitual = useCallback((id: string, data: Record<string, unknown>) =>
    wrap(async () => (await api.put<CockpitRitual>(`/cockpit/rituals/${id}`, data)).data), [wrap])

  /* ── Action Plans ── */
  const listPlans = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitActionPlan[]>("/cockpit/action-plans", { params })).data), [wrap])

  const createPlan = useCallback((data: Record<string, unknown>) =>
    wrap(async () => (await api.post<CockpitActionPlan>("/cockpit/action-plans", data)).data), [wrap])

  const updatePlan = useCallback((id: string, data: Record<string, unknown>) =>
    wrap(async () => (await api.put<CockpitActionPlan>(`/cockpit/action-plans/${id}`, data)).data), [wrap])

  const deletePlan = useCallback((id: string) =>
    wrap(async () => (await api.delete(`/cockpit/action-plans/${id}`)).data), [wrap])

  /* ── Meetings ── */
  const listMeetings = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitMeeting[]>("/cockpit/meetings", { params })).data), [wrap])

  const createMeeting = useCallback((data: Record<string, unknown>) =>
    wrap(async () => (await api.post<CockpitMeeting>("/cockpit/meetings", data)).data), [wrap])

  const attachAta = useCallback((id: string, data: Record<string, unknown>) =>
    wrap(async () => (await api.post(`/cockpit/meetings/${id}/ata`, data)).data), [wrap])

  /* ── Notifications ── */
  const listNotifications = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitNotification[]>("/cockpit/notifications", { params })).data), [wrap])

  const markRead = useCallback((id: string) =>
    wrap(async () => (await api.patch(`/cockpit/notifications/${id}/read`)).data), [wrap])

  const markAllRead = useCallback(() =>
    wrap(async () => (await api.post("/cockpit/notifications/mark-all-read")).data), [wrap])

  /* ── Calendar Exceptions ── */
  const listExceptions = useCallback((params?: Record<string, string>) =>
    wrap(async () => (await api.get<CockpitCalendarException[]>("/cockpit/calendar/exceptions", { params })).data), [wrap])

  const createException = useCallback((data: Record<string, unknown>) =>
    wrap(async () => (await api.post<CockpitCalendarException>("/cockpit/calendar/exceptions", data)).data), [wrap])

  return {
    loading,
    // KPIs
    listKpis, getKpi, createKpi, updateKpi, addKpiResult, runKpiStaleCheck,
    // Rituals
    listRituals, getRitual, createRitual, updateRitual,
    // Action Plans
    listPlans, createPlan, updatePlan, deletePlan,
    // Meetings
    listMeetings, createMeeting, attachAta,
    // Notifications
    listNotifications, markRead, markAllRead,
    // Calendar
    listExceptions, createException,
  }
}
