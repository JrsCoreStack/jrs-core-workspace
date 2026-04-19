import { SkeletonTopbar, SkeletonKanbanBoard } from "@/components/ui/rf-skeleton"

export default function PlanosDeAcaoLoading() {
  return (
    <div style={{ padding: "20px", maxWidth: 1400, margin: "0 auto" }}>
      <SkeletonTopbar />
      <SkeletonKanbanBoard cols={4} />
    </div>
  )
}
