import { supabase } from '@/lib/supabase'

interface MakeWebhookData {
  lead_id: string
  contact_info: {
    name: string
    phone: string
    email: string
  }
  source: string
  agency_id: string
  timestamp: string
}

interface QualificationResults {
  intent: string
  timeline: string
  financing: string
  price_range: string
  current_agent: string
  motivation: string
  score: number
}

export class MakeIntegration {
  private webhookUrl: string
  
  constructor() {
    // This will be your Make.com webhook URL when you create the scenarios
    this.webhookUrl = process.env.MAKE_WEBHOOK_URL || 'demo-mode'
  }

  async triggerNewLeadWorkflow(leadData: MakeWebhookData) {
    if (this.webhookUrl === 'demo-mode') {
      console.log('🔄 Demo Mode: Would trigger Make.com workflow for new lead')
      console.log('📞 Workflow would: Call lead → Qualify → Route to agent')
      console.log('📧 Follow-up: Auto-nurture sequence for unqualified leads')
      
      // Simulate workflow completion after delay
      setTimeout(() => {
        this.simulateCallCompletion(leadData.lead_id)
      }, 3000) // 3 second delay to simulate AI call
      
      return { success: true, workflow_id: 'demo-workflow-123' }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'new_lead',
          data: leadData
        })
      })

      const result = await response.json()
      console.log('✅ Make.com workflow triggered:', result)
      return result
    } catch (error) {
      console.error('❌ Make.com workflow error:', error)
      return { success: false, error }
    }
  }

  async triggerFollowUpSequence(leadId: string, leadScore: number) {
    const workflowData = {
      event_type: 'follow_up_needed',
      data: {
        lead_id: leadId,
        score: leadScore,
        sequence_type: leadScore >= 6 ? 'warm_nurture' : 'cold_nurture'
      }
    }

    if (this.webhookUrl === 'demo-mode') {
      console.log('📧 Demo Mode: Would trigger follow-up sequence')
      console.log('📅 Sequence type:', workflowData.data.sequence_type)
      return { success: true, sequence_id: 'demo-sequence-456' }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      })

      return await response.json()
    } catch (error) {
      console.error('Follow-up sequence error:', error)
      return { success: false, error }
    }
  }

  async notifyAgent(leadId: string, agentEmail: string, qualification: QualificationResults) {
    const notificationData = {
      event_type: 'qualified_lead',
      data: {
        lead_id: leadId,
        agent_email: agentEmail,
        qualification_score: qualification.score,
        urgency: qualification.score >= 9 ? 'high' : 'normal',
        lead_summary: {
          intent: qualification.intent,
          timeline: qualification.timeline,
          score: qualification.score
        }
      }
    }

    if (this.webhookUrl === 'demo-mode') {
      console.log('🔔 Demo Mode: Would notify agent immediately')
      console.log('👤 Agent:', agentEmail)
      console.log('📊 Lead score:', qualification.score)
      return { success: true, notification_id: 'demo-notification-789' }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      })

      return await response.json()
    } catch (error) {
      console.error('Agent notification error:', error)
      return { success: false, error }
    }
  }

  // Demo mode simulation - simplified to avoid CORS issues
  private async simulateCallCompletion(leadId: string) {
    console.log('🤖 Simulating AI call completion for lead:', leadId)
    
    // First, verify the lead exists
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('id, score, status')
      .eq('id', leadId)
      .single()

    console.log('🔍 Existing lead check:', { existingLead, fetchError })

    if (fetchError || !existingLead) {
      console.error('❌ Lead not found:', leadId)
      return
    }
    
    // Simulate random qualification results
    const mockResults = {
      intent: 'buy',
      timeline: '3_months',
      financing: 'pre_approved',
      price_range: '500k_750k',
      current_agent: 'no',
      motivation: 'very_motivated'
    }
    
    const score = Math.floor(Math.random() * 4) + 7 // Random score 7-10
    
    try {
      console.log('🔄 Attempting to update lead in database...')
      console.log('📝 Lead ID:', leadId)
      console.log('📊 Score:', score)
      console.log('📋 Qualification data:', mockResults)

      // Update the lead directly in the database (skip webhook for demo)
      const { data: updateData, error: leadError } = await supabase
        .from('leads')
        .update({
          qualification_data: mockResults,
          score: score,
          status: score >= 8 ? 'qualified' : 'unqualified',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select() // Add select to see what was updated

      console.log('📤 Database update result:', { updateData, leadError })

      if (leadError) {
        console.error('❌ Lead update failed:', leadError)
        throw leadError
      }

      if (!updateData || updateData.length === 0) {
        console.error('❌ No rows updated - lead ID might not exist or RLS blocking update')
        
        // Try a simple update without complex data
        const { data: simpleUpdate, error: simpleError } = await supabase
          .from('leads')
          .update({ score: score })
          .eq('id', leadId)
          .select()

        console.log('🔄 Simple update attempt:', { simpleUpdate, simpleError })
        return
      }

      console.log('✅ Lead updated successfully:', updateData)

      // Skip call log creation for now to avoid RLS issues
      console.log('⏭️ Skipping call log creation due to RLS')
      
      console.log(`✅ Demo call completed - Lead scored: ${score}/10`)
      console.log(`📊 Lead status: ${score >= 8 ? 'QUALIFIED' : 'Unqualified'}`)
    } catch (error) {
      console.error('❌ Demo simulation error:', error)
    }
  }
}

// Export singleton instance
export const makeIntegration = new MakeIntegration()