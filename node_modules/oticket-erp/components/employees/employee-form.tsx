"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEmployeeService } from "@/hooks/use-employee-service"
import { useUserAccountService } from "@/hooks/use-user-account-service"
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from "@/models/employee"
import { AccountRoleSelector } from "./account-role-selector"
import { useAccountService } from "@/hooks/use-account-service"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const accountRoleSchema = z.object({
  account_id: z.string(),
  role_id: z.string().optional(),
})

const employeeSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  phone: z.string().optional(),
  accountRoles: z.array(accountRoleSchema).optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  employee?: Employee | null
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { CREATE, UPDATE } = useEmployeeService()
  const { SYNC_USER_ACCOUNTS } = useUserAccountService()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { LIST_ALL } = useAccountService()
  const [availableAccounts, setAvailableAccounts] = React.useState<any[]>([])
  
  // Rastrear se as contas já foram carregadas para evitar requisições desnecessárias
  const accountsLoadedRef = React.useRef(false)

  // Carregar todas as contas disponíveis
  React.useEffect(() => {
    // Se já foram carregadas, não fazer requisição novamente
    if (accountsLoadedRef.current || availableAccounts.length > 0) {
      return
    }

    const fetchAccounts = async () => {
      try {
        const accounts = await LIST_ALL()
        if (accounts) {
          setAvailableAccounts(accounts)
          accountsLoadedRef.current = true
        }
      } catch (error) {
        console.error("Erro ao carregar contas:", error)
      }
    }
    fetchAccounts()
  }, [LIST_ALL, availableAccounts.length])

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      cpf: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      accountRoles: [],
    },
  })

  React.useEffect(() => {
    if (employee) {
      // Priorizar user_accounts se disponível, senão usar accounts
      let accountRoles: Array<{ account_id: string; role_id?: string }> = []
      
      if (employee.user_accounts && employee.user_accounts.length > 0) {
        // Se tiver user_accounts, usar account_id e role_id deles
        accountRoles = employee.user_accounts.map((ua) => ({
          account_id: ua.account_id,
          role_id: ua.role_id,
        }))
      } else if (employee.accounts && employee.accounts.length > 0) {
        // Fallback para accounts (formato antigo) - sem role
        accountRoles = employee.accounts.map((acc) => ({
          account_id: acc.accountId,
          role_id: undefined,
        }))
      }
      
      form.reset({
        cpf: employee.cpf,
        name: employee.name,
        email: employee.email,
        password: "",
        phone: employee.phone || "",
        accountRoles: accountRoles,
      })
    } else {
      form.reset({
        cpf: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        accountRoles: [],
      })
    }
  }, [employee, form])

  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true)

    try {
      let savedEmployee: Employee | undefined

      if (employee) {
        // Atualizar
        const updateData: UpdateEmployeeDTO = {
          cpf: values.cpf,
          name: values.name,
          email: values.email,
          phone: values.phone,
        }

        // Só incluir senha se foi preenchida
        if (values.password && values.password.length > 0) {
          updateData.password = values.password
        }

        savedEmployee = await UPDATE(employee.id, updateData)
        toast.success("Colaborador atualizado com sucesso")
      } else {
        // Criar
        if (!values.password || values.password.length === 0) {
          toast.error("Senha é obrigatória para novos colaboradores")
          setIsSubmitting(false)
          return
        }

        const createData: CreateEmployeeDTO = {
          cpf: values.cpf,
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
        }

        savedEmployee = await CREATE(createData)
        toast.success("Colaborador criado com sucesso")
      }

      // Sincronizar vínculos de contas e permissões após salvar o colaborador
      if (savedEmployee && values.accountRoles) {
        try {
          await SYNC_USER_ACCOUNTS(savedEmployee.id, values.accountRoles || [])
          toast.success("Contas e permissões vinculadas com sucesso")

          // Se o colaborador editado for o usuário logado, atualizar a sessão
          if (session?.user?.id && savedEmployee.id && session.user.id === savedEmployee.id) {
            const selectedAccountIds = (values.accountRoles || []).map((ar) => ar.account_id)

            // Montar nova lista de contas do usuário logado com base nas contas disponíveis
            const newAccounts = availableAccounts.filter((acc) =>
              selectedAccountIds.includes(acc.id)
            )

            // Se não houver nenhuma conta selecionada, manter as contas atuais da sessão
            await update({
              accounts: newAccounts.length > 0 ? newAccounts : session.accounts,
            })
          }
        } catch (accountError: any) {
          console.error("Erro ao vincular contas e permissões:", accountError)
          toast.error("Colaborador salvo, mas houve erro ao vincular contas e permissões")
        }
      }

      // Redirecionar para a lista após salvar
      router.push("/employees")
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error)
      toast.error(error?.message || "Erro ao salvar colaborador")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/employees")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {employee ? "Editar Colaborador" : "Novo Colaborador"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {employee
              ? "Atualize as informações do colaborador"
              : "Preencha os dados para cadastrar um novo colaborador"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Colaborador</CardTitle>
          <CardDescription>
            Preencha os dados básicos do colaborador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000000000"
                          {...field}
                          maxLength={11}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Senha {employee ? "(deixe em branco para manter a atual)" : ""}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountRoles"
                render={({ field }) => {
                  // Usar ref para estabilizar a função onChange
                  const onChangeRef = React.useRef(field.onChange)
                  
                  React.useEffect(() => {
                    onChangeRef.current = field.onChange
                  }, [field.onChange])

                  const handleAccountRolesChange = React.useCallback(
                    (accountRoles: Array<{ account_id: string; role_id?: string }>) => {
                      onChangeRef.current(accountRoles)
                    },
                    []
                  )

                  return (
                    <FormItem>
                      <FormLabel>Contas e Permissões</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground mb-2">
                        Selecione as contas e defina a permissão para cada uma
                      </FormDescription>
                      <FormControl>
                        <AccountRoleSelector
                          availableAccounts={availableAccounts}
                          accountRoles={field.value || []}
                          onAccountRolesChange={handleAccountRolesChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employees")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
