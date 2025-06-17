export interface LeadQualificationData {
  intent: string
  timeline: string
  financing_status: string
  working_with_agent: string
  urgency_reason: string
  price_range: string
  target_area: string
}

export function generateAICallingScript(leadData: any): string {
  const name = leadData.contact_info?.name || 'there'
  const intent = leadData.qualification_data?.intent || 'buy'
  const timeline = leadData.qualification_data?.timeline || 'unknown'
  const area = leadData.qualification_data?.target_area || 'your area'
  
  const baseScript = `Hi ${name}, this is Sarah calling from [Agency Name]. I'm reaching out because you submitted a request for a free market analysis. I see you're interested in ${intent === 'buy' ? 'buying' : intent === 'sell' ? 'selling' : 'real estate'} in ${area}. Do you have 2-3 minutes to chat?

[Wait for response]

Great! I have a few quick questions to make sure I connect you with the right specialist and provide you with the most accurate market information.

QUALIFICATION QUESTIONS TO ASK:

1. CONFIRM INTENT: You mentioned you're looking to ${intent}. Is this your primary residence or an investment property?

2. TIMELINE VERIFICATION: You indicated your timeline is ${timeline}. What's driving that timeline? Is there any flexibility?

3. FINANCIAL QUALIFICATION: 
   ${getFinancingQuestions(leadData.qualification_data?.financing_status)}

4. PROPERTY SPECIFICS: What type of property are you most interested in? Any specific neighborhoods in ${area}?

5. MOTIVATION: What's the main reason you're ${intent === 'buy' ? 'looking to buy' : 'considering selling'} right now?

6. COMPETITION CHECK: Are you currently working with any other agents, or is this your first time reaching out?

7. DECISION TIMELINE: Who else is involved in this decision-making process?

8. NEXT STEPS: Based on what you've told me, I'd love to set up a brief meeting with one of our specialists. When would be a good time this week?

SCORING GUIDELINES:
- 9-10 points: Ready now, pre-approved/cash, no other agent, motivated by necessity
- 7-8 points: 1-3 month timeline, qualified or getting qualified, open to working with us
- 5-6 points: 3-6 month timeline, need financial planning, some urgency
- 3-4 points: 6+ month timeline, exploring options, low urgency
- 1-2 points: Just researching, no timeline, not qualified

TRANSFER CRITERIA:
- Score 8+: "I'm going to connect you right now with [Agent Name], our specialist for ${area}."
- Score 6-7: "Let me schedule you for a consultation this week with one of our agents."
- Score 5 or below: "I'll make sure you receive our market updates and have one of our team members follow up with you."

END CALL NOTES:
Please provide the lead score (1-10) and a brief summary of their situation for our agent team.`

  return baseScript
}

function getFinancingQuestions(financingStatus: string): string {
  switch (financingStatus) {
    case 'pre_approved':
      return 'I see you mentioned you\'re pre-approved. What price range were you approved for? Any changes in your financial situation since then?'
    
    case 'cash_buyer':
      return 'You mentioned paying cash - that puts you in a great position! Are you looking to make a quick purchase?'
    
    case 'need_approval':
      return 'You mentioned needing to get pre-approved. Have you spoken with any lenders yet? Would you like a recommendation for trusted mortgage professionals?'
    
    case 'need_to_sell_first':
      return 'I see you need to sell your current home first. Have you had it evaluated recently? Would you be interested in a simultaneous buy/sell strategy?'
    
    default:
      return 'What\'s your current situation with financing? Have you spoken with any lenders or looked into your options?'
  }
}

export function generateFollowUpSequence(score: number, leadData: any): string[] {
  const name = leadData.contact_info?.name || 'there'
  const timeline = leadData.qualification_data?.timeline || 'unknown'
  
  if (score >= 8) {
    return [
      // High-priority immediate follow-up
      `Hi ${name}, this is a follow-up to our call earlier. As discussed, I'm sending over the market analysis for ${leadData.qualification_data?.target_area}. When would be good for your consultation?`,
      
      `${name}, just wanted to confirm our appointment tomorrow. I have some exclusive listings that match your criteria perfectly.`,
      
      `Quick update ${name} - we just got a new listing in ${leadData.qualification_data?.target_area} that fits exactly what you're looking for. Can you chat briefly?`
    ]
  } else if (score >= 6) {
    return [
      // Warm lead nurture sequence
      `Hi ${name}, great talking with you about your ${timeline} timeline. I'm sending you the market report we discussed. Any questions?`,
      
      `${name}, saw some new listings come up in ${leadData.qualification_data?.target_area} that might interest you. Want me to send them over?`,
      
      `Hope you're doing well ${name}! Any updates on your ${leadData.qualification_data?.intent} timeline? Happy to help when you're ready.`
    ]
  } else {
    return [
      // Long-term nurture sequence
      `Hi ${name}, sending you this month's market update for ${leadData.qualification_data?.target_area}. Let me know if you have any questions!`,
      
      `${name}, thought you'd find this article about ${leadData.qualification_data?.intent === 'buy' ? 'home buying tips' : 'selling strategies'} helpful.`,
      
      `Quick market update ${name} - ${leadData.qualification_data?.target_area} prices have ${Math.random() > 0.5 ? 'increased' : 'stabilized'} this quarter.`
    ]
  }
}

export function getAgentRecommendation(score: number, leadData: any): string {
  if (score >= 9) {
    return 'URGENT: Assign top-performing agent immediately. Lead is ready to move within 30 days.'
  } else if (score >= 7) {
    return 'HIGH PRIORITY: Assign experienced agent within 2 hours. Strong potential for quick conversion.'
  } else if (score >= 5) {
    return 'QUALIFIED: Assign to available agent within 24 hours. Good nurture potential.'
  } else {
    return 'NURTURE: Add to drip campaign. Agent follow-up within 48-72 hours.'
  }
}