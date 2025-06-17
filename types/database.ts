export interface Lead {
  id: string
  agency_id: string
  contact_info: {
    name: string
    phone: string
    email: string
    address?: string
  }
  qualification_data: Record<string, any>
  score?: number
  status: 'new' | 'calling' | 'qualified' | 'unqualified' | 'booked'
  agent_assigned?: string
  source: string
  created_at: string
  updated_at: string
}