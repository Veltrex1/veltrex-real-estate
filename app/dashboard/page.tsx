import { DashboardNavigation } from '@/components/dashboard/navigation'
import { DashboardOverview } from '@/components/dashboard/overview'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <DashboardOverview />
    </div>
  )
}