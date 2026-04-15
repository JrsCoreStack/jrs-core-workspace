"use client"

import * as React from "react"
import { Edit, Trash2, Plus, Search, RefreshCw, Package } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useProductService } from "@/hooks/use-product-service"
import { useProductCategoryService } from "@/hooks/use-product-category-service"
import { Product, ProductCategory } from "@/models/product"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function ProductsTable() {
  const router = useRouter()
  const { LIST, DELETE } = useProductService()
  const { LIST: LIST_CATEGORIES } = useProductCategoryService()
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Ref para rastrear os últimos parâmetros usados e evitar requisições duplicadas
  const lastParamsRef = React.useRef<string>("")

  // Carregar categorias
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await LIST_CATEGORIES()
        if (data) {
          setCategories(data)
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      }
    }
    loadCategories()
  }, [LIST_CATEGORIES])

  // Debounce do termo de busca
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Carregar produtos
  const loadProducts = React.useCallback(async () => {
    // Criar string de parâmetros para comparação
    const paramsKey = JSON.stringify({
      searchTerm: debouncedSearchTerm,
      categoryFilter,
      statusFilter,
    })

    // Se os parâmetros não mudaram, não fazer requisição
    if (lastParamsRef.current === paramsKey) {
      return
    }

    // Atualizar referência dos últimos parâmetros
    lastParamsRef.current = paramsKey

    setIsLoading(true)
    try {
      const params: any = {
        includeInactive: statusFilter === "all" || statusFilter === "inactive",
      }

      const response = await LIST(params)

      if (response) {
        let filteredProducts = response

        // Filtrar por busca (nome)
        if (debouncedSearchTerm.trim()) {
          filteredProducts = filteredProducts.filter((p) =>
            p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
        }

        // Filtrar por categoria
        if (categoryFilter !== "all") {
          filteredProducts = filteredProducts.filter(
            (p) => p.category_id === categoryFilter
          )
        }

        // Filtrar por status
        if (statusFilter === "active") {
          filteredProducts = filteredProducts.filter((p) => p.is_active)
        } else if (statusFilter === "inactive") {
          filteredProducts = filteredProducts.filter((p) => !p.is_active)
        }

        setProducts(filteredProducts)
      } else {
        setProducts([])
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error)
      toast.error(error?.response?.data?.message || "Erro ao carregar produtos")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [LIST, debouncedSearchTerm, categoryFilter, statusFilter])

  // Carregar produtos quando as dependências mudarem
  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Formatar valor monetário
  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue)
  }

  // Formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Handlers
  const handleCreate = () => {
    router.push("/products/new")
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)
    try {
      await DELETE(selectedProduct.id)
      toast.success("Produto excluído com sucesso")
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
      lastParamsRef.current = "" // Forçar recarregamento
      loadProducts()
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error)
      toast.error(error?.response?.data?.message || "Erro ao excluir produto")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabela de Produtos */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Produtos
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({products.length} {products.length === 1 ? "produto" : "produtos"})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => {
                lastParamsRef.current = ""
                loadProducts()
              }}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button variant="default" size="sm" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="md:col-span-1 flex flex-col gap-2">
                <Label htmlFor="search" className="text-sm font-medium">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full bg-background"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="category-filter" className="text-sm font-medium">
                  Categoria
                </Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" className="w-full bg-background">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="w-full bg-background">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
                <div className="md:col-span-3 flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setCategoryFilter("all")
                      setStatusFilter("all")
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum produto encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Tente ajustar os filtros"
                  : "Comece criando seu primeiro produto"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor de Custo</TableHead>
                    <TableHead>Valor de Venda</TableHead>
                    <TableHead>Desconto Máx.</TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">{product.category.name}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(product.cost_value)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(product.unit_sale_value)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {parseFloat(product.max_discount_percentage) > 0
                          ? `${product.max_discount_percentage}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_recurring ? "default" : "secondary"}>
                          {product.is_recurring ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className={cn(
                            product.is_active &&
                              "bg-green-500/10 text-green-600 dark:text-green-400"
                          )}
                        >
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto <strong>{selectedProduct?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
