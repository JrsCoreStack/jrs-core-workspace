"use client"

import * as React from "react"
import { RefreshCw, Download, CheckCircle2, AlertCircle, Calendar, User, Building2, DollarSign, FileText } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProducerPayoutService } from "@/hooks/use-producer-payout-service"
import { ProducerPayoutRequest } from "@/models/producer-payout"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useAccountStore } from "@/stores/account-store"
import formatCPF from "@/utils/cpf-formatter"

export function PayoutRequestsTable() {
  const { LIST_REQUESTS, MARK_AS_PAID } = useProducerPayoutService()
  const currentAccount = useAccountStore((state) => state.currentAccount)
  const [requests, setRequests] = React.useState<ProducerPayoutRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [eventIdFilter, setEventIdFilter] = React.useState<string>("")
  const [selectedRequest, setSelectedRequest] = React.useState<ProducerPayoutRequest | null>(null)
  const [isMarkingAsPaid, setIsMarkingAsPaid] = React.useState(false)

  // Usar apenas o ID da conta para evitar recriações desnecessárias
  const accountCode = React.useMemo(() => currentAccount?.code, [currentAccount?.code])

  // Ref para rastrear os últimos parâmetros usados e evitar requisições duplicadas
  const lastParamsRef = React.useRef<string>("")

  // Carregar solicitações
  const loadRequests = React.useCallback(async () => {
    if (!accountCode) {
      setRequests([])
      setIsLoading(false)
      return
    }

    // Criar string de parâmetros para comparação
    const paramsKey = JSON.stringify({
      accountCode,
      eventIdFilter,
    })

    // Se os parâmetros não mudaram, não fazer requisição novamente
    if (lastParamsRef.current === paramsKey) {
      return
    }

    // Atualizar referência dos últimos parâmetros
    lastParamsRef.current = paramsKey

    setIsLoading(true)
    try {
      const response = await LIST_REQUESTS({
        account_code: accountCode,
        event_id: eventIdFilter || undefined,
        status: "waiting_payment",
        limit: 100, // Buscar mais resultados
        offset: 0,
      })

      if (response) {
        // Garantir que response seja um array
        setRequests(Array.isArray(response) ? response : [])
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error)
      toast.error("Erro ao carregar solicitações de saque")
    } finally {
      setIsLoading(false)
    }
  }, [LIST_REQUESTS, accountCode, eventIdFilter])

  // Carregar solicitações apenas quando as dependências realmente mudarem
  React.useEffect(() => {
    loadRequests()
  }, [loadRequests])

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
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Função para formatar data e hora
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Função para marcar como pago
  const handleMarkAsPaid = async () => {
    if (!selectedRequest || !accountCode) {
      return
    }

    setIsMarkingAsPaid(true)
    try {
      await MARK_AS_PAID(selectedRequest.id, {
        account_code: accountCode,
      })

      toast.success("Solicitação marcada como paga com sucesso!")
      setSelectedRequest(null)
      
      // Recarregar lista
      lastParamsRef.current = ""
      await loadRequests()
    } catch (error: any) {
      console.error("Erro ao marcar como pago:", error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao marcar solicitação como paga"
      toast.error(errorMessage)
    } finally {
      setIsMarkingAsPaid(false)
    }
  }

  // Calcular totais
  const totals = React.useMemo(() => {
    if (!Array.isArray(requests) || requests.length === 0) {
      return {
        total: 0,
        count: 0,
        paid: 0,
        pending: 0,
      }
    }

    return requests.reduce(
      (acc, request) => ({
        total: acc.total + request.value,
        count: acc.count + 1,
        paid: acc.paid + (request.payed ? request.value : 0),
        pending: acc.pending + (request.payed ? 0 : request.value),
      }),
      {
        total: 0,
        count: 0,
        paid: 0,
        pending: 0,
      }
    )
  }, [requests])

  // Exportar para CSV
  const handleExport = () => {
    try {
      const headers = [
        "ID",
        "Recebedor",
        "CPF/CNPJ",
        "Evento",
        "Valor",
        "Status",
        "Data de Pagamento",
        "Data de Criação",
        "Solicitado por",
      ]

      const csvData = requests.map((request) => [
        request.id,
        request.payment_receiver,
        request.payment_key,
        request.event.name,
        request.value,
        request.payed ? "Pago" : "Pendente",
        request.payment_date ? formatDate(request.payment_date) : "-",
        formatDateTime(request.created_at),
        `${request.user.first_name} ${request.user.last_name}`,
      ])

      const csv = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `solicitacoes-saque-${new Date().toISOString().split("T")[0]}.csv`
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Solicitações */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Solicitações</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">
                  {totals.count}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Solicitações encontradas
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valor Total */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(totals.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Soma de todas as solicitações
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
                  {formatCurrency(totals.pending)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando pagamento
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagos */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-2xl font-bold text-chart-2 mt-1">
                  {formatCurrency(totals.paid)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Já processados
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Solicitações */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Solicitações de Saque
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({requests.length} {requests.length === 1 ? "solicitação" : "solicitações"})
            </span>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => {
                lastParamsRef.current = ""
                loadRequests()
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="event-id" className="text-sm font-medium">
                  Filtrar por ID do Evento
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
              {eventIdFilter && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventIdFilter("")
                    }}
                    className="w-full"
                  >
                    Limpar filtro
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
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Não há solicitações de saque no momento
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Recebedor</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.payment_receiver}</span>
                          {request.description && (
                            <span className="text-xs text-muted-foreground">
                              {request.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {formatCPF(request.payment_key)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.event.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(request.event.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {formatCurrency(request.value)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {request.payed ? (
                          <Badge className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Pago
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.payment_date ? formatDate(request.payment_date) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.user.first_name} {request.user.last_name}
                      </TableCell>
                      <TableCell>
                        {!request.payed ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-2"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Marcar como Pago
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <AlertDialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja marcar esta solicitação como paga?
              </p>
              {selectedRequest && (
                <div className="mt-4 space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Recebedor:</span>
                    <span className="text-sm">{selectedRequest.payment_receiver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Evento:</span>
                    <span className="text-sm">{selectedRequest.event.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Valor:</span>
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(selectedRequest.value)}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Um lançamento contábil será criado automaticamente para registrar o pagamento.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingAsPaid}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsPaid}
              disabled={isMarkingAsPaid}
              className="gap-2"
            >
              {isMarkingAsPaid ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Pagamento
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
