// lib/usage-tracker.ts
import { supabase } from '@/lib/supabase'

export interface UsageEvent {
  agency_id: string
  event_type: 'api_call' | 'lead_processed' | 'call_made' | 'sms_sent' | 'email_sent'
  cost_cents: number
  event_data?: Record<string, any>
  user_id?: string
  metadata?: Record<string, any>
}

// Pricing configuration
export const USAGE_PRICING = {
  api_call: 1,           // $0.01 per API call
  lead_processed: 10,    // $0.10 per lead processed
  call_made: 5,          // $0.05 per minute (you'll multiply by duration)
  sms_sent: 2,           // $0.02 per SMS
  email_sent: 1,         // $0.01 per email
} as const

export class UsageTracker {
  static async logEvent(event: UsageEvent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usage_logs')
        .insert({
          agency_id: event.agency_id,
          event_type: event.event_type,
          cost_cents: event.cost_cents,
          event_data: event.event_data || {},
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.error('Usage logging error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Usage tracking failed:', error)
      return false
    }
  }

  static async logApiCall(agency_id: string, endpoint: string, user_id?: string) {
    return this.logEvent({
      agency_id,
      event_type: 'api_call',
      cost_cents: USAGE_PRICING.api_call,
      event_data: { endpoint },
      user_id
    })
  }

  static async logLeadProcessed(agency_id: string, lead_id: string, processing_type: string) {
    return this.logEvent({
      agency_id,
      event_type: 'lead_processed',
      cost_cents: USAGE_PRICING.lead_processed,
      event_data: { lead_id, processing_type }
    })
  }

  static async logCallMade(agency_id: string, duration_minutes: number, call_data: any) {
    return this.logEvent({
      agency_id,
      event_type: 'call_made',
      cost_cents: USAGE_PRICING.call_made * duration_minutes,
      event_data: { duration_minutes, ...call_data }
    })
  }

  static async logSmsSent(agency_id: string, to_number: string, message_id?: string) {
    return this.logEvent({
      agency_id,
      event_type: 'sms_sent',
      cost_cents: USAGE_PRICING.sms_sent,
      event_data: { to_number, message_id }
    })
  }

  static async logEmailSent(agency_id: string, to_email: string, template?: string) {
    return this.logEvent({
      agency_id,
      event_type: 'email_sent',
      cost_cents: USAGE_PRICING.email_sent,
      event_data: { to_email, template }
    })
  }

  // Get agency usage for current month
  static async getMonthlyUsage(agency_id: string) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('usage_logs')
      .select('event_type, cost_cents')
      .eq('agency_id', agency_id)
      .gte('timestamp', startOfMonth.toISOString())

    if (error) {
      console.error('Error fetching usage:', error)
      return null
    }

    return data.reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1
      acc.total_cost_cents = (acc.total_cost_cents || 0) + log.cost_cents
      return acc
    }, {} as Record<string, number>)
  }

  // Check if agency has exceeded limits
  static async checkUsageLimits(agency_id: string) {
    const usage = await this.getMonthlyUsage(agency_id)
    
    // You can set limits based on package type
    const { data: agency } = await supabase
      .from('agencies')
      .select('package_type, usage_stats')
      .eq('id', agency_id)
      .single()

    if (!agency || !usage) return { withinLimits: true }

    // Example limits (customize based on your packages)
    const limits = {
      essential: { api_calls: 10000, leads: 1000 },
      premium: { api_calls: 50000, leads: 5000 }
    }

    const packageLimits = limits[agency.package_type as keyof typeof limits]
    
    return {
      withinLimits: usage.api_call <= packageLimits?.api_calls && 
                   usage.lead_processed <= packageLimits?.leads,
      usage,
      limits: packageLimits
    }
  }
}

// Middleware function to automatically log API calls
export function withUsageTracking(handler: Function, endpoint: string) {
  return async (req: any, res: any) => {
    try {
      // Extract agency_id from request (customize based on your auth)
      const agency_id = req.headers['x-agency-id'] || req.query.agency_id || req.body.agency_id
      
      if (!agency_id) {
        return res.status(400).json({ error: 'Agency ID required' })
      }

      // Check usage limits before processing
      const limitCheck = await UsageTracker.checkUsageLimits(agency_id)
      if (!limitCheck.withinLimits) {
        return res.status(429).json({ 
          error: 'Usage limits exceeded',
          usage: limitCheck.usage,
          limits: limitCheck.limits
        })
      }

      // Log the API call
      await UsageTracker.logApiCall(agency_id, endpoint, req.user?.id)

      // Call the original handler
      return await handler(req, res)
    } catch (error) {
      console.error('Usage tracking middleware error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Higher-order component for React Server Components
export function withServerUsageTracking<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  endpoint: string
) {
  return async (...args: T) => {
    // Extract agency_id from the arguments (customize based on your setup)
    const agency_id = args[0] // Assuming first arg contains agency_id
    
    if (agency_id) {
      await UsageTracker.logApiCall(agency_id, endpoint)
    }
    
    return handler(...args)
  }
}