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
    
    const aiScript = `Hi ${name}, this is Sarah calling from Demo Real Estate Agency. I'm reaching out because you just submitted a request for a free market analysis on our website. 

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

After the questions, if they score 8+, say: "Perfect! Based on what you've told me, I'm going to connect you directly with our specialist. They'll be able to help you immediately."

If 6-7: "Great! I'll have one of our agents call you within the next hour to discuss your specific needs."

If under 6: "Thanks for the information! I'll make sure you receive our weekly market updates and have one of our team members follow up with you."

Always end with: "Thank you for your time today, and we'll be in touch soon!"

Please provide a lead score from 1-10 and a brief summary of their responses at the end of the call.`

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
      wait_for_greeting: true,
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