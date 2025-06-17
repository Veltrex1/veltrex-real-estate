import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Make.com webhook received:', body)

    // Handle different webhook types
    let result
    switch (body.event_type) {
      case 'call_completed':
        result = await handleCallCompleted(body)
        break
      case 'lead_qualified':
        result = await handleLeadQualified(body)
        break
      case 'agent_notification':
        result = await handleAgentNotification(body)
        break
      default:
        console.log('Unknown webhook event:', body.event_type)
        result = NextResponse.json({ success: true, message: 'Event received' })
    }

    // Add CORS headers to response
    result.headers.set('Access-Control-Allow-Origin', '*')
    return result

  } catch (error) {
    console.error('Webhook error:', error)
    const errorResponse = NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

async function handleCallCompleted(data: any) {
  const { lead_id, call_results, qualification_score, call_recording } = data

  try {
    // Update lead with qualification results
    const { error: leadError } = await supabase
      .from('leads')
      .update({
        qualification_data: call_results,
        score: qualification_score,
        status: qualification_score >= 8 ? 'qualified' : 'unqualified',
        updated_at: new Date().toISOString()
      })
      .eq('id', lead_id)

    if (leadError) throw leadError

    // Create call log entry
    const { error: logError } = await supabase
      .from('call_logs')
      .insert({
        lead_id: lead_id,
        qualification_results: call_results,
        recording_url: call_recording,
        ai_analysis: {
          score: qualification_score,
          timestamp: new Date().toISOString()
        }
      })

    if (logError) throw logError

    console.log(`Lead ${lead_id} updated with score: ${qualification_score}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Call completed and lead updated' 
    })
  } catch (error) {
    console.error('Error handling call completion:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

async function handleLeadQualified(data: any) {
  const { lead_id, agent_email, agency_id } = data

  try {
    // Update lead with assigned agent
    const { error } = await supabase
      .from('leads')
      .update({
        agent_assigned: agent_email,
        status: 'booked',
        updated_at: new Date().toISOString()
      })
      .eq('id', lead_id)

    if (error) throw error

    console.log(`Qualified lead ${lead_id} assigned to ${agent_email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead assigned to agent' 
    })
  } catch (error) {
    console.error('Error assigning lead:', error)
    return NextResponse.json(
      { error: 'Failed to assign lead' },
      { status: 500 }
    )
  }
}

async function handleAgentNotification(data: any) {
  // This would typically send emails/SMS to agents
  console.log('Agent notification triggered:', data)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Agent notified' 
  })
}

// Also handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    status: 'Veltrex Make.com webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}