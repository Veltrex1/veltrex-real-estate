import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🤖 Bland.ai webhook received:', body)

    const { 
      call_id, 
      call_status, 
      call_length, 
      recording_url, 
      transcript, 
      metadata 
    } = body

    // Extract lead information from metadata
    const leadId = metadata?.lead_id
    const agencyId = metadata?.agency_id
    
    if (!leadId) {
      console.error('No lead_id in webhook metadata')
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })
    }

    // Process completed calls
    if (call_status === 'completed' || call_status === 'ended') {
      console.log(`📞 Call completed for lead ${leadId}`)
      
      // Extract qualification score from transcript
      const score = extractScoreFromTranscript(transcript)
      const qualificationSummary = extractQualificationSummary(transcript)
      
      // Update lead with call results
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          score: score,
          status: score >= 8 ? 'qualified' : score >= 6 ? 'warm' : 'cold',
          qualification_data: {
            ...qualificationSummary,
            ai_call_completed: true,
            call_timestamp: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (leadError) {
        console.error('Failed to update lead:', leadError)
      } else {
        console.log(`✅ Lead ${leadId} updated with score: ${score}`)
      }

      // Create call log
      const { error: logError } = await supabase
        .from('call_logs')
        .insert({
          lead_id: leadId,
          call_duration: call_length,
          recording_url: recording_url,
          transcript: transcript,
          ai_analysis: {
            call_id: call_id,
            score: score,
            status: call_status,
            qualification_summary: qualificationSummary,
            processed_at: new Date().toISOString()
          }
        })

      if (logError) {
        console.warn('Failed to create call log:', logError)
      }

      // Trigger follow-up actions based on score
      if (score >= 8) {
        console.log('🔥 Hot lead detected - notifying agents immediately')
        // TODO: Send immediate agent notification
      } else if (score >= 6) {
        console.log('🟡 Warm lead - scheduling follow-up')
        // TODO: Schedule follow-up call
      } else {
        console.log('❄️ Cold lead - adding to nurture sequence')
        // TODO: Add to email nurture sequence
      }

    } else if (call_status === 'failed' || call_status === 'no-answer') {
      console.log(`📞 Call failed for lead ${leadId}: ${call_status}`)
      
      // Update lead status
      await supabase
        .from('leads')
        .update({
          status: 'call_failed',
          qualification_data: {
            ai_call_failed: true,
            failure_reason: call_status,
            failed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      // TODO: Schedule retry or alternative contact method
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('Bland.ai webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Extract lead score from AI transcript
function extractScoreFromTranscript(transcript: string): number {
  if (!transcript) return 0
  
  // Look for score patterns in transcript
  const scorePatterns = [
    /score[:\s]+(\d+)/i,
    /(\d+)\/10/i,
    /rate[d]?[:\s]+(\d+)/i,
    /lead score[:\s]+(\d+)/i
  ]
  
  for (const pattern of scorePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      const score = parseInt(match[1])
      if (score >= 1 && score <= 10) {
        console.log(`📊 Extracted score: ${score} from transcript`)
        return score
      }
    }
  }
  
  // Fallback: analyze transcript sentiment and keywords
  const transcript_lower = transcript.toLowerCase()
  
  // High-value keywords
  if (transcript_lower.includes('ready now') || 
      transcript_lower.includes('pre-approved') || 
      transcript_lower.includes('cash buyer') ||
      transcript_lower.includes('need to move quickly')) {
    return 9
  }
  
  // Medium-value keywords
  if (transcript_lower.includes('looking to buy') || 
      transcript_lower.includes('next month') ||
      transcript_lower.includes('getting pre-approved')) {
    return 7
  }
  
  // Low-value keywords
  if (transcript_lower.includes('just looking') || 
      transcript_lower.includes('researching') ||
      transcript_lower.includes('maybe next year')) {
    return 3
  }
  
  // Default score
  return 5
}

// Extract qualification summary from transcript
function extractQualificationSummary(transcript: string): Record<string, any> {
  if (!transcript) return {}
  
  const summary: Record<string, any> = {}
  const transcript_lower = transcript.toLowerCase()
  
  // Extract intent
  if (transcript_lower.includes('buy') && transcript_lower.includes('sell')) {
    summary.intent = 'both'
  } else if (transcript_lower.includes('sell')) {
    summary.intent = 'sell'
  } else if (transcript_lower.includes('buy')) {
    summary.intent = 'buy'
  }
  
  // Extract timeline
  if (transcript_lower.includes('immediately') || transcript_lower.includes('right now')) {
    summary.timeline = 'immediate'
  } else if (transcript_lower.includes('next month') || transcript_lower.includes('30 days')) {
    summary.timeline = '1_month'
  } else if (transcript_lower.includes('few months') || transcript_lower.includes('3 months')) {
    summary.timeline = '3_months'
  }
  
  // Extract financing status
  if (transcript_lower.includes('pre-approved') || transcript_lower.includes('pre approved')) {
    summary.financing = 'pre_approved'
  } else if (transcript_lower.includes('cash')) {
    summary.financing = 'cash_buyer'
  } else if (transcript_lower.includes('need approval') || transcript_lower.includes('get approved')) {
    summary.financing = 'need_approval'
  }
  
  return summary
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    status: 'Bland.ai webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}