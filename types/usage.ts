export interface UsageEvent {
  agency_id: string
  event_type: 'api_call' | 'lead_processed' | 'call_made' | 'sms_sent' | 'email_sent'
  cost_cents: number
  event_data?: Record<string, any>
  user_id?: string
}

export interface UsageData {
  api_calls: number
  leads_processed: number
  calls_made: number
  sms_sent: number
  email_sent: number
  total_cost_cents: number
}