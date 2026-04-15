"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ProductForm } from "@/components/products/product-form"
import { useProductService } from "@/hooks/use-product-service"
import { Product } from "@/models/product"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { GET_BY_ID } = useProductService()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const hasLoadedRef = React.useRef(false)

  React.useEffect(() => {
    // Evitar requisições desnecessárias
    if (hasLoadedRef.current) {
      return
    }

    const loadProduct = async () => {
      if (!params?.id || typeof params.id !== "string") {
        toast.error("ID do produto não encontrado")
        router.push("/products")
        return
      }

      setIsLoading(true)
      try {
        const data = await GET_BY_ID(params.id)
        if (data) {
          setProduct(data)
          hasLoadedRef.current = true
        } else {
          toast.error("Produto não encontrado")
          router.push("/products")
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        toast.error("Erro ao carregar produto")
        router.push("/products")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <ProductForm product={product} />
    </main>
  )
}
