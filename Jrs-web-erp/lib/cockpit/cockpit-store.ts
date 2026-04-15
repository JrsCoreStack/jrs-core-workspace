import { create } from "zustand"
import {
  mockActionPlans,
  mockKpis,
  mockMeetings,
  mockRituals,
  mockAreas,
  type MockActionPlan,
  type MockKpi,
  type MockMeeting,
  type MockRitual,
  type AreaSlug,
  type RitualType,
} from "./mock-data"

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

let nextId = 10_000

function inferKpiStatus(current: number, goal: number): MockKpi["status"] {
  if (goal === 0) return "empty"
  const dev = ((current - goal) / Math.abs(goal)) * 100
  if (dev >= 0) return "above"
  if (dev >= -15) return "attention"
  return "critical"
}

type AddRitualInput = {
  name: string
  description?: string
  type: RitualType
  areaSlug: AreaSlug
  ownerName: string
  dayLabel: string
  startTime: string
  nextDate: string
}

type AddKpiInput = {
  name: string
  area: AreaSlug
  unit: string
  goal: number
}

type AddActionPlanInput = {
  title: string
  area: AreaSlug
  ownerName: string
  dueDate: string
  priority: MockActionPlan["priority"]
  ritualId: number | null
  meetingId: number | null
}

type AddMeetingInput = {
  ritualId: number
  date: string
  minutes?: string
  topics?: string[]
}

export type CockpitState = {
  rituals: MockRitual[]
  kpis: MockKpi[]
  actionPlans: MockActionPlan[]
  meetings: MockMeeting[]
  addRitual: (input: AddRitualInput) => MockRitual
  addKpi: (input: AddKpiInput) => MockKpi
  addActionPlan: (input: AddActionPlanInput) => MockActionPlan
  updateActionPlanStatus: (id: number, status: MockActionPlan["status"]) => void
  updateActionPlan: (id: number, patch: Partial<Omit<MockActionPlan, "id">>) => void
  addMeeting: (input: AddMeetingInput) => MockMeeting
}

export const useCockpitStore = create<CockpitState>((set) => ({
  rituals: clone(mockRituals),
  kpis: clone(mockKpis),
  actionPlans: clone(mockActionPlans),
  meetings: clone(mockMeetings),

  addRitual: (input) => {
    const area = mockAreas.find((a) => a.slug === input.areaSlug)
    if (!area) throw new Error("Área inválida")
    const id = nextId++
    const ritual: MockRitual = {
      id,
      name: input.name.trim(),
      description: input.description?.trim(),
      area,
      type: input.type,
      ownerName: input.ownerName.trim(),
      dayLabel: input.dayLabel.trim(),
      startTime: input.startTime,
      nextDate: input.nextDate,
      active: true,
    }
    set((s) => ({ rituals: [...s.rituals, ritual] }))
    return ritual
  },

  addKpi: (input) => {
    const id = nextId++
    const current = Math.round(input.goal * 0.92 * 100) / 100
    const code = `K-${id % 1000}`
    const kpi: MockKpi = {
      id,
      code,
      name: input.name.trim(),
      area: input.area,
      unit: input.unit,
      goal: input.goal,
      current,
      trend: current >= input.goal ? "up" : "flat",
      status: inferKpiStatus(current, input.goal),
    }
    set((s) => ({ kpis: [...s.kpis, kpi] }))
    return kpi
  },

  addActionPlan: (input) => {
    const id = nextId++
    const plan: MockActionPlan = {
      id,
      title: input.title.trim(),
      area: input.area,
      ritualId: input.ritualId,
      meetingId: input.meetingId,
      ownerName: input.ownerName.trim(),
      dueDate: input.dueDate,
      priority: input.priority,
      status: "planned",
    }
    set((s) => ({ actionPlans: [...s.actionPlans, plan] }))
    return plan
  },

  updateActionPlanStatus: (id, status) => {
    set((s) => ({
      actionPlans: s.actionPlans.map((p) => (p.id === id ? { ...p, status } : p)),
    }))
  },

  updateActionPlan: (id, patch) => {
    set((s) => ({
      actionPlans: s.actionPlans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  },

  addMeeting: (input) => {
    const id = nextId++
    const meeting: MockMeeting = {
      id,
      ritualId: input.ritualId,
      date: input.date,
      status: "scheduled",
      minutes: input.minutes ?? "",
      topics: input.topics ?? [],
    }
    set((s) => ({ meetings: [...s.meetings, meeting] }))
    return meeting
  },
}))

export function useKpiById(id: number): MockKpi | undefined {
  return useCockpitStore((s) => s.kpis.find((k) => k.id === id))
}
