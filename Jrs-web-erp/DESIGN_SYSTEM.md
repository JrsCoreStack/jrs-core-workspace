# OTicket ERP — Design System

> Guia de padronização visual para todas as abas do ERP.  
> Stack: **Next.js App Router · shadcn/ui · Tailwind CSS v4 · Lucide Icons**

---

## 1. Tokens de Cor (CSS Variables)

Nunca use cores hardcoded como `bg-white`, `bg-slate-800`, `text-gray-500`.  
Use sempre os tokens semânticos:

| Token | Uso |
|-------|-----|
| `bg-background` | Fundo da página |
| `bg-card` | Fundo de cards, modais, painéis |
| `bg-muted` | Fundo de linhas alternadas, placeholders |
| `bg-muted/50` | Cabeçalhos de tabela, hover sutil |
| `bg-primary` | Botão principal (verde-esmeralda) |
| `bg-destructive` | Botão/badge de erro |
| `text-foreground` | Texto principal |
| `text-muted-foreground` | Texto secundário, labels, descrições |
| `text-primary` | Links e destaques positivos |
| `text-destructive` | Erros, exclusão |
| `border-border` | Bordas de cards, tabelas, inputs |
| `ring-border` | Anéis de foco |

### Cores semânticas de negócio

| Cor | Token | Uso |
|-----|-------|-----|
| Verde | `text-primary` / `bg-primary/10` | Ativo, positivo, receita |
| Âmbar | `text-amber-600` / `bg-amber-500/10` | Pendente, alerta, bloqueado |
| Vermelho | `text-destructive` / `bg-destructive/10` | Erro, cancelado, atrasado |
| Azul | `text-chart-2` / `bg-chart-2/10` | Informativo |
| Roxo | `text-chart-1` / `bg-chart-1/10` | Estratégico |

---

## 2. Layout de Página

```tsx
// Toda página segue este padrão:
<>
  <Header title="Nome da Aba" description="Descrição curta" actions={<BotoesAqui />} />
  <main className="flex-1 overflow-y-auto p-6">
    {/* conteúdo */}
  </main>
</>
```

---

## 3. Cards

```tsx
// Card padrão (wrapper de seção)
<Card className="bg-card border-border">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
    <CardTitle className="text-lg font-semibold text-card-foreground">
      Título
      <span className="ml-2 text-sm font-normal text-muted-foreground">(10 itens)</span>
    </CardTitle>
    <div className="flex items-center gap-2">
      {/* ações */}
    </div>
  </CardHeader>
  <CardContent>
    {/* conteúdo */}
  </CardContent>
</Card>

// Card de grid (KPI, rituais, planos)
<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
  {/* conteúdo */}
</div>
```

---

## 4. Botões

Use sempre o componente `Button` do shadcn/ui:

```tsx
// Primário (CTA principal) — verde
<Button variant="default" size="sm" className="gap-2">
  <Plus className="h-4 w-4" /> Nova Ação
</Button>

// Secundário / Cancelar
<Button variant="outline" size="sm" className="gap-2 bg-transparent">
  <RefreshCw className="h-4 w-4" /> Atualizar
</Button>

// Fantasma (ações em linha de tabela)
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <Edit className="h-4 w-4" />
</Button>

// Destrutivo
<Button variant="destructive" size="sm" className="gap-2">
  <Trash2 className="h-4 w-4" /> Excluir
</Button>
```

---

## 5. Badges e Tags

Use sempre o componente `Badge` do shadcn/ui:

```tsx
// Status ativo (verde)
<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
  Ativo
</Badge>

// Status inativo
<Badge variant="secondary">Inativo</Badge>

// Frequência (DAILY, SEMANAL, MENSAL)
<Badge variant="outline" className="text-[10px] uppercase tracking-wide">SEMANAL</Badge>

// Área / Categoria com cor
<Badge variant="outline" style={{ color: areaDot, backgroundColor: areaDot + "15", borderColor: areaDot + "40" }}>
  <span className="mr-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: areaDot }} />
  Comercial
</Badge>

// Atrasado / Bloqueado
<Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400">
  Atrasado
</Badge>

// Alerta
<Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400">
  Bloqueado
</Badge>
```

---

## 6. Tabelas

```tsx
<div className="rounded-lg border border-border overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableHead>Coluna</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="text-sm text-foreground">Valor</TableCell>
        <TableCell className="text-sm text-muted-foreground">Secundário</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

## 7. Filtros / Toolbar

```tsx
<div className="flex flex-col gap-4 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    {/* Busca */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Buscar..." className="pl-9 bg-background" />
    </div>

    {/* Select de filtro */}
    <Select>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder="Todos os status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

---

## 8. Modais / Dialogs

```tsx
<Dialog>
  <DialogContent className="sm:max-w-[560px]">
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>Descrição opcional</DialogDescription>
    </DialogHeader>
    {/* corpo */}
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancelar</Button>
      <Button variant="default" disabled={saving}>
        {saving ? <Spinner className="h-4 w-4 mr-2" /> : null}
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Modal com cabeçalho colorido (Cockpit)

```tsx
<DialogContent className="overflow-hidden p-0 sm:max-w-[560px]">
  {/* Cabeçalho verde */}
  <div className="bg-primary px-6 py-5 text-primary-foreground">
    <DialogTitle className="text-lg font-bold text-primary-foreground">Título</DialogTitle>
    <DialogDescription className="text-primary-foreground/70 mt-1 text-sm">Sub</DialogDescription>
  </div>
  <div className="p-6">
    {/* corpo */}
  </div>
  <DialogFooter className="px-6 pb-6">
    <Button variant="outline" onClick={onClose}>Cancelar</Button>
    <Button variant="default">Salvar</Button>
  </DialogFooter>
</DialogContent>
```

---

## 9. Estados Vazios / Loading

```tsx
// Carregando
<div className="flex items-center justify-center py-12">
  <Spinner className="h-8 w-8 text-muted-foreground" />
</div>

// Sem resultados
<div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
  <Package className="h-12 w-12 text-muted-foreground/40" />
  <span>Nenhum item encontrado</span>
  <Button variant="outline" size="sm" onClick={clearFilters}>Limpar filtros</Button>
</div>
```

---

## 10. Tipografia

| Elemento | Classes |
|----------|---------|
| Título de seção | `text-lg font-semibold text-card-foreground` |
| Título de card/item | `text-sm font-semibold text-foreground` |
| Descrição / label | `text-sm text-muted-foreground` |
| Texto secundário pequeno | `text-xs text-muted-foreground` |
| Valor de destaque | `text-2xl font-bold text-foreground` |
| Nome em linha de tabela | `font-medium text-foreground` |

---

## 11. Avatares de Participantes

```tsx
// Grupo de avatares sobrepostos
<div className="flex -space-x-1.5">
  {participants.map((pt) => (
    <div
      key={pt.initials}
      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-white"
      style={{ backgroundColor: pt.color }}
      title={pt.name}
    >
      {pt.initials}
    </div>
  ))}
  {extra > 0 && (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">
      +{extra}
    </div>
  )}
</div>
```

---

## 12. Toggle de Visualização (Cards / Lista)

```tsx
<div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
  <button
    className={cn(
      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
      view === "cards"
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
    onClick={() => setView("cards")}
  >
    <LayoutGrid className="h-3.5 w-3.5" /> Cards
  </button>
  <button
    className={cn(
      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
      view === "lista"
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
    onClick={() => setView("lista")}
  >
    <List className="h-3.5 w-3.5" /> Lista
  </button>
</div>
```

---

## 13. Tabs de Área / Categoria

```tsx
{TABS.map((tab) => (
  <button
    key={tab.key}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
      isActive
        ? "bg-foreground text-background"
        : "bg-background text-muted-foreground ring-1 ring-border hover:bg-muted/50"
    )}
  >
    {tab.dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tab.dot }} />}
    {tab.label}
    <span className={cn(
      "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
      isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
    )}>
      {count}
    </span>
  </button>
))}
```

---

## 14. Regras Gerais

- ✅ Use sempre tokens CSS (`bg-card`, `text-foreground`) em vez de classes hardcoded (`bg-white`, `text-slate-900`)
- ✅ Use o componente `Button` do shadcn para todos os botões clicáveis (não `<button>` raw, exceto em elementos muito pequenos dentro de cards)
- ✅ Use o componente `Badge` do shadcn para todas as etiquetas/tags
- ✅ Use `rounded-xl` para cards e `rounded-lg` para containers de tabela
- ✅ Use `shadow-sm` em cards, `hover:shadow-md` em cards clicáveis
- ✅ Dark mode automático via tokens CSS — não adicionar classes `dark:` hardcoded desnecessárias
- ❌ Não use `bg-white` / `bg-slate-*` diretamente
- ❌ Não use `text-slate-*` diretamente — use `text-foreground` ou `text-muted-foreground`
- ❌ Não crie botões `<button>` com `className="... bg-emerald-600 ..."` — use `Button variant="default"`
