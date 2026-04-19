"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import api from "@/utils/api"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toastApiError } from "@/lib/cockpit/api-error"
import { buildCreateKpiBody } from "@/lib/cockpit/kpi-create-payload"
import { COCKPIT_AREAS, areaLabel } from "@/lib/cockpit/constants"
import { toast } from "sonner"
import { X } from "lucide-react"

type RitualOption = { id: string; name: string; area: string; schedule?: string }

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const VISIBILITY_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: "partners", label: "Somente Sócios" },
  { id: "sector", label: "Por Setor" },
  { id: "managers", label: "Gestores" },
]

const GOAL_DIRECTION_OPTIONS = [
  { id: "maximize", label: "Maximizar (quanto maior melhor)" },
  { id: "minimize", label: "Minimizar (quanto menor melhor)" },
  { id: "exact", label: "Atingir valor exato" },
]

const MANUAL_ENTRY_OPTIONS = [
  { id: "allowed", label: "Permitir registro manual" },
  { id: "ritual_only", label: "Apenas via ritual" },
]

function NovoKpiPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const isEditing = Boolean(editId)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rituals, setRituals] = useState<RitualOption[]>([])
  const [linkedRituals, setLinkedRituals] = useState<RitualOption[]>([])

  /* form fields */
  const [name, setName] = useState("")
  const [area, setArea] = useState("")
  const [description, setDescription] = useState("")
  const [kpiType, setKpiType] = useState("Monetário")
  const [unit, setUnit] = useState("R$")
  const [code, setCode] = useState("")
  const [visibility, setVisibility] = useState("all")
  const [annualGoal, setAnnualGoal] = useState("")
  const [goalDirection, setGoalDirection] = useState("maximize")
  const [manualEntry, setManualEntry] = useState("allowed")
  const [monthlyGoals, setMonthlyGoals] = useState<string[]>(Array(12).fill(""))

  /* load rituals for linking */
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/rituals", { params: { status: "active" } })
        const list = Array.isArray(data) ? data : data?.data ?? []
        setRituals(list.map((r: Record<string, unknown>) => ({
          id: String(r.id ?? ""),
          name: String(r.name ?? ""),
          area: String(r.area ?? ""),
          schedule: r.schedule_day ? `${r.schedule_day}, ${r.schedule_time ?? ""}` : undefined,
        })))
      } catch {
        setRituals([])
      }
    })()
  }, [])

  /* load existing KPI data for editing */
  useEffect(() => {
    if (!editId) return
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/cockpit/kpis/${editId}`)
        const raw = data as Record<string, unknown>
        setName(String(raw.name ?? ""))
        setArea(String(raw.area ?? ""))
        setDescription(String(raw.description ?? ""))
        setKpiType(String(raw.kpi_type ?? raw.data_type ?? "Monetário"))
        setUnit(String(raw.unit ?? "R$"))
        setCode(String(raw.code_ref ?? raw.code ?? ""))
        setVisibility(String(raw.visibility ?? "all"))
        setAnnualGoal(String(raw.annual_goal ?? ""))
        setManualEntry(raw.allow_manual_entry !== false ? "allowed" : "ritual_only")
        const linked = Array.isArray(raw.linked_rituals) ? raw.linked_rituals as RitualOption[] : []
        setLinkedRituals(linked)
      } catch (e) {
        toastApiError(e, { fallback: "Erro ao carregar KPI." })
      } finally {
        setLoading(false)
      }
    })()
  }, [editId])

  /* auto-update unit based on type */
  useEffect(() => {
    const unitMap: Record<string, string> = {
      "Monetário": "R$", "Percentual": "%", "Quantidade": "un", "Índice": "pts",
    }
    const suggested = unitMap[kpiType]
    if (suggested && !unit) setUnit(suggested)
  }, [kpiType]) // eslint-disable-line

  function addLinkedRitual(id: string) {
    const r = rituals.find((x) => x.id === id)
    if (!r || linkedRituals.find((x) => x.id === id)) return
    setLinkedRituals((prev) => [...prev, r])
  }

  function removeLinkedRitual(id: string) {
    setLinkedRituals((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleSave() {
    if (!name.trim()) { toast.error("Informe o nome do KPI."); return }
    if (!area.trim()) { toast.error("Selecione a área do KPI."); return }

    const annualGoalNum = Number(String(annualGoal).replace(",", ".").replace(/\./g, "").replace(",", ".")) || 0

    const body = buildCreateKpiBody({
      name: name.trim(),
      code: code.trim() || null,
      area,
      kpiType,
      unit,
      inputFrequency: "Mensal",
      aggregation: "Soma",
      monthGoal: annualGoalNum / 12,
      annualGoal: annualGoalNum,
      ownerName: "",
      isCockpit: false,
      ritualId: linkedRituals[0]?.id ?? null,
      criticalDeviationThresholdPct: 15,
      attentionDeviationThresholdPct: 5,
    })

    try {
      setSaving(true)
      if (isEditing && editId) {
        await api.put(`/cockpit/kpis/${editId}`, body)
        toast.success("KPI atualizado com sucesso.")
      } else {
        await api.post("/cockpit/kpis", body)
        toast.success("KPI criado com sucesso.")
      }
      router.push("/cockpit/kpis")
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao salvar KPI." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--rf-text-muted)", fontSize: 14 }}>
        Carregando KPI…
      </div>
    )
  }

  return (
    <>
      <style>{`
        .nkpi-field-input {
          width: 100%; background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          border-radius: var(--rf-radius-md); padding: 11px 14px; color: var(--rf-text-primary);
          font-family: var(--rf-font-body); font-size: 14px; outline: none;
          transition: all var(--rf-transition);
        }
        .nkpi-field-input:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft); }
        .nkpi-field-input::placeholder { color: var(--rf-text-muted); }
        .nkpi-field-select {
          width: 100%; background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          border-radius: var(--rf-radius-md); padding: 11px 14px; color: var(--rf-text-primary);
          font-family: var(--rf-font-body); font-size: 14px; outline: none; cursor: pointer;
          -webkit-appearance: none; transition: all var(--rf-transition);
        }
        .nkpi-field-select:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft); }
        .nkpi-tag-opt {
          padding: 6px 14px; border-radius: 9999px; border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated); font-size: 12px; font-weight: 600;
          color: var(--rf-text-secondary); cursor: pointer; transition: all var(--rf-transition);
        }
        .nkpi-tag-opt.selected {
          background: var(--rf-accent-soft); color: var(--rf-accent);
          border-color: var(--rf-accent-border);
        }
        .nkpi-month-input {
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          border-radius: var(--rf-radius-sm); padding: 8px 10px; color: var(--rf-text-primary);
          font-family: monospace; font-size: 12px; width: 100%; outline: none;
          transition: all var(--rf-transition);
        }
        .nkpi-month-input:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 2px var(--rf-accent-soft); }
        .nkpi-month-input::placeholder { color: var(--rf-text-muted); }
        .nkpi-section {
          background: var(--rf-bg-surface); border: 1px solid var(--rf-border-default);
          border-radius: var(--rf-radius-lg); padding: 18px;
        }
        .nkpi-section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--rf-text-muted); margin-bottom: 14px;
        }
        .nkpi-field-label {
          display: block; font-size: 12px; font-weight: 600;
          color: var(--rf-text-secondary); margin-bottom: 6px;
        }
        .nkpi-field-hint {
          font-size: 11px; color: var(--rf-text-muted); margin-top: 5px;
        }
        .nkpi-back-btn {
          width: 32px; height: 32px; border-radius: var(--rf-radius-md);
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          display: grid; place-items: center; cursor: pointer;
          color: var(--rf-text-secondary); flex-shrink: 0; transition: all var(--rf-transition);
        }
        .nkpi-back-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
        .nkpi-ritual-chip {
          display: flex; align-items: center; gap: 8px; padding: 8px 12px;
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          border-radius: var(--rf-radius-md); margin-bottom: 8px;
        }
        .nkpi-ritual-add {
          background: var(--rf-bg-elevated); border: 1px dashed var(--rf-border-strong);
          border-radius: var(--rf-radius-md); padding: 12px 14px;
          display: flex; align-items: center; gap: 8px; cursor: pointer;
          transition: all var(--rf-transition); color: var(--rf-text-muted);
          font-size: 13px; font-weight: 500; margin-top: 8px;
        }
        .nkpi-ritual-add:hover {
          border-color: var(--rf-accent-border); color: var(--rf-accent);
          background: var(--rf-accent-soft);
        }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        background: "var(--rf-bg-surface)", borderBottom: "1px solid var(--rf-border-subtle)",
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <SidebarTrigger />
        <button className="nkpi-back-btn" onClick={() => router.push("/cockpit/kpis")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <div style={{ fontFamily: "var(--rf-font-display)", fontSize: 17, fontWeight: 700, color: "var(--rf-text-primary)" }}>
            {isEditing ? "Editar Indicador (KPI)" : "Novo Indicador (KPI)"}
          </div>
          <div style={{ fontSize: 12, color: "var(--rf-text-secondary)", marginTop: 2 }}>
            Configure metas anuais, mensais e vincule a rituais
          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* IDENTIFICAÇÃO */}
        <div className="nkpi-section">
          <div className="nkpi-section-title">Identificação</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label className="nkpi-field-label">
                Nome do KPI <span style={{ color: "var(--rf-accent)" }}>*</span>
              </label>
              <input
                className="nkpi-field-input"
                type="text"
                placeholder="Ex: TPV R$, NPS, Churn Rate..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="nkpi-field-label">
                Área <span style={{ color: "var(--rf-accent)" }}>*</span>
              </label>
              <select
                className="nkpi-field-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="" disabled>Selecionar área</option>
                {COCKPIT_AREAS.map((a) => (
                  <option key={a.slug} value={a.slug}>{areaLabel(a.slug)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="nkpi-field-label">Descrição</label>
            <input
              className="nkpi-field-input"
              type="text"
              placeholder="Ex: Volume Total Processado em R$"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className="nkpi-field-label">
                Tipo <span style={{ color: "var(--rf-accent)" }}>*</span>
              </label>
              <select
                className="nkpi-field-select"
                value={kpiType}
                onChange={(e) => setKpiType(e.target.value)}
              >
                {["Monetário", "Percentual", "Quantidade", "Índice"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="nkpi-field-label">Unidade</label>
              <input
                className="nkpi-field-input"
                type="text"
                placeholder="R$, %, pts..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div>
              <label className="nkpi-field-label">Código</label>
              <input
                className="nkpi-field-input"
                type="text"
                placeholder="Ex: MV, NPS..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* VISIBILIDADE */}
        <div className="nkpi-section">
          <div className="nkpi-section-title">Visibilidade</div>
          <div>
            <label className="nkpi-field-label">
              Quem pode ver este KPI? <span style={{ color: "var(--rf-accent)" }}>*</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {VISIBILITY_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`nkpi-tag-opt${visibility === opt.id ? " selected" : ""}`}
                  onClick={() => setVisibility(opt.id)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
            <div className="nkpi-field-hint">Define quem terá acesso aos valores deste indicador.</div>
          </div>
        </div>

        {/* META ANUAL */}
        <div className="nkpi-section">
          <div className="nkpi-section-title">Meta Anual</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="nkpi-field-label">
                Valor da meta anual <span style={{ color: "var(--rf-accent)" }}>*</span>
              </label>
              <input
                className="nkpi-field-input"
                type="text"
                placeholder="Ex: 70000000"
                value={annualGoal}
                onChange={(e) => setAnnualGoal(e.target.value)}
              />
              <div className="nkpi-field-hint">
                Valor total esperado para o ano de {new Date().getFullYear()}.
              </div>
            </div>
            <div>
              <label className="nkpi-field-label">Direção da meta</label>
              <select
                className="nkpi-field-select"
                value={goalDirection}
                onChange={(e) => setGoalDirection(e.target.value)}
              >
                {GOAL_DIRECTION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* METAS MENSAIS */}
        <div className="nkpi-section">
          <div className="nkpi-section-title">Metas Mensais — {new Date().getFullYear()}</div>
          <div className="nkpi-field-hint" style={{ marginBottom: 10 }}>
            Deixe em branco para distribuir automaticamente com base na meta anual.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {MONTHS.map((m, i) => (
              <div key={m} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rf-text-muted)" }}>
                  {m}
                </div>
                <input
                  className="nkpi-month-input"
                  type="text"
                  placeholder="—"
                  value={monthlyGoals[i]}
                  onChange={(e) => {
                    const next = [...monthlyGoals]
                    next[i] = e.target.value
                    setMonthlyGoals(next)
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RITUAIS VINCULADOS */}
        <div className="nkpi-section">
          <div className="nkpi-section-title">Rituais Vinculados</div>

          <div style={{ marginBottom: 14 }}>
            <label className="nkpi-field-label">Rituais que acompanham este KPI</label>

            {linkedRituals.map((r) => (
              <div key={r.id} className="nkpi-ritual-chip">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rf-success)", flexShrink: 0 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--rf-text-primary)", flex: 1 }}>
                  {r.name}{r.schedule ? ` — ${r.schedule}` : ""}
                </div>
                <button
                  onClick={() => removeLinkedRitual(r.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rf-text-muted)", display: "flex" }}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            ))}

            {rituals.length > 0 && (
              <select
                className="nkpi-field-select"
                value=""
                onChange={(e) => { if (e.target.value) addLinkedRitual(e.target.value) }}
                style={{ marginTop: 8 }}
              >
                <option value="" disabled>+ Vincular a um ritual</option>
                {rituals
                  .filter((r) => !linkedRituals.find((lr) => lr.id === r.id))
                  .map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
              </select>
            )}

            <div className="nkpi-field-hint">
              KPIs vinculados aparecem automaticamente durante a sessão do ritual.
            </div>
          </div>

          <div>
            <label className="nkpi-field-label">Registro avulso</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MANUAL_ENTRY_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`nkpi-tag-opt${manualEntry === opt.id ? " selected" : ""}`}
                  onClick={() => setManualEntry(opt.id)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
            <div className="nkpi-field-hint">
              Permite registrar valores fora de uma sessão de ritual.
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: "0 20px 20px", display: "flex", gap: 10,
        position: "sticky", bottom: 0,
        background: "var(--rf-bg-base)", borderTop: "1px solid var(--rf-border-subtle)",
        paddingTop: 16,
      }}>
        <button
          onClick={() => router.push("/cockpit/kpis")}
          style={{
            padding: "14px 20px", background: "transparent", color: "var(--rf-text-secondary)",
            border: "1px solid var(--rf-border-default)", borderRadius: "var(--rf-radius-md)",
            fontFamily: "var(--rf-font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1, padding: 14, background: "var(--rf-accent)", color: "#fff", border: "none",
            borderRadius: "var(--rf-radius-md)", fontFamily: "var(--rf-font-body)",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 10px rgba(123,97,255,0.35)",
            transition: "all var(--rf-transition)", opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar KPI"}
        </button>
      </div>
    </>
  )
}

export default function NovoKpiPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--rf-text-muted)" }}>Carregando…</div>}>
      <NovoKpiPageInner />
    </Suspense>
  )
}
