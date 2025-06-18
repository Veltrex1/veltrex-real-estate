'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UsageData {
  agency_id: string
  agency_name: string
  api_calls: number
  leads_processed: number
  calls_made: number
  sms_sent: number
  total_cost_cents: number
  monthly_limit: number
  usage_percentage: number
}

interface BillingData {
  agency_id: string
  agency_name: string
  monthly_fee: number
  usage_fees: number
  total_amount: number
  status: 'paid' | 'pending' | 'overdue'
  next_billing_date: string
}

export function UsageBillingDashboard() {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [billingData, setBillingData] = useState<BillingData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
    fetchBillingData()
  }, [selectedPeriod])

  const fetchUsageData = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      const mockUsageData: UsageData[] = [
        {
          agency_id: '1',
          agency_name: 'Premier Realty Group',
          api_calls: 2847,
          leads_processed: 156,
          calls_made: 423,
          sms_sent: 234,
          total_cost_cents: 34750,
          monthly_limit: 50000,
          usage_percentage: 69.5
        },
        {
          agency_id: '2',
          agency_name: 'Sunset Properties',
          api_calls: 1923,
          leads_processed: 89,
          calls_made: 267,
          sms_sent: 145,
          total_cost_cents: 23680,
          monthly_limit: 30000,
          usage_percentage: 78.9
        },
        {
          agency_id: '3',
          agency_name: 'Elite Real Estate',
          api_calls: 3421,
          leads_processed: 203,
          calls_made: 612,
          sms_sent: 387,
          total_cost_cents: 45230,
          monthly_limit: 75000,
          usage_percentage: 60.3
        }
      ]
      setUsageData(mockUsageData)
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  const fetchBillingData = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      const mockBillingData: BillingData[] = [
        {
          agency_id: '1',
          agency_name: 'Premier Realty Group',
          monthly_fee: 350000,
          usage_fees: 34750,
          total_amount: 384750,
          status: 'paid',
          next_billing_date: '2025-07-15'
        },
        {
          agency_id: '2',
          agency_name: 'Sunset Properties',
          monthly_fee: 200000,
          usage_fees: 23680,
          total_amount: 223680,
          status: 'pending',
          next_billing_date: '2025-07-12'
        },
        {
          agency_id: '3',
          agency_name: 'Elite Real Estate',
          monthly_fee: 350000,
          usage_fees: 45230,
          total_amount: 395230,
          status: 'paid',
          next_billing_date: '2025-07-18'
        }
      ]
      setBillingData(mockBillingData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalMonthlyRevenue = billingData.reduce((sum, bill) => sum + bill.total_amount, 0)
  const totalUsageCosts = usageData.reduce((sum, usage) => sum + usage.total_cost_cents, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usage & Billing Dashboard</h1>
        <p className="text-gray-600">Monitor platform usage and billing across all agencies</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="current_month">Current Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="year_to_date">Year to Date</option>
        </select>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyRevenue)}</p>
          <p className="text-sm text-green-600">+12.5% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Usage Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalUsageCosts)}</p>
          <p className="text-sm text-blue-600">Variable pricing</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Agencies</h3>
          <p className="text-2xl font-bold text-gray-900">{billingData.length}</p>
          <p className="text-sm text-green-600">All paying customers</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Revenue/Agency</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(Math.round(totalMonthlyRevenue / billingData.length))}
          </p>
          <p className="text-sm text-purple-600">Per month</p>
        </div>
      </div>

      {/* Usage Tracking Table */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Usage Tracking</h2>
          <p className="text-sm text-gray-600">Real-time usage monitoring and limits</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls Made
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageData.map((usage) => (
                <tr key={usage.agency_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usage.agency_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usage.api_calls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usage.leads_processed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usage.calls_made.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(usage.total_cost_cents)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getUsageColor(usage.usage_percentage)}`}
                          style={{ width: `${Math.min(usage.usage_percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{usage.usage_percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Billing Overview</h2>
          <p className="text-sm text-gray-600">Monthly billing and payment status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingData.map((bill) => (
                <tr key={bill.agency_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bill.agency_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(bill.monthly_fee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(bill.usage_fees)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(bill.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(bill.next_billing_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}