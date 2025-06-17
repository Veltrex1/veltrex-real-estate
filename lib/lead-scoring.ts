export interface QualificationData {
  intent: 'buy' | 'sell' | 'both' | 'just_looking'
  timeline: 'immediate' | '3_months' | '6_months' | '1_year' | 'unsure'
  financing: 'pre_approved' | 'need_approval' | 'cash' | 'unsure'
  price_range: 'under_300k' | '300k_500k' | '500k_750k' | '750k_1m' | 'over_1m'
  current_agent: 'yes' | 'no' | 'had_one'
  motivation: 'very_motivated' | 'somewhat' | 'exploring'
}

export function calculateLeadScore(data: Partial<QualificationData>): number {
  let score = 0

  // Intent scoring (0-3 points)
  switch (data.intent) {
    case 'buy':
    case 'sell':
      score += 3
      break
    case 'both':
      score += 2
      break
    case 'just_looking':
      score += 1
      break
  }

  // Timeline scoring (0-3 points)
  switch (data.timeline) {
    case 'immediate':
      score += 3
      break
    case '3_months':
      score += 2
      break
    case '6_months':
      score += 1
      break
    case '1_year':
    case 'unsure':
      score += 0
      break
  }

  // Financing scoring (0-2 points)
  switch (data.financing) {
    case 'pre_approved':
    case 'cash':
      score += 2
      break
    case 'need_approval':
      score += 1
      break
    case 'unsure':
      score += 0
      break
  }

  // Agent status (0-2 points)
  switch (data.current_agent) {
    case 'no':
      score += 2
      break
    case 'had_one':
      score += 1
      break
    case 'yes':
      score += 0
      break
  }

  return Math.min(score, 10) // Cap at 10
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Hot Lead', color: 'red' }
  if (score >= 6) return { label: 'Warm Lead', color: 'orange' }
  if (score >= 4) return { label: 'Cool Lead', color: 'yellow' }
  return { label: 'Cold Lead', color: 'gray' }
}