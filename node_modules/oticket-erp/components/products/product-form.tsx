"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductService } from "@/hooks/use-product-service"
import { useProductCategoryService } from "@/hooks/use-product-category-service"
import { Product, CreateProductDTO, UpdateProductDTO, ProductCategory } from "@/models/product"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProductCategoryFormDialog } from "./product-category-form-dialog"

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional().nullable(),
  category_id: z.string().uuid("Categoria inválida").optional().nullable().or(z.literal("")),
  cost_value: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Valor de custo deve ser um número")
    .min(0, "Valor de custo deve ser maior ou igual a zero"),
  unit_sale_value: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Valor de venda deve ser um número")
    .min(0, "Valor de venda deve ser maior ou igual a zero"),
  is_recurring: z.boolean().default(false),
  max_discount_percentage: z.coerce
    .number()
    .refine((v) => Number.isFinite(v), "Desconto máximo deve ser um número")
    .min(0, "Desconto máximo deve ser entre 0 e 100")
    .max(100, "Desconto máximo deve ser entre 0 e 100")
    .optional()
    .default(0),
  is_active: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product | null
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { CREATE, UPDATE } = useProductService()
  const { LIST: LIST_CATEGORIES } = useProductCategoryService()
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false)

  // Carregar categorias
  const loadCategories = React.useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const data = await LIST_CATEGORIES()
      if (data) {
        setCategories(data)
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }, [LIST_CATEGORIES])

  React.useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Handler para quando uma categoria for criada
  const handleCategoryCreated = (categoryId: string) => {
    // Recarregar categorias
    loadCategories()
    // Selecionar a categoria recém-criada no formulário
    form.setValue("category_id", categoryId)
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category_id: null,
      cost_value: 0,
      unit_sale_value: 0,
      is_recurring: false,
      max_discount_percentage: 0,
      is_active: true,
    },
  })

  // Preencher formulário quando editar
  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || null,
        cost_value: parseFloat(product.cost_value) || 0,
        unit_sale_value: parseFloat(product.unit_sale_value) || 0,
        is_recurring: product.is_recurring,
        max_discount_percentage: parseFloat(product.max_discount_percentage) || 0,
        is_active: product.is_active,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        category_id: null,
        cost_value: 0,
        unit_sale_value: 0,
        is_recurring: false,
        max_discount_percentage: 0,
        is_active: true,
      })
    }
  }, [product, form])

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      if (product) {
        // Atualizar produto existente
        const updateData: UpdateProductDTO = {
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          cost_value: data.cost_value,
          unit_sale_value: data.unit_sale_value,
          is_recurring: data.is_recurring,
          max_discount_percentage: data.max_discount_percentage,
          is_active: data.is_active,
        }

        await UPDATE(product.id, updateData)
        toast.success("Produto atualizado com sucesso")
      } else {
        // Criar novo produto
        const createData: CreateProductDTO = {
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          cost_value: data.cost_value,
          unit_sale_value: data.unit_sale_value,
          is_recurring: data.is_recurring,
          max_discount_percentage: data.max_discount_percentage,
          is_active: data.is_active,
        }

        await CREATE(createData)
        toast.success("Produto criado com sucesso")
      }

      // Redirecionar para a lista após salvar
      router.push("/products")
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error)
      toast.error(
        error?.response?.data?.message || error?.message || "Erro ao salvar produto"
      )
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
          onClick={() => router.push("/products")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {product ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {product
              ? "Atualize as informações do produto"
              : "Preencha os dados para cadastrar um novo produto"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
          <CardDescription>
            Preencha os dados do produto ou serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome e Categoria na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ingresso VIP" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Nome do produto ou serviço
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between ">
                        <FormLabel>Categoria</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 text-xs "
                          onClick={(e) => {
                            e.preventDefault()
                            setIsCategoryDialogOpen(true)
                          }}
                        >
                          <Plus className="h-auto w-3 mr-1" />
                          Nova categoria
                        </Button>
                      </div>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => {
                          field.onChange(value === "none" ? null : value)
                        }}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background w-full">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Categoria do produto (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição em largura inteira */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o produto ou serviço..."
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Descrição detalhada do produto ou serviço
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valores em 3 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cost_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Custo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            field.onChange(value)
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Custo do produto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_sale_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Venda</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            field.onChange(value)
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Valor unitário de venda
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Máximo (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            field.onChange(value)
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Desconto máximo permitido (0-100%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recorrente e Ativo na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produto Recorrente</FormLabel>
                        <FormDescription className="text-xs">
                          Serviço recorrente (ex: assinatura mensal)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produto Ativo</FormLabel>
                        <FormDescription className="text-xs">
                          Produtos inativos não aparecerão nas listagens
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products")}
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
                  ) : product ? (
                    "Atualizar"
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog para criar categoria */}
      <ProductCategoryFormDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSuccess={handleCategoryCreated}
      />
    </div>
  )
}
