"use client"

import * as React from "react"
import { Search, Filter, ArrowUpDown, ArrowDownLeft, ArrowUpRight, Download, Calendar, ChevronDown, ChevronRight, Layers, TrendingUp, TrendingDown, DollarSign, Receipt, RefreshCw } from "lucide-react"
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
import { useFinancialEntryService } from "@/hooks/use-financial-entry-service"
import {
  FinancialEntry,
  FinancialEntryType,
  FinancialEntryGroup,
  FinancialConsolidated,
  ListTransactionsParams,
} from "@/models/financial-entry"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccountStore } from "@/stores/account-store"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import getTransactionTypeLabel from "@/utils/transaction-type-label"
import formatPaymentMethod from "@/utils/payment-method-formatter"
import formatExternalSource from "@/utils/external-source-formatter"

interface TransactionsTableProps {
  initialEventId?: string
}

export function TransactionsTable({ initialEventId }: TransactionsTableProps = {}) {
  const { LIST_TRANSACTIONS } = useFinancialEntryService()
  const currentAccount = useAccountStore((state) => state.currentAccount)
  const [transactions, setTransactions] = React.useState<FinancialEntry[]>([])
  const [groups, setGroups] = React.useState<FinancialEntryGroup[]>([])
  const [consolidated, setConsolidated] = React.useState<FinancialConsolidated | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")

  // Estado de paginação
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)

  // Estado de filtros
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [orderBy, setOrderBy] = React.useState<"entry_date" | "created_at" | "amount">("entry_date")
  const [orderDirection, setOrderDirection] = React.useState<"ASC" | "DESC">("DESC")
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")
  const [referenceType, setReferenceType] = React.useState<string>("")
  const [referenceId, setReferenceId] = React.useState<string>("")
  const [eventId, setEventId] = React.useState<string>(initialEventId || "")
  const [eventName, setEventName] = React.useState<string>("")
  const [paymentId, setPaymentId] = React.useState<string>("")
  const [groupByReference, setGroupByReference] = React.useState<boolean>(false)
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())

  // Usar apenas o ID da conta para evitar recriações desnecessárias
  const accountId = React.useMemo(() => currentAccount?.id, [currentAccount?.id])

  // Ref para rastrear os últimos parâmetros usados e evitar requisições duplicadas
  const lastParamsRef = React.useRef<string>("")

  // Aplicar event_id inicial quando vier da query string
  React.useEffect(() => {
    if (initialEventId) {
      setEventId(initialEventId)
      setPage(1) // Reset para primeira página ao aplicar filtro
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEventId])

  // Debounce do termo de busca
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1) // Reset para primeira página ao buscar
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar transações
  const loadTransactions = React.useCallback(async () => {
    // Criar string de parâmetros para comparação
    const paramsKey = JSON.stringify({
      page,
      limit,
      orderBy,
      orderDirection,
      typeFilter,
      debouncedSearchTerm,
      startDate,
      endDate,
      accountId,
      referenceType,
      referenceId,
      eventId,
      eventName,
      paymentId,
      groupByReference,
    })

    // Se os parâmetros não mudaram, não fazer requisição
    if (lastParamsRef.current === paramsKey) {
      return
    }

    // Atualizar referência dos últimos parâmetros
    lastParamsRef.current = paramsKey

    setIsLoading(true)
    try {
      const params: ListTransactionsParams = {
        page,
        limit,
        order_by: orderBy,
        order_direction: orderDirection,
      }

      // Aplicar filtro de conta se houver conta selecionada
      if (accountId) {
        params.account_id = accountId
      }

      // Aplicar filtro de tipo
      if (typeFilter !== "all") {
        params.type = typeFilter as FinancialEntryType
      }

      // Aplicar busca por descrição
      if (debouncedSearchTerm) {
        params.description = debouncedSearchTerm
      }

      // Aplicar filtros de data e horário
      // datetime-local retorna formato "YYYY-MM-DDTHH:mm", converter para ISO 8601
      if (startDate) {
        // datetime-local sempre retorna "YYYY-MM-DDTHH:mm", adicionar segundos e converter para ISO
        const dateTime = startDate.length === 16 ? `${startDate}:00` : startDate
        params.start_date = new Date(dateTime).toISOString()
      }
      if (endDate) {
        // datetime-local sempre retorna "YYYY-MM-DDTHH:mm", adicionar segundos e converter para ISO
        const dateTime = endDate.length === 16 ? `${endDate}:00` : endDate
        params.end_date = new Date(dateTime).toISOString()
      }

      // Aplicar filtros de referência
      if (referenceType) {
        params.reference_type = referenceType
      }
      if (referenceId) {
        params.reference_id = referenceId
      }

      // Aplicar filtros de evento
      if (eventId) {
        params.event_id = eventId
      }
      if (eventName) {
        params.event_name = eventName
      }

      // Aplicar filtro de payment_id
      if (paymentId) {
        params.payment_id = paymentId.trim()
      }

      // Aplicar agrupamento
      if (groupByReference) {
        params.group_by_reference = true
      }

      const response = await LIST_TRANSACTIONS(params)
      if (response) {
        if (groupByReference) {
          // Se está agrupado, a resposta vem como grupos
          setGroups(response.data as FinancialEntryGroup[])
          setTransactions([])
        } else {
          // Se não está agrupado, a resposta vem como transações
          setTransactions(response.data as FinancialEntry[])
          setGroups([])
        }
        setTotal(response.total)
        setTotalPages(response.totalPages)
        // Atualizar consolidado
        if (response.consolidated) {
          setConsolidated(response.consolidated)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
      toast.error("Erro ao carregar transações financeiras")
    } finally {
      setIsLoading(false)
    }
  }, [
    LIST_TRANSACTIONS,
    page,
    limit,
    orderBy,
    orderDirection,
    typeFilter,
    debouncedSearchTerm,
    startDate,
    endDate,
    accountId, // Usar apenas o ID ao invés do objeto inteiro
    referenceType,
    referenceId,
    eventId,
    eventName,
    paymentId,
    groupByReference,
  ])

  // Carregar transações apenas quando as dependências realmente mudarem
  React.useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }


  // Alternar ordem de classificação
  const toggleSortOrder = () => {
    setOrderDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"))
  }

  // Função para determinar se uma transação é positiva (verde) ou negativa (vermelho)
  // baseada na lógica contábil: tipo de conta + tipo de entrada
  const isTransactionPositive = React.useCallback((entry: FinancialEntry): boolean => {
    const accountType = entry.chart_of_account?.type; // ASSET, LIABILITY, INCOME, EXPENSE
    const entryType = entry.type; // DEBIT ou CREDIT

    // Se não tiver tipo de conta, usa a lógica simples (CREDIT = positivo)
    if (!accountType) {
      return entryType === FinancialEntryType.CREDIT
    }

    // Lógica contábil:
    // ASSET + DEBIT = positivo (aumenta ativo)
    // INCOME + CREDIT = positivo (aumenta receita)
    // EXPENSE + DEBIT = negativo (aumenta despesa)
    // LIABILITY + CREDIT = negativo (aumenta passivo)
    if (accountType === 'ASSET' && entryType === FinancialEntryType.DEBIT) {
      return true // Verde
    } else if (accountType === 'INCOME' && entryType === FinancialEntryType.CREDIT) {
      return true // Verde
    } else if (accountType === 'EXPENSE' && entryType === FinancialEntryType.DEBIT) {
      return false // Vermelho
    } else if (accountType === 'LIABILITY' && entryType === FinancialEntryType.CREDIT) {
      return false // Vermelho
    }

    // Fallback: se não se encaixar nas regras acima, usa a lógica simples
    return entryType === FinancialEntryType.CREDIT
  }, [])

  // Exportar para CSV
  const handleExport = () => {
    try {
      const headers = [
        "Data",
        "Descrição",
        "Tipo",
        "Valor",
        "Fonte Externa",
        "Referência",
        "Evento",
        "Método Pagamento",
        "Parcelas",
        "Bandeira",
        "Plano de Contas",
      ]
      
      // Se estiver agrupado, exportar todas as transações dos grupos
      const entriesToExport = groupByReference
        ? groups.flatMap((group) => group.transactions)
        : transactions

      const csvData = entriesToExport.map((entry) => [
        new Date(entry.entry_date).toLocaleDateString("pt-BR"),
        entry.description,
        getTransactionTypeLabel(entry),
        entry.amount,
        formatExternalSource(entry.external_source),
        entry.reference_id || "-",
        entry.event_name || "-",
        formatPaymentMethod(entry.payment_method, entry.installments),
        entry.installments ? `${entry.installments}x` : "-",
        entry.card_brand || "-",
        entry.chart_of_account?.name || "-",
      ])

      const csv = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transacoes-financeiras-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("Transações exportadas com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar:", error)
      toast.error("Erro ao exportar transações")
    }
  }


  // Toggle para expandir/colapsar grupo
  const toggleGroup = (referenceId: string | null) => {
    const key = referenceId || "sem-referencia"
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Gerar array de páginas para paginação
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Mostrar todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas com ellipsis
      if (page <= 3) {
        // Início
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        // Fim
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Meio
        pages.push(1)
        pages.push("ellipsis")
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="space-y-6">
      {/* Cards de Consolidado Financeiro */}
      {consolidated && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Receita Total */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(consolidated.total_revenue)}
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

          {/* Despesas Totais */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas Totais</p>
                  <p className="text-2xl font-bold text-chart-5 mt-1">
                    {formatCurrency(consolidated.total_expenses)}
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
          </Card>

          {/* Obrigações Totais */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Obrigações</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
                    {formatCurrency(consolidated.total_liabilities)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A pagar
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lucro Líquido */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p
                    className={cn(
                      "text-2xl font-bold mt-1",
                      consolidated.profit >= 0 ? "text-primary" : "text-chart-5"
                    )}
                  >
                    {formatCurrency(consolidated.profit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {consolidated.profit >= 0 ? "Saldo positivo" : "Saldo negativo"}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    consolidated.profit >= 0
                      ? "bg-primary/10 text-primary"
                      : "bg-chart-5/10 text-chart-5"
                  )}
                >
                  {consolidated.profit >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Transações */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Transações Financeiras
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({total} {total === 1 ? "transação" : "transações"})
            </span>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="group-by-reference"
                checked={groupByReference}
                onCheckedChange={setGroupByReference}
              />
              <Label htmlFor="group-by-reference" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Agrupar por referência
              </Label>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent" 
              onClick={() => {
                lastParamsRef.current = ""
                loadTransactions()
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
          {/* Filtros e Busca */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Primeira linha: Busca e Filtros principais em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {/* Busca por descrição */}
              <div className="relative md:col-span-1">
                <Label htmlFor="search-description" className="text-sm font-medium mb-2 block">
                  Buscar por descrição
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-description"
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
              </div>

              {/* Filtro de tipo */}
              {/* <div className="md:col-span-1">
                <Label htmlFor="type-filter" className="text-sm font-medium mb-2 block">
                  Tipo
                </Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" className="w-full bg-background">
                    <Filter className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value={FinancialEntryType.CREDIT}>Créditos</SelectItem>
                    <SelectItem value={FinancialEntryType.DEBIT}>Débitos</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Ordenação */}
              <div className="md:col-span-1">
                <Label htmlFor="order-by" className="text-sm font-medium mb-2 block">
                  Ordenar por
                </Label>
                <Select value={orderBy} onValueChange={(value) => setOrderBy(value as typeof orderBy)}>
                  <SelectTrigger id="order-by" className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry_date">Data</SelectItem>
                    <SelectItem value="created_at">Criação</SelectItem>
                    <SelectItem value="amount">Valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID da Referência */}
              <div className="md:col-span-1">
                <Label htmlFor="reference-id" className="text-sm font-medium mb-2 block">
                  ID da Referência
                </Label>
                <Input
                  id="reference-id"
                  type="text"
                  placeholder="Ex: 887721"
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-background"
                />
              </div>

              {/* ID do Evento */}
              <div className="md:col-span-1">
                <Label htmlFor="event-id" className="text-sm font-medium mb-2 block">
                  ID do Evento
                </Label>
                <Input
                  id="event-id"
                  type="text"
                  placeholder="Ex: 123"
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-background"
                />
              </div>

              {/* Nome do Evento */}
              <div className="md:col-span-1">
                <Label htmlFor="event-name" className="text-sm font-medium mb-2 block">
                  Nome do Evento
                </Label>
                <Input
                  id="event-name"
                  type="text"
                  placeholder="Ex: Show de Rock"
                  value={eventName}
                  onChange={(e) => {
                    setEventName(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-background"
                />
              </div>

              {/* Código da Transação (Payment ID) */}
              <div className="md:col-span-1">
                <Label htmlFor="payment-id" className="text-sm font-medium mb-2 block">
                  Código da Transação
                </Label>
                <Input
                  id="payment-id"
                  type="text"
                  placeholder="Ex: pay_123456789"
                  value={paymentId}
                  onChange={(e) => {
                    setPaymentId(e.target.value)
                    setPage(1)
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
                    setPage(1)
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
                    setPage(1)
                  }}
                  className="w-full bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:invert-0"
                />
              </div>
              {(startDate || endDate || referenceType || referenceId || eventId || eventName || paymentId) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      setReferenceType("")
                      setReferenceId("")
                      setEventId("")
                      setEventName("")
                      setPaymentId("")
                      setPage(1)
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
          ) : (groupByReference ? groups.length === 0 : transactions.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Código Pagamento</TableHead>
                      <TableHead>Método Pagamento</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Bandeira</TableHead>
                      <TableHead>Plano de Contas</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupByReference && groups.length > 0 ? (
                      // Modo agrupado (dados da API)
                      groups.map((group) => {
                        const groupKey = group.reference_id || "sem-referencia"
                        const isExpanded = expandedGroups.has(groupKey)
                        const isPositive = group.total >= 0

                        return (
                          <React.Fragment key={groupKey}>
                            {/* Linha principal do grupo */}
                            <TableRow className="hover:bg-muted/50 bg-muted/30">
                              <TableCell colSpan={2}>
                                <div 
                                  className="flex items-center gap-2 cursor-pointer w-full"
                                  onClick={() => toggleGroup(groupKey)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium text-sm">
                                    Referência: {group.reference_id || "Sem referência"}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {group.transaction_count} {group.transaction_count === 1 ? "transação" : "transações"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={isPositive ? "default" : "destructive"}
                                  className={cn(
                                    isPositive
                                      ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary"
                                      : "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20 dark:bg-chart-5/25 dark:text-chart-5 dark:hover:bg-chart-5/35"
                                  )}
                                >
                                  {isPositive ? "Líquido" : "Negativo"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(group.date)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {group.reference_id || "-"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                Resumo
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={cn(
                                    "font-semibold text-base",
                                    isPositive ? "text-primary" : "text-chart-5"
                                  )}
                                >
                                  {isPositive ? "+" : ""}
                                  {formatCurrency(Math.abs(group.total))}
                                </span>
                              </TableCell>
                            </TableRow>

                            {/* Transações detalhadas (colapsável) */}
                            {isExpanded && group.transactions.map((entry) => (
                                  <TableRow key={entry.id} className="hover:bg-muted/50 bg-muted/10">
                                    <TableCell className="pl-8 font-medium">
                                      {formatDate(entry.entry_date)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-lg",
                                            isTransactionPositive(entry)
                                              ? "bg-primary/10 text-primary"
                                              : "bg-chart-5/10 text-chart-5"
                                          )}
                                        >
                                          {isTransactionPositive(entry) ? (
                                            <ArrowDownLeft className="h-4 w-4" />
                                          ) : (
                                            <ArrowUpRight className="h-4 w-4" />
                                          )}
                                        </div>
                                        <span className="text-sm">{entry.description}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={isTransactionPositive(entry) ? "default" : "destructive"}
                                        className={cn(
                                          isTransactionPositive(entry)
                                            ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary"
                                            : "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20 dark:bg-chart-5/25 dark:text-chart-5 dark:hover:bg-chart-5/35"
                                        )}
                                      >
                                        {getTransactionTypeLabel(entry)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {formatExternalSource(entry.external_source)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {entry.reference_id || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {entry.event_name || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground font-mono">
                                      {entry.payment_id || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {formatPaymentMethod(entry.payment_method, entry.installments)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {entry.installments ? `${entry.installments}x` : "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {entry.card_brand || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {entry.chart_of_account?.name || entry.chart_of_account?.code || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span
                                        className={cn(
                                          "font-semibold",
                                          isTransactionPositive(entry) ? "text-primary" : "text-chart-5"
                                        )}
                                      >
                                        {isTransactionPositive(entry) ? "+" : "-"}
                                        {formatCurrency(Math.abs(Number(entry.amount)))}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                            ))}
                          </React.Fragment>
                        )
                      })
                    ) : (
                      // Modo detalhado (padrão)
                      transactions.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {formatDate(entry.entry_date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg",
                                  isTransactionPositive(entry)
                                    ? "bg-primary/10 text-primary"
                                    : "bg-chart-5/10 text-chart-5"
                                )}
                              >
                                {isTransactionPositive(entry) ? (
                                  <ArrowDownLeft className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                              </div>
                              <span className="text-sm">{entry.description}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isTransactionPositive(entry) ? "default" : "destructive"}
                              className={cn(
                                isTransactionPositive(entry)
                                  ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary"
                                  : "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20 dark:bg-chart-5/25 dark:text-chart-5 dark:hover:bg-chart-5/35"
                              )}
                            >
                              {getTransactionTypeLabel(entry)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatExternalSource(entry.external_source)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.reference_id || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.event_name || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {entry.payment_id || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatPaymentMethod(entry.payment_method, entry.installments)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.installments ? `${entry.installments}x` : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.card_brand || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.chart_of_account?.name || entry.chart_of_account?.code || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-semibold",
                                isTransactionPositive(entry) ? "text-primary" : "text-chart-5"
                              )}
                            >
                              {isTransactionPositive(entry) ? "+" : "-"}
                              {formatCurrency(Math.abs(Number(entry.amount)))}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {groupByReference
                        ? `Mostrando ${groups.length} de ${total} ${total === 1 ? "grupo" : "grupos"}`
                        : `Mostrando ${transactions.length} de ${total} ${total === 1 ? "transação" : "transações"}`}
                    </span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value))
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[100px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">por página</span>
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage((p) => Math.max(1, p - 1))
                          }}
                          className={cn(
                            page === 1 && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((pageNum, index) => {
                        if (pageNum === "ellipsis") {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage(pageNum)
                              }}
                              isActive={page === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage((p) => Math.min(totalPages, p + 1))
                          }}
                          className={cn(
                            page === totalPages && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
