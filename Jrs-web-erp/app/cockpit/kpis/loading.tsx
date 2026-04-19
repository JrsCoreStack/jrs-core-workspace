import { SkeletonKpisPage } from "@/components/ui/rf-skeleton"

export default function KpisLoading() {
  return (
    <div style={{ padding: "20px", maxWidth: 1400, margin: "0 auto" }}>
      <SkeletonKpisPage />
    </div>
  )
}
