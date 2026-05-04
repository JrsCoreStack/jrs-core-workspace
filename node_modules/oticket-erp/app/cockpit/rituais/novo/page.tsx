"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type FreqKey = "DAILY" | "SEMANAL" | "QUINZENAL" | "MENSAL" | "TRIMESTRAL"
type AreaKey = "COMERCIAL" | "ADM_FINANCEIRO" | "OPERACOES" | "RH" | "TECNOLOGIA" | "ESTRATEGICO"

interface GuiaItem { id: number; text: string }
interface KpiItem { id: string; label: string }
interface ParticipantChip { initials: string; name: string; color: string }

const AREA_OPTIONS: { value: AreaKey; label: string }[] = [
  { value: "COMERCIAL",     label: "Comercial" },
  { value: "ADM_FINANCEIRO", label: "Adm/Financeiro" },
  { value: "OPERACOES",     label: "Operações" },
  { value: "RH",            label: "RH" },
  { value: "TECNOLOGIA",    label: "Tecnologia" },
  { value: "ESTRATEGICO",   label: "Estratégico" },
]

const FREQ_OPTIONS: { value: FreqKey; label: string }[] = [
  { value: "DAILY",     label: "Daily" },
  { value: "SEMANAL",   label: "Semanal" },
  { value: "QUINZENAL", label: "Quinzenal" },
  { value: "MENSAL",    label: "Mensal" },
  { value: "TRIMESTRAL", label: "Trimestral" },
]

const DURATION_OPTIONS = ["15 min", "30 min", "45 min", "1 hora", "1h30", "2 horas"]
const WEEKDAY_OPTIONS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"]
const OWNER_OPTIONS = ["Evandro", "Vinicius", "Cairo", "Ricardo", "José Pedro", "João Arantes"]

const AVATAR_COLORS: { initials: string; name: string; color: string }[] = [
  { initials: "CS", name: "Carlos Silva",   color: "linear-gradient(135deg,#7b61ff,#5b3ff0)" },
  { initials: "LF", name: "Luís Ferreira",  color: "linear-gradient(135deg,#f97316,#dc2626)" },
  { initials: "MR", name: "Marina Rocha",   color: "linear-gradient(135deg,#22c55e,#16a34a)" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NovoRitualPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName]       = useState("")
  const [desc, setDesc]       = useState("")
  const [area, setArea]       = useState<AreaKey | "">("")
  const [owner, setOwner]     = useState("")
  const [freq, setFreq]       = useState<FreqKey>("DAILY")
  const [weekday, setWeekday] = useState("Segunda-feira")
  const [time, setTime]       = useState("09:30")
  const [duration, setDuration] = useState("45 min")
  const [participants, setParticipants] = useState<ParticipantChip[]>(AVATAR_COLORS.slice(0, 3))
  const [kpiOptions, setKpiOptions] = useState<KpiItem[]>([])
  const [selectedKpis, setSelectedKpis] = useState<KpiItem[]>([])
  const [guiaItems, setGuiaItems] = useState<GuiaItem[]>([
    { id: 1, text: "Revisão dos KPIs da semana" },
    { id: 2, text: "Impedimentos e bloqueios" },
    { id: 3, text: "Próximos passos" },
  ])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/kpis")
        const list = Array.isArray(data) ? data : data?.data ?? []
        const mapped: KpiItem[] = list.map((k: Record<string, unknown>) => ({
          id: String(k.id ?? ""),
          label: [k.code_ref ?? k.code, k.name].filter(Boolean).join(" — "),
        })).filter((k: KpiItem) => k.id && k.label)
        if (!cancelled) setKpiOptions(mapped)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])

  function removeParticipant(initials: string) {
    setParticipants((p) => p.filter((x) => x.initials !== initials))
  }

  function addGuiaItem() {
    const nextId = Math.max(0, ...guiaItems.map((g) => g.id)) + 1
    setGuiaItems((items) => [...items, { id: nextId, text: "" }])
  }

  function updateGuiaItem(id: number, text: string) {
    setGuiaItems((items) => items.map((g) => g.id === id ? { ...g, text } : g))
  }

  function removeKpi(id: string) {
    setSelectedKpis((k) => k.filter((x) => x.id !== id))
  }

  async function handleSave() {
    if (!name.trim()) { toast.error("Informe o nome do ritual."); return }
    if (!owner.trim()) { toast.error("Selecione o responsável."); return }
    setSaving(true)
    try {
      const schedule = `${weekday} · ${time}`
      const durationMin = parseInt(duration.replace(/\D/g, "")) || 60
      const res = await api.post("/cockpit/rituals", {
        name: name.trim(),
        description: desc.trim() || undefined,
        freq,
        area: area || "COMERCIAL",
        owner_name: owner.trim(),
        schedule,
        duration_min: durationMin,
        is_active: true,
        participants: participants.map((p) => ({ initials: p.initials, name: p.name })),
      })
      const ritualId = res?.data?.id
      if (ritualId && selectedKpis.length > 0) {
        await api.put(`/cockpit/rituals/${ritualId}/kpis`, { kpi_ids: selectedKpis.map((k) => k.id) })
      }
      toast.success("Ritual criado com sucesso!")
      router.push("/cockpit/rituais")
    } catch (err) {
      toastApiError(err, { fallback: "Erro ao criar ritual." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        /* ── Form page ── */
        .nrt-topbar {
          background: var(--rf-bg-surface, #fff);
          border-bottom: 1px solid var(--rf-border-subtle, rgba(0,0,0,0.05));
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .nrt-back-btn {
          width: 32px; height: 32px;
          border-radius: 12px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--rf-text-secondary);
          flex-shrink: 0;
          transition: all 0.18s ease;
        }
        .nrt-back-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
        .nrt-topbar-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px; font-weight: 600;
          color: var(--rf-text-primary);
          letter-spacing: -0.2px;
        }
        .nrt-topbar-sub { font-size: 12px; color: var(--rf-text-secondary); margin-top: 2px; }

        .nrt-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        .nrt-section {
          background: var(--rf-bg-surface, #fff);
          border: 1px solid var(--rf-border-default);
          border-radius: 16px;
          padding: 18px;
        }
        .nrt-section-title {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--rf-text-muted);
          margin-bottom: 14px;
        }
        .nrt-field { margin-bottom: 14px; }
        .nrt-field:last-child { margin-bottom: 0; }
        .nrt-label {
          display: block; font-size: 12px; font-weight: 600;
          color: var(--rf-text-secondary); margin-bottom: 6px;
        }
        .nrt-req { color: var(--rf-accent, #7b61ff); }
        .nrt-input {
          width: 100%;
          background: var(--rf-bg-elevated, #f8f9fb);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px;
          padding: 11px 14px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px;
          outline: none;
          transition: all 0.18s ease;
        }
        .nrt-input:focus {
          border-color: var(--rf-accent);
          box-shadow: 0 0 0 3px var(--rf-accent-soft, rgba(123,97,255,0.12));
        }
        .nrt-input::placeholder { color: var(--rf-text-muted); }
        .nrt-textarea { resize: none; min-height: 80px; line-height: 1.5; }
        .nrt-select {
          width: 100%;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px;
          padding: 11px 14px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
          transition: all 0.18s ease;
        }
        .nrt-select:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft); }
        .nrt-fields-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Tag selector */
        .nrt-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .nrt-tag {
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-secondary);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .nrt-tag.selected {
          background: var(--rf-accent-soft);
          color: var(--rf-accent, #7b61ff);
          border-color: var(--rf-accent-border, rgba(123,97,255,0.28));
        }

        /* Participants */
        .nrt-prow { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .nrt-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px 5px 5px;
          border-radius: 9999px;
          background: var(--rf-bg-overlay);
          border: 1px solid var(--rf-border-default);
          font-size: 12px;
          color: var(--rf-text-primary);
        }
        .nrt-chip-avatar {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .nrt-chip-remove {
          color: var(--rf-text-muted); cursor: pointer; padding: 1px; margin-left: 2px;
          transition: color 0.15s ease;
        }
        .nrt-chip-remove:hover { color: var(--rf-text-primary); }
        .nrt-add-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          border: 1px dashed var(--rf-border-strong);
          background: transparent;
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-muted);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .nrt-add-chip:hover { border-color: var(--rf-accent-border); color: var(--rf-accent); }

        /* KPI rows */
        .nrt-kpi-row {
          display: flex; align-items: center; gap: 8px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 8px;
        }
        .nrt-kpi-name { flex: 1; font-size: 13px; font-weight: 500; color: var(--rf-text-primary); }
        .nrt-kpi-remove { color: var(--rf-text-muted); cursor: pointer; transition: color 0.15s ease; }
        .nrt-kpi-remove:hover { color: var(--rf-danger, #ef4444); }

        /* Guia items */
        .nrt-guia-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .nrt-guia-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--rf-accent-soft);
          border: 1px solid var(--rf-accent-border, rgba(123,97,255,0.28));
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: var(--rf-accent);
          flex-shrink: 0; margin-top: 1px;
        }

        /* Footer */
        .nrt-footer {
          padding: 0 20px 20px;
          display: flex; gap: 10px;
        }
        .nrt-btn-primary {
          flex: 1; padding: 14px;
          background: var(--rf-accent, #7b61ff); color: #fff;
          border: none; border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(123,97,255,0.35);
          transition: all 0.18s ease;
        }
        .nrt-btn-primary:hover { background: var(--rf-accent-hover, #9178ff); }
        .nrt-btn-primary:active { transform: scale(0.98); }
        .nrt-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .nrt-btn-ghost {
          padding: 14px 20px;
          background: transparent;
          color: var(--rf-text-secondary);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .nrt-btn-ghost:hover { background: var(--rf-bg-hover); }
      `}</style>

      {/* Topbar */}
      <div className="nrt-topbar">
        <button className="nrt-back-btn" onClick={() => router.push("/cockpit/rituais")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <div className="nrt-topbar-title">Novo Ritual</div>
          <div className="nrt-topbar-sub">Configure e agende um ritual para sua equipe</div>
        </div>
      </div>

      {/* Body */}
      <div className="nrt-body">

        {/* Informações básicas */}
        <div className="nrt-section">
          <div className="nrt-section-title">Informações básicas</div>
          <div className="nrt-field">
            <label className="nrt-label">Nome do ritual <span className="nrt-req">*</span></label>
            <input
              className="nrt-input"
              type="text"
              placeholder="Ex: Daily Comercial, Revisão Semanal..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="nrt-field">
            <label className="nrt-label">Descrição</label>
            <textarea
              className={cn("nrt-input", "nrt-textarea")}
              placeholder="Descreva o objetivo deste ritual..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="nrt-fields-2">
            <div className="nrt-field">
              <label className="nrt-label">Área <span className="nrt-req">*</span></label>
              <select
                className="nrt-select"
                value={area}
                onChange={(e) => setArea(e.target.value as AreaKey)}
              >
                <option value="" disabled>Selecionar área</option>
                {AREA_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className="nrt-field">
              <label className="nrt-label">Responsável <span className="nrt-req">*</span></label>
              <select
                className="nrt-select"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="" disabled>Nome do responsável</option>
                {OWNER_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agendamento */}
        <div className="nrt-section">
          <div className="nrt-section-title">Agendamento</div>
          <div className="nrt-field">
            <label className="nrt-label">Frequência <span className="nrt-req">*</span></label>
            <div className="nrt-tags">
              {FREQ_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={cn("nrt-tag", freq === f.value && "selected")}
                  onClick={() => setFreq(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="nrt-fields-2">
            <div className="nrt-field">
              <label className="nrt-label">Dia da semana</label>
              <select className="nrt-select" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {WEEKDAY_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="nrt-field">
              <label className="nrt-label">Horário <span className="nrt-req">*</span></label>
              <input
                className="nrt-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="nrt-field">
            <label className="nrt-label">Duração estimada</label>
            <div className="nrt-tags">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={cn("nrt-tag", duration === d && "selected")}
                  onClick={() => setDuration(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="nrt-section">
          <div className="nrt-section-title">Participantes</div>
          <div className="nrt-field">
            <label className="nrt-label">Membros</label>
            <div className="nrt-prow">
              {participants.map((pt) => (
                <div key={pt.initials} className="nrt-chip">
                  <div className="nrt-chip-avatar" style={{ background: pt.color }}>{pt.initials}</div>
                  {pt.name}
                  <button
                    type="button"
                    className="nrt-chip-remove"
                    onClick={() => removeParticipant(pt.initials)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" className="nrt-add-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs vinculados */}
        <div className="nrt-section">
          <div className="nrt-section-title">KPIs vinculados</div>
          <div className="nrt-field">
            {selectedKpis.map((k) => (
              <div key={k.id} className="nrt-kpi-row">
                <div className="nrt-kpi-name">{k.label}</div>
                <button type="button" className="nrt-kpi-remove" onClick={() => removeKpi(k.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <select
              className="nrt-select"
              value=""
              onChange={(e) => {
                const kpi = kpiOptions.find((k) => k.id === e.target.value)
                if (kpi && !selectedKpis.find((k) => k.id === kpi.id)) {
                  setSelectedKpis((prev) => [...prev, kpi])
                }
              }}
            >
              <option value="">+ Vincular KPI...</option>
              {kpiOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guia de pauta */}
        <div className="nrt-section">
          <div className="nrt-section-title">Guia de pauta</div>
          <div className="nrt-field">
            {guiaItems.map((item, idx) => (
              <div key={item.id} className="nrt-guia-item">
                <div className="nrt-guia-num">{idx + 1}</div>
                <input
                  className="nrt-input"
                  type="text"
                  value={item.text}
                  onChange={(e) => updateGuiaItem(item.id, e.target.value)}
                  placeholder="Ponto de pauta..."
                  style={{ marginBottom: 0, padding: "6px 10px", fontSize: 13 }}
                />
              </div>
            ))}
            <button type="button" className="nrt-add-chip" style={{ marginTop: 4 }} onClick={addGuiaItem}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar item
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="nrt-footer">
        <button type="button" className="nrt-btn-ghost" onClick={() => router.push("/cockpit/rituais")}>
          Cancelar
        </button>
        <button
          type="button"
          className="nrt-btn-primary"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Criando..." : "Criar Ritual"}
        </button>
      </div>
    </>
  )
}
