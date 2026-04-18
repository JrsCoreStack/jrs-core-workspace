"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useProductCategoryService } from "@/hooks/use-product-category-service"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter pelo menos 2 caracteres"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface ProductCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (categoryId: string) => void
}

export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProductCategoryFormDialogProps) {
  const { CREATE } = useProductCategoryService()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  })

  // Resetar formulário quando o dialog abrir/fechar
  React.useEffect(() => {
    if (open) {
      form.reset({ name: "" })
    }
  }, [open, form])

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true)
    try {
      const newCategory = await CREATE({ name: data.name })
      if (newCategory) {
        toast.success("Categoria criada com sucesso")
        onSuccess(newCategory.id)
        onOpenChange(false)
        form.reset()
      }
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error)
      toast.error(
        error?.response?.data?.message || error?.message || "Erro ao criar categoria"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria de produtos para organizar melhor seus itens
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ingressos, Serviços Técnicos" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Nome da categoria de produtos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
