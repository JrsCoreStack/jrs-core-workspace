import { SkeletonCockpit } from "@/components/ui/rf-skeleton"

export default function CockpitLoading() {
  return (
    <div style={{
      padding: "20px",
      maxWidth: 1400,
      margin: "0 auto",
    }}>
      <SkeletonCockpit />
    </div>
  )
}
