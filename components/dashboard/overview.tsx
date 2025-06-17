'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types/database'

interface DashboardStats {
  totalLeads: number
  qualifiedLeads: number
  callsToday: number
  conversionRate: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    callsToday: 0,
    conversionRate: 0
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time subscription for new leads
    const subscription = supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Real-time update received:', payload)
          loadDashboardData() // Reload when leads change
        }
      )
      .subscribe()

    // Refresh data every 5 seconds to catch any missed updates
    const interval = setInterval(loadDashboardData, 5000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  async function loadDashboardData() {
    try {
      // Get all leads
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('🔍 Dashboard data loaded:', leads)
      console.log('🔍 First lead details:', leads?.[0])

      // Calculate stats
      const totalLeads = leads?.length || 0
      const hotLeads = leads?.filter(lead => lead.score && lead.score >= 8).length || 0
      const qualifiedLeads = leads?.filter(lead => lead.score && lead.score >= 6).length || 0
      const today = new Date().toISOString().split('T')[0]
      const callsToday = leads?.filter(lead => 
        lead.created_at.startsWith(today)
      ).length || 0
      
      const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0

      console.log('📊 Stats calculated:', { totalLeads, hotLeads, qualifiedLeads, callsToday, conversionRate })

      setStats({
        totalLeads,
        qualifiedLeads: hotLeads, // Show hot leads as main metric
        callsToday,
        conversionRate
      })

      // Set recent leads (last 10)
      setRecentLeads(leads?.slice(0, 10) || [])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'calling': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'unqualified': 'bg-gray-100 text-gray-800',
      'booked': 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  function getScoreBadge(score?: number) {
    if (!score || score === 0) return 'bg-gray-100 text-gray-800'
    if (score >= 8) return 'bg-red-100 text-red-800'
    if (score >= 6) return 'bg-orange-100 text-orange-800'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  function getScoreText(lead: Lead) {
    if (!lead.score || lead.score === 0) {
      // Check if it's a new lead that should be processing
      const createdTime = new Date(lead.created_at).getTime()
      const now = new Date().getTime()
      const secondsAgo = (now - createdTime) / 1000
      
      if (secondsAgo < 5) {
        return 'Processing...'
      } else if (secondsAgo < 10) {
        return 'Calling...'
      } else {
        return 'Pending'
      }
    }
    
    // Add priority labels
    const score = lead.score
    if (score >= 9) return `${score}/10 🔥 URGENT`
    if (score >= 8) return `${score}/10 🟡 HOT`
    if (score >= 6) return `${score}/10 🟢 QUALIFIED`
    if (score >= 4) return `${score}/10 🔵 WARM`
    return `${score}/10 ❄️ COLD`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Veltrex Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time lead qualification and performance tracking</p>
        
        {/* Manual refresh button for testing */}
        <div className="mt-4 space-x-4">
          <button 
            onClick={() => {
              console.log('Manual refresh clicked')
              loadDashboardData()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            🔄 Refresh Data
          </button>
          
          <button 
            onClick={async () => {
              console.log('Testing Make.com simulation...')
              // Get the most recent lead
              const { data: leads } = await supabase
                .from('leads')
                .select('id')
                .order('created_at', { ascending: false })
                .limit(1)
              
              if (leads?.[0]) {
                const { makeIntegration } = await import('@/lib/make-integration')
                console.log('Manually triggering simulation for lead:', leads[0].id)
                
                // Manually run the simulation
                await makeIntegration.triggerNewLeadWorkflow({
                  lead_id: leads[0].id,
                  contact_info: { name: 'Test', phone: '555-1234', email: 'test@test.com' },
                  source: 'test',
                  agency_id: 'test',
                  timestamp: new Date().toISOString()
                })
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            🧪 Test Simulation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hot Leads (8-10)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.qualifiedLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calls Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.callsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.contact_info.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.contact_info.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.contact_info.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBadge(lead.score)}`}>
                      {getScoreText(lead)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {recentLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No leads yet. Submit a test lead to see it appear here in real-time!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}