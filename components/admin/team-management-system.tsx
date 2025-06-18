'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Agent {
  id: string
  agency_id: string
  agency_name: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'agent'
  permissions: {
    can_view_leads: boolean
    can_edit_leads: boolean
    can_make_calls: boolean
    can_view_analytics: boolean
    can_manage_team: boolean
  }
  is_active: boolean
  last_login: string | null
  created_at: string
}

interface Agency {
  id: string
  name: string
  package_type: string
  agent_limit: number
  current_agents: number
}

export function TeamManagementSystem() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [selectedAgency, setSelectedAgency] = useState<string>('all')
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newAgent, setNewAgent] = useState({
    agency_id: '',
    name: '',
    email: '',
    phone: '',
    role: 'agent' as 'admin' | 'manager' | 'agent',
    permissions: {
      can_view_leads: true,
      can_edit_leads: false,
      can_make_calls: true,
      can_view_analytics: false,
      can_manage_team: false
    }
  })

  useEffect(() => {
    fetchAgencies()
    fetchAgents()
  }, [])

  const fetchAgencies = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      const mockAgencies: Agency[] = [
        {
          id: '1',
          name: 'Premier Realty Group',
          package_type: 'premium',
          agent_limit: 50,
          current_agents: 23
        },
        {
          id: '2',
          name: 'Sunset Properties',
          package_type: 'essential',
          agent_limit: 25,
          current_agents: 12
        },
        {
          id: '3',
          name: 'Elite Real Estate',
          package_type: 'premium',
          agent_limit: 50,
          current_agents: 34
        }
      ]
      setAgencies(mockAgencies)
    } catch (error) {
      console.error('Error fetching agencies:', error)
    }
  }

  const fetchAgents = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      const mockAgents: Agent[] = [
        {
          id: '1',
          agency_id: '1',
          agency_name: 'Premier Realty Group',
          name: 'Sarah Johnson',
          email: 'sarah@premierrealty.com',
          phone: '+1-555-0123',
          role: 'admin',
          permissions: {
            can_view_leads: true,
            can_edit_leads: true,
            can_make_calls: true,
            can_view_analytics: true,
            can_manage_team: true
          },
          is_active: true,
          last_login: '2025-06-18T14:30:00Z',
          created_at: '2025-05-15T10:00:00Z'
        },
        {
          id: '2',
          agency_id: '1',
          agency_name: 'Premier Realty Group',
          name: 'Mike Chen',
          email: 'mike@premierrealty.com',
          phone: '+1-555-0124',
          role: 'manager',
          permissions: {
            can_view_leads: true,
            can_edit_leads: true,
            can_make_calls: true,
            can_view_analytics: true,
            can_manage_team: false
          },
          is_active: true,
          last_login: '2025-06-18T09:15:00Z',
          created_at: '2025-05-16T11:00:00Z'
        },
        {
          id: '3',
          agency_id: '2',
          agency_name: 'Sunset Properties',
          name: 'Lisa Rodriguez',
          email: 'lisa@sunsetprops.com',
          phone: '+1-555-0125',
          role: 'agent',
          permissions: {
            can_view_leads: true,
            can_edit_leads: false,
            can_make_calls: true,
            can_view_analytics: false,
            can_manage_team: false
          },
          is_active: true,
          last_login: '2025-06-17T16:45:00Z',
          created_at: '2025-05-20T14:00:00Z'
        }
      ]
      setAgents(mockAgents)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching agents:', error)
      setLoading(false)
    }
  }

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedAgencyData = agencies.find(a => a.id === newAgent.agency_id)
    if (!selectedAgencyData) return

    if (selectedAgencyData.current_agents >= selectedAgencyData.agent_limit) {
      alert('Agency has reached its agent limit. Please upgrade package or remove inactive agents.')
      return
    }

    try {
      // In real implementation, this would be a Supabase insert
      const agent: Agent = {
        id: Date.now().toString(),
        agency_id: newAgent.agency_id,
        agency_name: selectedAgencyData.name,
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone,
        role: newAgent.role,
        permissions: newAgent.permissions,
        is_active: true,
        last_login: null,
        created_at: new Date().toISOString()
      }

      setAgents([...agents, agent])
      setShowAddAgent(false)
      setNewAgent({
        agency_id: '',
        name: '',
        email: '',
        phone: '',
        role: 'agent',
        permissions: {
          can_view_leads: true,
          can_edit_leads: false,
          can_make_calls: true,
          can_view_analytics: false,
          can_manage_team: false
        }
      })
    } catch (error) {
      console.error('Error adding agent:', error)
      alert('Error adding agent. Please try again.')
    }
  }

  const toggleAgentStatus = async (agentId: string) => {
    try {
      setAgents(agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, is_active: !agent.is_active }
          : agent
      ))
    } catch (error) {
      console.error('Error updating agent status:', error)
    }
  }

  const updatePermissions = async (agentId: string, permission: string, value: boolean) => {
    try {
      setAgents(agents.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              permissions: { ...agent.permissions, [permission]: value }
            }
          : agent
      ))
    } catch (error) {
      console.error('Error updating permissions:', error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'agent': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never'
    return new Date(lastLogin).toLocaleDateString()
  }

  const filteredAgents = selectedAgency === 'all' 
    ? agents 
    : agents.filter(agent => agent.agency_id === selectedAgency)

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage agents, roles, and permissions across all agencies</p>
        </div>
        <button
          onClick={() => setShowAddAgent(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Agent
        </button>
      </div>

      {/* Agency Filter */}
      <div className="mb-6">
        <select
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Agencies</option>
          {agencies.map(agency => (
            <option key={agency.id} value={agency.id}>
              {agency.name} ({agency.current_agents}/{agency.agent_limit} agents)
            </option>
          ))}
        </select>
      </div>

      {/* Agency Limits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {agencies.map(agency => (
          <div key={agency.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900">{agency.name}</h3>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Agents</span>
                <span>{agency.current_agents}/{agency.agent_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${
                    agency.current_agents >= agency.agent_limit 
                      ? 'bg-red-500' 
                      : agency.current_agents >= agency.agent_limit * 0.8 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(agency.current_agents / agency.agent_limit) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 capitalize">{agency.package_type} Package</p>
          </div>
        ))}
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600">Manage roles and permissions for all agents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.agency_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(agent.role)}`}>
                      {agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatLastLogin(agent.last_login)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleAgentStatus(agent.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        agent.is_active 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Panel */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
          <p className="text-sm text-gray-600">Manage what each agent can access and do</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(agent.role)}`}>
                    {agent.role}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(agent.permissions).map(([permission, value]) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePermissions(agent.id, permission, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!agent.is_active}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {permission.replace('can_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Agent</h2>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                <select
                  value={newAgent.agency_id}
                  onChange={(e) => setNewAgent({ ...newAgent, agency_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Agency</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} ({agency.current_agents}/{agency.agent_limit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as 'admin' | 'manager' | 'agent' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAgent(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}