    "use client"

import * as React from "react"
import Link from "next/link"
import { Search, Calendar, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Receipt, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useFinancialEntryService } from "@/hooks/use-financial-entry-service"
import { useProducerPayoutService } from "@/hooks/use-producer-payout-service"
import { EventFinancialBalance, EventFinancialBalanceParams } from "@/models/financial-entry"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useAccountStore } from "@/stores/account-store"

export function EventsBalanceTable() {
  const { GET_EVENTS_FINANCIAL_BALANCE, GET_EVENTS_FINANCIAL_BALANCE_SUMMARY } = useFinancialEntryService()
  const { CREATE_MANUAL_PAYOUT } = useProducerPayoutService()
  const currentAccount = useAccountStore((state) => state.currentAccount)
  const [events, setEvents] = React.useState<EventFinancialBalance[]>([])
  const [summary, setSummary] = React.useState<{
    total_revenue: number;
    total_expenses: number;
    total_liabilities: number;
    total_repaid: number;
    total_pending_balance: number;
    total_balance: number;
    event_count: number;
    total_transaction_count: number;
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")
  const [eventIdFilter, setEventIdFilter] = React.useState<string>("")
  const [eventNameFilter, setEventNameFilter] = React.useState<string>("")
  const [selectedEvent, setSelectedEvent] = React.useState<EventFinancialBalance | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    amount: "",
    description: "",
    payment_receiver: "",
    payment_key: "",
  })

  // Usar apenas o ID da conta para evitar recriações desnecessárias
  const accountId = React.useMemo(() => currentAccount?.id, [currentAccount?.id])

  // Ref para rastrear os últimos parâmetros usados e evitar requisições duplicadas
  const lastParamsRef = React.useRef<string>("")

  // Carregar saldos dos eventos
  const loadEventsBalance = React.useCallback(async () => {
    // Criar string de parâmetros para comparação
    const paramsKey = JSON.stringify({
      accountId,
      startDate,
      endDate,
      eventIdFilter,
      eventNameFilter,
    })

    // Se os parâmetros não mudaram, não fazer requisição
    if (lastParamsRef.current === paramsKey) {
      return
    }

    // Atualizar referência dos últimos parâmetros
    lastParamsRef.current = paramsKey

    setIsLoading(true)
    try {
      const params: EventFinancialBalanceParams = {}

      // Aplicar filtro de conta se houver conta selecionada
      if (accountId) {
        params.account_id = accountId
      }

      // Aplicar filtros de data e horário
      if (startDate) {
        const dateTime = startDate.length === 16 ? `${startDate}:00` : startDate
        params.start_date = new Date(dateTime).toISOString()
      }
      if (endDate) {
        const dateTime = endDate.length === 16 ? `${endDate}:00` : endDate
        params.end_date = new Date(dateTime).toISOString()
      }

      // Aplicar filtros de evento
      if (eventIdFilter) {
        params.event_id = eventIdFilter.trim()
      }
      if (eventNameFilter) {
        params.event_name = eventNameFilter.trim()
      }

      const [eventsResponse, summaryResponse] = await Promise.all([
        GET_EVENTS_FINANCIAL_BALANCE(params),
        GET_EVENTS_FINANCIAL_BALANCE_SUMMARY(params),
      ])
      
      if (eventsResponse) {
        setEvents(eventsResponse)
      }
      
      if (summaryResponse) {
        setSummary(summaryResponse)
      }
    } catch (error) {
      console.error("Erro ao carregar saldos dos eventos:", error)
      toast.error("Erro ao carregar saldos dos eventos")
    } finally {
      setIsLoading(false)
    }
  }, [GET_EVENTS_FINANCIAL_BALANCE, GET_EVENTS_FINANCIAL_BALANCE_SUMMARY, accountId, startDate, endDate, eventIdFilter, eventNameFilter])

  // Carregar saldos apenas quando as dependências realmente mudarem
  React.useEffect(() => {
    loadEventsBalance()
  }, [loadEventsBalance])

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Função para formatar data
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Usar totais da API (summary) ao invés de calcular no frontend
  const totals = React.useMemo(() => {
    if (summary) {
      return {
        total_revenue: summary.total_revenue,
        total_expenses: summary.total_expenses,
        total_liabilities: summary.total_liabilities,
        total_repaid: summary.total_repaid,
        pending_balance: summary.total_pending_balance,
        balance: summary.total_balance,
        transaction_count: summary.total_transaction_count,
      }
    }
    
    // Fallback: calcular se summary não estiver disponível
    return events.reduce(
      (acc, event) => ({
        total_revenue: acc.total_revenue + event.total_revenue,
        total_expenses: acc.total_expenses + event.total_expenses,
        total_liabilities: acc.total_liabilities + event.total_liabilities,
        total_repaid: acc.total_repaid + (event.total_repaid || 0),
        pending_balance: acc.pending_balance + (event.pending_balance || 0),
        balance: acc.balance + event.balance,
        transaction_count: acc.transaction_count + event.transaction_count,
      }),
      {
        total_revenue: 0,
        total_expenses: 0,
        total_liabilities: 0,
        total_repaid: 0,
        pending_balance: 0,
        balance: 0,
        transaction_count: 0,
      }
    )
  }, [summary, events])

  // Usar pending_balance diretamente da API (já calculado pelo backend)
  const getPendingBalance = (event: EventFinancialBalance): number => {
    return event.pending_balance || 0
  }

  // Abrir dialog de criação de saque
  const handleOpenCreateDialog = (event: EventFinancialBalance) => {
    setSelectedEvent(event)
    setFormData({
      amount: "",
      description: "",
      payment_receiver: "",
      payment_key: "",
    })
    setIsCreateDialogOpen(true)
  }

  // Criar saque manual
  const handleCreateManualPayout = async () => {
    if (!selectedEvent || !currentAccount?.code) {
      return
    }

    const amount = parseFloat(formData.amount.replace(/[^\d,.-]/g, "").replace(",", "."))
    const pendingBalance = getPendingBalance(selectedEvent)

    if (isNaN(amount) || amount <= 0.01) {
      toast.error("O valor deve ser maior que R$ 0,01")
      return
    }

    if (amount > pendingBalance) {
      toast.error(
        `O valor do saque (${formatCurrency(amount)}) não pode ser maior que o saldo pendente (${formatCurrency(pendingBalance)})`
      )
      return
    }

    setIsCreating(true)
    try {
      await CREATE_MANUAL_PAYOUT({
        account_code: currentAccount.code,
        event_id: selectedEvent.event_id || "",
        amount: amount,
        description: formData.description || undefined,
        payment_receiver: formData.payment_receiver || undefined,
        payment_key: formData.payment_key || undefined,
      })

      toast.success("Saque manual criado com sucesso!")
      setIsCreateDialogOpen(false)
      setSelectedEvent(null)
      setFormData({
        amount: "",
        description: "",
        payment_receiver: "",
        payment_key: "",
      })

      // Recarregar saldos
      lastParamsRef.current = ""
      await loadEventsBalance()
    } catch (error: any) {
      console.error("Erro ao criar saque manual:", error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar saque manual"
      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Exportar para CSV
  const handleExport = () => {
    try {
      const headers = [
        "Evento",
        "ID do Evento",
        "Receita Total",
        "Despesas",
        "Total a Repassar",
        "Já Repassado",
        "Pendente",
        "Saldo Líquido",
        "Transações",
        "Primeira Transação",
        "Última Transação",
      ]

      const csvData = events.map((event) => [
        event.event_name || "Sem nome",
        event.event_id || "-",
        event.total_revenue,
        event.total_expenses,
        event.total_liabilities,
        event.total_repaid || 0,
        event.pending_balance || 0,
        event.balance,
        event.transaction_count,
        event.first_transaction_date
          ? new Date(event.first_transaction_date).toLocaleDateString("pt-BR")
          : "-",
        event.last_transaction_date
          ? new Date(event.last_transaction_date).toLocaleDateString("pt-BR")
          : "-",
      ])

      const csv = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `saldo-por-evento-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Dados exportados com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar:", error)
      toast.error("Erro ao exportar dados")
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">


        {/* Receita Total */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(totals.total_revenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Entradas de dinheiro
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendente a Repassar */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente a Repassar</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
                  {formatCurrency(totals.pending_balance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aos produtores
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Despesas Totais */}
        {/* <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-chart-5 mt-1">
                  {formatCurrency(totals.total_expenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxas e custos
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Lucro Total */}
        {/* <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p
                  className={cn(
                    "text-2xl font-bold mt-1",
                    totals.balance >= 0 ? "text-primary" : "text-chart-5"
                  )}
                >
                  {formatCurrency(totals.balance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  totals.balance >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-chart-5/10 text-chart-5"
                )}
              >
                {totals.balance >= 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Tabela de Saldos por Evento */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Saldo por Evento
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({events.length} {events.length === 1 ? "evento" : "eventos"})
            </span>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => {
                lastParamsRef.current = ""
                loadEventsBalance()
              }}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="event-id" className="text-sm font-medium">
                  ID do Evento
                </Label>
                <Input
                  id="event-id"
                  type="text"
                  placeholder="Ex: 8630"
                  value={eventIdFilter}
                  onChange={(e) => {
                    setEventIdFilter(e.target.value)
                  }}
                  className="w-full bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="event-name" className="text-sm font-medium">
                  Nome do Evento
                </Label>
                <Input
                  id="event-name"
                  type="text"
                  placeholder="Buscar por nome..."
                  value={eventNameFilter}
                  onChange={(e) => {
                    setEventNameFilter(e.target.value)
                  }}
                  className="w-full bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Data e Hora Inicial
                </Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                  }}
                  className="w-full bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:invert-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  Data e Hora Final
                </Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                  }}
                  className="w-full bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:invert-0"
                />
              </div>
              {(startDate || endDate || eventIdFilter || eventNameFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      setEventIdFilter("")
                      setEventNameFilter("")
                    }}
                    className="w-full"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum evento encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Não há eventos com transações financeiras no período selecionado
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Evento</TableHead>
                    <TableHead>Receita Total</TableHead>
                    <TableHead>Despesas</TableHead>
                    <TableHead>Total a Repassar</TableHead>
                    <TableHead>Já Repassado</TableHead>
                    <TableHead>Pendente</TableHead>
                    <TableHead>Saldo Líquido</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => {
                    const hasLiability = event.total_liabilities > 0
                    const isNegative = event.balance < 0

                    return (
                      <TableRow key={event.event_id || `event-${index}`} className="hover:bg-muted/50">
                        <TableCell>
                          {event.event_id ? (
                            <Link
                              href={`/financial/transactions?event_id=${event.event_id}`}
                              className="flex flex-col hover:opacity-80 transition-opacity"
                            >
                              <span className="font-medium text-primary hover:underline">
                                {event.event_name || "Sem nome"}
                              </span>
                              <span className="text-xs text-muted-foreground">ID: {event.event_id}</span>
                            </Link>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-medium">{event.event_name || "Sem nome"}</span>
                              <span className="text-xs text-muted-foreground">Sem ID</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">
                            {formatCurrency(event.total_revenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-chart-5">
                            {formatCurrency(event.total_expenses)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-muted-foreground">
                            {formatCurrency(event.total_liabilities)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-chart-2">
                            {formatCurrency(event.total_repaid || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(event.pending_balance || 0) > 0 && (
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            )}
                            <span className={cn(
                              "font-semibold",
                              (event.pending_balance || 0) > 0
                                ? "text-amber-600 dark:text-amber-500"
                                : "text-muted-foreground"
                            )}>
                              {formatCurrency(event.pending_balance || 0)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-semibold",
                              isNegative ? "text-chart-5" : "text-primary"
                            )}
                          >
                            {formatCurrency(event.balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {event.transaction_count} {event.transaction_count === 1 ? "transação" : "transações"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.first_transaction_date && event.last_transaction_date ? (
                            <div className="flex flex-col">
                              <span>{formatDate(event.first_transaction_date)}</span>
                              <span className="text-xs">até {formatDate(event.last_transaction_date)}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {event.event_id && getPendingBalance(event) > 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => handleOpenCreateDialog(event)}
                            >
                              <Plus className="h-4 w-4" />
                              Criar Saque
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Saque Manual */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Saque Manual</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <>
                  Evento: <strong>{selectedEvent.event_name || "Sem nome"}</strong>
                  <br />
                  Saldo pendente: <strong className="text-amber-600 dark:text-amber-500">
                    {formatCurrency(getPendingBalance(selectedEvent))}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Saque *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,.-]/g, "")
                  setFormData({ ...formData, amount: value })
                }}
                className="bg-background"
              />
              {selectedEvent && formData.amount && (
                <p className="text-xs text-muted-foreground">
                  Saldo disponível: {formatCurrency(getPendingBalance(selectedEvent))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Ex: Repasse manual após término do evento"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_receiver">Nome do Recebedor</Label>
              <Input
                id="payment_receiver"
                type="text"
                placeholder="Ex: RA BORGES COMÉRCIO E SERVIÇOS LTDA"
                value={formData.payment_receiver}
                onChange={(e) => setFormData({ ...formData, payment_receiver: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_key">CPF/CNPJ</Label>
              <Input
                id="payment_key"
                type="text"
                placeholder="Ex: 30829177000166"
                value={formData.payment_key}
                onChange={(e) => setFormData({ ...formData, payment_key: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateManualPayout}
              disabled={isCreating || !formData.amount}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Saque
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
