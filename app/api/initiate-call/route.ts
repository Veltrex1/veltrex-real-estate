import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json()
    const BLAND_API_KEY = process.env.BLAND_AI_API_KEY
    const PHONE_NUMBER = process.env.BLAND_AI_PHONE_NUMBER || '+15551234567'
    
    console.log('🔍 Server-side API Key present:', !!BLAND_API_KEY)
    console.log('📞 Initiating call for lead:', leadData.lead_id)
    console.log('📱 Phone number to call:', leadData.contact_info.phone)
    
    if (!BLAND_API_KEY) {
      console.log('⚠️ No Bland.ai API key found on server')
      return NextResponse.json({ 
        success: false, 
        error: 'No Bland.ai API key configured' 
      })
    }

    // Create the AI calling payload
    const { contact_info } = leadData
    const name = contact_info.name || 'there'
    
    const aiScript = `Hello! This is Sarah from Demo Real Estate Agency. You just requested a market analysis on our website. I have 5 quick questions to help match you with the right agent. This will take 2 minutes. Ready?

Ask these questions one by one and wait for responses:

Question 1: Are you looking to buy or sell a home?

Question 2: What's your timeline - next month, few months, or just exploring?

Question 3: Do you have mortgage pre-approval or need help with financing?

Question 4: What area are you interested in?

Question 5: Are you working with another agent currently?

After all 5 questions, score the lead:
- Score 9-10 if: Ready soon AND pre-approved/cash AND no other agent
- Score 7-8 if: Ready in 1-3 months AND getting financing AND available
- Score 5-6 if: 3-6 month timeline OR needs financing help OR has some urgency
- Score 1-4 if: Just exploring OR working with another agent OR no timeline

End by saying: "Thanks! Your score is [NUMBER] out of 10. We'll have an agent contact you soon. Have a great day!"`

    const callPayload = {
      phone_number: contact_info.phone,
      // Remove the 'from' field to use Bland.ai's default number
      task: aiScript,
      voice: "maya",
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
      answered_by_enabled: true,
      wait_for_greeting: false,  // Don't wait - start talking immediately
      record: true,
      language: "en-US"
    }

    console.log('📞 Making Bland.ai API call...')

    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Bland.ai API error:', response.status, errorText)
      return NextResponse.json({
        success: false,
        error: `Bland.ai API error: ${response.status} - ${errorText}`
      })
    }

    const result = await response.json()
    console.log('✅ Bland.ai call initiated successfully:', result)

    return NextResponse.json({
      success: true,
      call_id: result.call_id,
      message: 'AI call initiated successfully'
    })

  } catch (error: any) {
    console.error('❌ Server error initiating call:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to initiate call'
    }, { status: 500 })
  }
}