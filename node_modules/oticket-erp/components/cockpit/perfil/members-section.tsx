"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Plus, UserPlus } from "lucide-react"
import { RoleChip, Section, SettingRow, StatusDot, settingsButtonNeutral } from "./shared"

type MemberRow = {
  id: string
  name: string
  you?: boolean
  area: string
  role: "socio" | "gestor" | "membro"
  status: "active" | "pending"
  statusText: string
  access: string
  gradient: string
  initials: string
}

const members: MemberRow[] = [
  {
    id: "1",
    name: "Carlos Silva",
    you: true,
    area: "Estratégia",
    role: "socio",
    status: "active",
    statusText: "Ativo",
    access: "Hoje 09:14",
    gradient: "from-primary to-chart-2",
    initials: "CS",
  },
  {
    id: "2",
    name: "Marina Rocha",
    area: "Comercial",
    role: "gestor",
    status: "active",
    statusText: "Ativo",
    access: "Ontem 18:32",
    gradient: "from-emerald-400 to-emerald-600",
    initials: "MR",
  },
  {
    id: "3",
    name: "Luís Ferreira",
    area: "Operações",
    role: "gestor",
    status: "active",
    statusText: "Ativo",
    access: "Hoje 11:05",
    gradient: "from-orange-400 to-red-500",
    initials: "LF",
  },
  {
    id: "4",
    name: "Ana Costa",
    area: "Financeiro",
    role: "membro",
    status: "active",
    statusText: "Ativo",
    access: "Hoje 08:47",
    gradient: "from-sky-400 to-blue-600",
    initials: "AC",
  },
  {
    id: "5",
    name: "Pedro Ramos",
    area: "Comercial",
    role: "membro",
    status: "pending",
    statusText: "Convite pendente",
    access: "Convidado 3d atrás",
    gradient: "from-muted-foreground/40 to-muted-foreground/20",
    initials: "PR",
  },
]

function MemberAvatar({ gradient, initials }: { gradient: string; initials: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-bold text-white",
        gradient
      )}
    >
      {initials}
    </span>
  )
}

export function MembersSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button size="sm" variant="outline" className={cn("gap-2", settingsButtonNeutral)}>
          <Plus className="size-4" strokeWidth={2.5} />
          Convidar membro
        </Button>
      </div>

      <Section
        title="Membros ativos"
        description="5 de 10 assentos usados"
      >
        {/* Desktop table */}
        <div className="hidden overflow-hidden lg:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Nome", "Área", "Perfil", "Status", "Acesso", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <MemberAvatar gradient={m.gradient} initials={m.initials} />
                      <span className="text-sm font-semibold text-card-foreground">
                        {m.name}
                      </span>
                      {m.you && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{m.area}</td>
                  <td className="px-4 py-3">
                    <RoleChip variant={m.role}>
                      {m.role === "socio" ? "Sócio" : m.role === "gestor" ? "Gestor" : "Membro"}
                    </RoleChip>
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot
                      tone={m.status === "active" ? "ok" : "warn"}
                      label={m.statusText}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {m.access}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.you ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Button variant="outline" size="sm" className={settingsButtonNeutral}>
                        {m.status === "pending" ? "Reenviar" : "Editar"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="divide-y divide-border lg:hidden">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <MemberAvatar gradient={m.gradient} initials={m.initials} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-card-foreground">
                      {m.name}
                    </span>
                    {m.you && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        você
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{m.area}</p>
                </div>
                <RoleChip variant={m.role}>
                  {m.role === "socio" ? "Sócio" : m.role === "gestor" ? "Gestor" : "Membro"}
                </RoleChip>
              </div>
              <div className="flex items-center justify-between">
                <StatusDot
                  tone={m.status === "active" ? "ok" : "warn"}
                  label={m.statusText}
                />
                {!m.you && (
                  <Button variant="outline" size="sm" className={settingsButtonNeutral}>
                    {m.status === "pending" ? "Reenviar" : "Editar"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Invite row */}
        <div className="flex flex-col gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center">
          <UserPlus className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
          <Input
            type="email"
            placeholder="email@empresa.com.br"
            className="flex-1 bg-background"
          />
          <Select defaultValue="membro">
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="membro">Membro</SelectItem>
              <SelectItem value="gestor">Gestor</SelectItem>
              <SelectItem value="socio">Sócio</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className={settingsButtonNeutral}>
            Convidar
          </Button>
        </div>
      </Section>

      <Section title="Permissões por perfil">
        <SettingRow
          label="Sócio"
          description="Acesso total — cockpit, KPIs, planos, membros, faturamento e configurações."
          control={<RoleChip variant="socio">Acesso total</RoleChip>}
        />
        <SettingRow
          label="Gestor"
          description="Cockpit da equipe, rituais, KPIs da área e planos — sem faturamento ou membros."
          control={<RoleChip variant="gestor">Acesso da equipe</RoleChip>}
        />
        <SettingRow
          label="Membro"
          description="Apenas seu setor — sem acesso a outros setores ou dados financeiros."
          control={<RoleChip variant="membro">Acesso individual</RoleChip>}
        />
      </Section>
    </div>
  )
}
