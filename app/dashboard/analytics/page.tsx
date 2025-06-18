import { DashboardNavigation } from '@/components/dashboard/navigation'
import { AdvancedAnalytics } from '@/components/dashboard/analytics'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdvancedAnalytics />
      </div>
    </div>
  )
}