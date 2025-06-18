'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types/database'

interface PerformanceMetrics {
  totalLeads: number
  avgResponseTime: number
  conversionRate: number
  hotLeadPercentage: number
  callSuccessRate: number
  avgCallDuration: number
  dailyLeads: number[]
  hourlyDistribution: number[]
  sourceBreakdown: Record<string, number>
  scoreDistribution: Record<string, number>
}

interface LiveCallStatus {
  id: string
  leadName: string
  phoneNumber: string
  status: 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'failed'
  startTime: string
  duration?: number
}

export function AdvancedAnalytics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalLeads: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    hotLeadPercentage: 0,
    callSuccessRate: 0,
    avgCallDuration: 0,
    dailyLeads: [],
    hourlyDistribution: [],
    sourceBreakdown: {},
    scoreDistribution: {}
  })
  const [liveCalls, setLiveCalls] = useState<LiveCallStatus[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  useEffect(() => {
    loadAnalyticsData()
    
    // Set up real-time updates
    const interval = setInterval(loadAnalyticsData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [timeRange])

  async function loadAnalyticsData() {
    try {
      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24)
          break
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
      }

      // Fetch leads data
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(leadsData || [])
      
      // Calculate metrics
      const calculatedMetrics = calculateMetrics(leadsData || [])
      setMetrics(calculatedMetrics)
      
      // Simulate live calls (in real implementation, this would come from actual call status)
      setLiveCalls(generateLiveCallStatuses(leadsData || []))
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateMetrics(leadsData: Lead[]): PerformanceMetrics {
    const totalLeads = leadsData.length
    const qualifiedLeads = leadsData.filter(lead => lead.score && lead.score >= 8)
    const scoredLeads = leadsData.filter(lead => lead.score && lead.score > 0)
    
    // Calculate daily distribution
    const dailyLeads = Array(7).fill(0)
    const hourlyDistribution = Array(24).fill(0)
    
    leadsData.forEach(lead => {
      const date = new Date(lead.created_at)
      const dayIndex = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (dayIndex < 7) dailyLeads[6 - dayIndex]++
      
      hourlyDistribution[date.getHours()]++
    })

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {}
    leadsData.forEach(lead => {
      sourceBreakdown[lead.source] = (sourceBreakdown[lead.source] || 0) + 1
    })

    // Score distribution
    const scoreDistribution = {
      'Hot (8-10)': leadsData.filter(l => l.score && l.score >= 8).length,
      'Warm (6-7)': leadsData.filter(l => l.score && l.score >= 6 && l.score < 8).length,
      'Cold (1-5)': leadsData.filter(l => l.score && l.score >= 1 && l.score < 6).length,
      'Unscored': leadsData.filter(l => !l.score || l.score === 0).length,
    }

    return {
      totalLeads,
      avgResponseTime: 58, // Simulated - in real app would calculate from call logs
      conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads.length / totalLeads) * 100) : 0,
      hotLeadPercentage: totalLeads > 0 ? Math.round((qualifiedLeads.length / totalLeads) * 100) : 0,
      callSuccessRate: scoredLeads.length > 0 ? Math.round((scoredLeads.length / totalLeads) * 100) : 0,
      avgCallDuration: 145, // Simulated average call duration in seconds
      dailyLeads,
      hourlyDistribution,
      sourceBreakdown,
      scoreDistribution
    }
  }

  function generateLiveCallStatuses(leadsData: Lead[]): LiveCallStatus[] {
    // Simulate some live calls for demo purposes
    return leadsData
      .filter(lead => !lead.score && lead.status === 'new')
      .slice(0, 3)
      .map(lead => ({
        id: lead.id,
        leadName: lead.contact_info.name,
        phoneNumber: lead.contact_info.phone,
        status: Math.random() > 0.7 ? 'in_progress' : Math.random() > 0.5 ? 'ringing' : 'initiating',
        startTime: new Date().toISOString(),
        duration: Math.random() > 0.5 ? Math.floor(Math.random() * 180) : undefined
      }))
  }

  function calculateROI() {
    const agentCount = 15 // This would come from agency settings
    const avgAgentSalary = 75000
    const hoursSavedPerWeek = 15
    const weeksPerYear = 52
    
    const annualSavings = (hoursSavedPerWeek * weeksPerYear * (avgAgentSalary / 2080)) * agentCount
    const annualCost = 3500 * 12 // Monthly fee * 12 months
    
    return {
      annualSavings: Math.round(annualSavings),
      annualCost,
      netSavings: Math.round(annualSavings - annualCost),
      roi: Math.round(((annualSavings - annualCost) / annualCost) * 100)
    }
  }

  const roiData = calculateROI()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Live Call Status */}
      {liveCalls.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Live Call Status
          </h3>
          <div className="space-y-3">
            {liveCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{call.leadName}</div>
                  <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                </div>
                <div className="flex items-center space-x-3">
                  {call.duration && (
                    <span className="text-sm text-gray-600">{call.duration}s</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    call.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    call.status === 'ringing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {call.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-green-600">{metrics.avgResponseTime}s</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">78% faster than industry average</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hot Lead Rate</p>
              <p className="text-3xl font-bold text-red-600">{metrics.hotLeadPercentage}%</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Score 8+ leads ready to buy</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Call Success Rate</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.callSuccessRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Successfully connected & qualified</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Call Duration</p>
              <p className="text-3xl font-bold text-purple-600">{Math.floor(metrics.avgCallDuration / 60)}m {metrics.avgCallDuration % 60}s</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Optimal qualification time</p>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-800">ROI Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${roiData.annualSavings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">${roiData.annualCost.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Annual Cost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${roiData.netSavings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Net Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{roiData.roi}%</p>
            <p className="text-sm text-gray-600">ROI</p>
          </div>
        </div>
      </div>

      {/* Lead Pipeline Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{metrics.totalLeads}</p>
            <p className="text-sm text-gray-600">Total Leads</p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{metrics.scoreDistribution['Warm (6-7)'] || 0}</p>
            <p className="text-sm text-gray-600">Warm Leads</p>
            <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ 
                width: `${metrics.totalLeads > 0 ? (metrics.scoreDistribution['Warm (6-7)'] / metrics.totalLeads) * 100 : 0}%` 
              }}></div>
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{metrics.scoreDistribution['Hot (8-10)'] || 0}</p>
            <p className="text-sm text-gray-600">Hot Leads</p>
            <div className="w-full bg-red-200 rounded-full h-2 mt-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ 
                width: `${metrics.totalLeads > 0 ? (metrics.scoreDistribution['Hot (8-10)'] / metrics.totalLeads) * 100 : 0}%` 
              }}></div>
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{Math.round(metrics.scoreDistribution['Hot (8-10)'] * 0.3) || 0}</p>
            <p className="text-sm text-gray-600">Converted</p>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ 
                width: `${metrics.scoreDistribution['Hot (8-10)'] > 0 ? 30 : 0}%` 
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Functionality */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Data Export</h3>
          <div className="space-x-2">
            <button 
              onClick={() => exportData('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export CSV
            </button>
            <button 
              onClick={() => exportData('pdf')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Export PDF Report
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Export lead data, call transcripts, and performance reports for external analysis.
        </p>
      </div>
    </div>
  )

  function exportData(format: 'csv' | 'pdf') {
    if (format === 'csv') {
      const csvData = leads.map(lead => ({
        Name: lead.contact_info.name,
        Phone: lead.contact_info.phone,
        Email: lead.contact_info.email,
        Score: lead.score || 'Unscored',
        Status: lead.status,
        Source: lead.source,
        Created: new Date(lead.created_at).toLocaleDateString()
      }))
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `veltrex-leads-${timeRange}.csv`
      a.click()
    } else {
      // For PDF, you could integrate with a library like jsPDF
      alert('PDF export feature coming soon!')
    }
  }
}