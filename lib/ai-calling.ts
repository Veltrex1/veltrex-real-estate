interface CallLeadParams {
  leadId: string
  name: string
  phone: string
}

export async function initiateAICall(params: CallLeadParams) {
  // TODO: Replace with your actual Bland.ai API key
  const BLAND_API_KEY = process.env.BLAND_AI_API_KEY || 'demo-mode'
  
  const callData = {
    phone_number: params.phone,
    task: `Hi ${params.name}, this is Sarah from Demo Real Estate Agency. I'm calling about your request for a free market analysis. I have a few quick questions to help provide you with the most accurate information. Is now a good time for a 2-minute conversation?

Here are the questions I need to ask:
1. Are you currently looking to buy or sell a property?
2. What's your timeline for making a move?
3. Do you have pre-approval or financing in place?
4. What's your price range?
5. Are you working with any other agents currently?

Please ask these questions conversationally and score the lead 1-10 based on their responses. A score of 8+ means they should be immediately transferred to a live agent.`,
    voice: "maya",
    reduce_latency: true,
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/call-webhook`,
    metadata: {
      lead_id: params.leadId
    }
  }

  if (BLAND_API_KEY === 'demo-mode') {
    console.log('🤖 Demo mode: Would call', params.phone, 'with AI script')
    console.log('📞 Call would include qualification questions and scoring')
    
    // Simulate successful call initiation
    return { 
      success: true, 
      call_id: 'demo-call-' + Date.now(),
      message: 'Demo: AI call would be initiated within 60 seconds'
    }
  }

  try {
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callData)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ AI call initiated successfully:', result)
      return { success: true, ...result }
    } else {
      console.error('❌ AI call failed:', result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error('❌ AI calling error:', error)
    return { success: false, error }
  }
}