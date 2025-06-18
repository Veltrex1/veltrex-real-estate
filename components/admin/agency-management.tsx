'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Agency {
  id: string
  name: string
  package_type: string
  subscription_status: string
  billing_email: string
  monthly_fee: number
  setup_fee: number
  agent_limit: number
  created_at: string
  updated_at: string
  onboarding_completed: boolean
  usage_stats: {
    total_leads: number
    monthly_calls: number
    last_activity: string
  }
}

interface Agent {
  id: string
  agency_id: string
  name: string
  email: string
  phone: string
  role: string
  is_active: boolean
  last_login: string
}

export function AgencyManagement() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'overview' | 'agency-detail' | 'onboarding'>('overview')

  useEffect(() => {
    loadAgencies()
  }, [])

  async function loadAgencies() {
    try {
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false })

      if (agenciesError) throw agenciesError

      // Calculate usage stats for each agency
      const agenciesWithStats = await Promise.all(
        (agenciesData || []).map(async (agency) => {
          const { data: leads } = await supabase
            .from('leads')
            .select('id, created_at')
            .eq('agency_id', agency.id)

          const { data: callLogs } = await supabase
            .from('call_logs')
            .select('id, created_at')
            .eq('lead_id', leads?.[0]?.id || 'none')

          const thisMonth = new Date()
          thisMonth.setDate(1)
          const monthlyLeads = leads?.filter(lead => 
            new Date(lead.created_at) >= thisMonth
          ) || []

          return {
            ...agency,
            usage_stats: {
              total_leads: leads?.length || 0,
              monthly_calls: callLogs?.length || 0,
              last_activity: leads?.[0]?.created_at || agency.created_at
            }
          }
        })
      )

      setAgencies(agenciesWithStats)
    } catch (error) {
      console.error('Error loading agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAgencyAgents(agencyId: string) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      console.error('Error loading agents:', error)
    }
  }

  function calculateMRR() {
    return agencies.reduce((total, agency) => {
      return total + (agency.subscription_status === 'active' ? agency.monthly_fee : 0)
    }, 0)
  }

  function calculateChurnRate() {
    const totalAgencies = agencies.length
    const activeAgencies = agencies.filter(a => a.subscription_status === 'active').length
    return totalAgencies > 0 ? Math.round(((totalAgencies - activeAgencies) / totalAgencies) * 100) : 0
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading agencies...</div>
  }

  if (view === 'agency-detail' && selectedAgency) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('overview')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to All Agencies
          </button>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Agency
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              View Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedAgency.name}</h2>
              <p className="text-gray-600">{selectedAgency.package_type.toUpperCase()} Package</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                selectedAgency.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAgency.subscription_status.toUpperCase()}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold">${selectedAgency.monthly_fee.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Setup Fee: ${selectedAgency.setup_fee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Usage This Month</p>
              <p className="text-2xl font-bold">{selectedAgency.usage_stats.total_leads}</p>
              <p className="text-sm text-gray-600 mt-2">Total Leads Processed</p>
            </div>
          </div>
        </div>

        {/* Team Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Team Management</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Add Agent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{agent.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agent.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.last_login ? new Date(agent.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
        <button 
          onClick={() => setView('onboarding')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Agency
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agencies</p>
              <p className="text-2xl font-bold text-gray-900">{agencies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${calculateMRR().toLocaleString()}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Agencies</p>
              <p className="text-2xl font-bold text-gray-900">
                {agencies.filter(a => a.subscription_status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{calculateChurnRate()}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agencies List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Agencies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agency.name}</div>
                      <div className="text-sm text-gray-500">{agency.billing_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {agency.package_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      agency.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : agency.subscription_status === 'trial' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agency.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${agency.monthly_fee.toLocaleString()}/mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agency.usage_stats.total_leads} leads
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAgency(agency)
                        loadAgencyAgents(agency.id)
                        setView('agency-detail')
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Dashboard
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Suspend
                    </button>
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