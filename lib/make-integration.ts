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
    const BLAND_API_KEY = process.env.BLAND_AI_API_KEY
    
    console.log('🔍 Debug - API Key present:', !!BLAND_API_KEY)
    console.log('🔍 Debug - Lead data:', leadData)
    
    if (!BLAND_API_KEY || BLAND_API_KEY === 'demo-mode') {
      console.log('⚠️ No Bland.ai API key found - using demo mode')
      console.log('🔄 Demo Mode: Would trigger Make.com workflow for new lead')
      console.log('📞 Workflow would: Call lead → Qualify → Route to agent')
      console.log('📧 Follow-up: Auto-nurture sequence for unqualified leads')
      
      // Simulate workflow completion after delay
      setTimeout(() => {
        this.simulateCallCompletion(leadData.lead_id)
      }, 3000) // 3 second delay to simulate AI call
      
      return { success: true, workflow_id: 'demo-workflow-123' }
    }

    // REAL BLAND.AI INTEGRATION
    console.log('🤖 Initiating REAL AI call via Bland.ai')
    console.log('📞 Phone number to call:', leadData.contact_info.phone)
    
    try {
      const callResult = await this.makeBlandAICall(leadData)
      console.log('✅ Bland.ai call initiated successfully:', callResult)
      return { success: true, call_id: callResult.call_id }
    } catch (error: any) {
      console.error('❌ Bland.ai call failed with error:', error)
      console.error('Error details:', error?.message || 'Unknown error')
      
      // Fallback to demo mode if API fails
      console.log('🔄 Falling back to demo mode due to API error')
      setTimeout(() => {
        this.simulateCallCompletion(leadData.lead_id)
      }, 3000)
      return { success: false, error: error?.message || 'Unknown error', fallback: 'demo-mode' }
    }
  }

  // NEW: Real Bland.ai calling function
  private async makeBlandAICall(leadData: MakeWebhookData) {
    const BLAND_API_KEY = process.env.BLAND_AI_API_KEY!
    const PHONE_NUMBER = process.env.BLAND_AI_PHONE_NUMBER || '+15551234567'
    
    // Get lead details for personalized script
    const { contact_info } = leadData
    const name = contact_info.name || 'there'
    
    // Dynamic AI script based on lead data
    const aiScript = this.generateAIScript(leadData)
    
    const callPayload = {
      phone_number: contact_info.phone,
      from: PHONE_NUMBER,
      task: aiScript,
      voice: "maya", // Professional female voice
      voice_settings: {
        speed: 1.0,
        stability: 0.7,
        similarity_boost: 0.8
      },
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bland-ai`,
      metadata: {
        lead_id: leadData.lead_id,
        agency_id: leadData.agency_id,
        lead_name: name,
        lead_email: contact_info.email
      },
      // Call configuration
      answered_by_enabled: true,
      wait_for_greeting: true,
      record: true,
      language: "en-US"
    }

    console.log('📞 Calling', contact_info.phone, 'for lead', leadData.lead_id)

    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callPayload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Bland.ai API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    return result
  }

  // Generate personalized AI script based on lead data
  private generateAIScript(leadData: MakeWebhookData): string {
    const { contact_info } = leadData
    const name = contact_info.name || 'there'
    
    return `Hi ${name}, this is Sarah calling from Demo Real Estate Agency. I'm reaching out because you just submitted a request for a free market analysis on our website. 

I have a few quick questions to make sure I connect you with the right specialist and provide you with the most accurate market information. This should only take about 2-3 minutes. Is now a good time?

[Wait for response]

Great! Let me ask you a few questions:

1. I see you're interested in real estate - are you primarily looking to buy a home, sell your current home, or both?

2. What's your timeline for making a move? Are you looking to do something in the next month or two, or is this more of a longer-term plan?

3. For buying - do you currently have mortgage pre-approval, or would that be something you need to work on?

4. What area or neighborhoods are you most interested in?

5. Are you currently working with any other real estate agents?

6. What's the main thing driving your decision to buy or sell right now?

Based on your answers, I'll score this lead from 1-10:
- 8-10: Ready to move quickly, qualified, highly motivated
- 6-7: Good timeline and interest, some qualification needed  
- 4-5: Longer timeline but serious interest
- 1-3: Just researching, long-term follow-up needed

After the questions, if they score 8+, say: "Perfect! Based on what you've told me, I'm going to connect you directly with [Agent Name], our specialist for [area]. They'll be able to help you immediately."

If 6-7: "Great! I'll have one of our agents call you within the next hour to discuss your specific needs."

If under 6: "Thanks for the information! I'll make sure you receive our weekly market updates and have one of our team members follow up with you."

Always end with: "Thank you for your time today, and we'll be in touch soon!"

Please provide a lead score from 1-10 and a brief summary of their responses at the end of the call.`
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