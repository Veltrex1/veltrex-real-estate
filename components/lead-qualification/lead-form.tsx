'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { makeIntegration } from '@/lib/make-integration'

interface RealEstateLeadData {
  // Contact Info
  name: string
  phone: string
  email: string
  
  // Property Intent
  intent: 'buy' | 'sell' | 'both' | 'rent' | 'just_looking'
  property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial'
  
  // Timeline & Urgency
  timeline: 'immediate' | '1_month' | '3_months' | '6_months' | '1_year' | 'no_timeline'
  urgency_reason: 'job_relocation' | 'family_growth' | 'downsizing' | 'investment' | 'first_time_buyer' | 'upgrade' | 'other'
  
  // Financial Qualification
  financing_status: 'pre_approved' | 'need_approval' | 'cash_buyer' | 'need_to_sell_first' | 'exploring_options'
  price_range: 'under_200k' | '200k_400k' | '400k_600k' | '600k_800k' | '800k_1m' | 'over_1m'
  down_payment_ready: 'yes' | 'mostly' | 'saving_up' | 'unsure'
  
  // Current Situation
  current_home_status: 'own_need_to_sell' | 'own_keeping' | 'renting' | 'living_with_family' | 'other'
  working_with_agent: 'no' | 'yes_not_exclusive' | 'yes_exclusive' | 'had_bad_experience'
  
  // Location & Preferences
  target_area: string
  must_haves: string[]
  deal_breakers: string[]
  
  // Communication
  best_contact_time: 'morning' | 'afternoon' | 'evening' | 'weekend' | 'anytime'
  preferred_contact: 'phone' | 'text' | 'email' | 'video_call'
  
  source: string
}

export function AdvancedRealEstateForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<RealEstateLeadData>>({
    source: 'website',
    must_haves: [],
    deal_breakers: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const updateFormData = (updates: Partial<RealEstateLeadData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleArrayUpdate = (field: 'must_haves' | 'deal_breakers', value: string, checked: boolean) => {
    const currentArray = formData[field] || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    updateFormData({ [field]: newArray })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Get agency
      const { data: agencies } = await supabase
        .from('agencies')
        .select('id')
        .limit(1)

      const agencyId = agencies?.[0]?.id

      // Calculate lead score
      const score = calculateRealEstateScore(formData as RealEstateLeadData)

      // Create lead in database
      const { data, error } = await supabase
        .from('leads')
        .insert({
          agency_id: agencyId,
          contact_info: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email
          },
          qualification_data: formData,
          score: score,
          status: score >= 8 ? 'qualified' : score >= 6 ? 'warm' : 'cold',
          source: formData.source
        })
        .select()

      if (error) throw error

      // Trigger Make.com workflow
      await makeIntegration.triggerNewLeadWorkflow({
        lead_id: data[0].id,
        contact_info: {
          name: formData.name!,
          phone: formData.phone!,
          email: formData.email!
        },
        source: formData.source!,
        agency_id: agencyId,
        timestamp: new Date().toISOString()
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const score = calculateRealEstateScore(formData as RealEstateLeadData)
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-4">
            Thank You, {formData.name}!
          </h3>
          <div className="mb-6">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
              score >= 8 ? 'bg-red-100 text-red-800' : 
              score >= 6 ? 'bg-orange-100 text-orange-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              Priority Score: {score}/10 - {score >= 8 ? 'HIGH PRIORITY' : score >= 6 ? 'QUALIFIED LEAD' : 'NURTURE LEAD'}
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            {score >= 8 
              ? "A senior agent will call you within 60 seconds to discuss your immediate needs."
              : score >= 6
              ? "We'll call you within 5 minutes to discuss your timeline and preferences."
              : "We'll call you within 2 hours to understand how we can best help you."
            }
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>What happens next:</strong><br/>
              1. AI qualification call ({score >= 8 ? '60 seconds' : score >= 6 ? '5 minutes' : '2 hours'})<br/>
              2. Matched with specialist agent<br/>
              3. Personalized market analysis<br/>
              4. Property search or listing strategy
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Get Your Free Market Analysis</h2>
          <div className="text-sm text-gray-500">Step {step} of 4</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What's your primary interest? *</label>
            <select
              value={formData.intent || ''}
              onChange={(e) => updateFormData({ intent: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your primary goal</option>
              <option value="buy">Buying a home</option>
              <option value="sell">Selling my home</option>
              <option value="both">Both buying and selling</option>
              <option value="rent">Looking to rent</option>
              <option value="just_looking">Just researching the market</option>
            </select>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!formData.name || !formData.phone || !formData.email || !formData.intent}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Timeline
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Timeline & Urgency</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">When are you looking to {formData.intent === 'buy' ? 'buy' : formData.intent === 'sell' ? 'sell' : 'move'}? *</label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { value: 'immediate', label: 'Ready now (0-30 days)' },
                { value: '1_month', label: '1-2 months' },
                { value: '3_months', label: '2-3 months' },
                { value: '6_months', label: '3-6 months' },
                { value: '1_year', label: '6-12 months' },
                { value: 'no_timeline', label: 'Just researching' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timeline"
                    value={option.value}
                    checked={formData.timeline === option.value}
                    onChange={(e) => updateFormData({ timeline: e.target.value as any })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">What's driving your decision? *</label>
            <select
              value={formData.urgency_reason || ''}
              onChange={(e) => updateFormData({ urgency_reason: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select primary reason</option>
              <option value="job_relocation">Job relocation</option>
              <option value="family_growth">Growing family</option>
              <option value="downsizing">Downsizing</option>
              <option value="investment">Investment opportunity</option>
              <option value="first_time_buyer">First-time buyer</option>
              <option value="upgrade">Upgrading home</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target area or city *</label>
            <input
              type="text"
              value={formData.target_area || ''}
              onChange={(e) => updateFormData({ target_area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Downtown Austin, Westside neighborhoods"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.timeline || !formData.urgency_reason || !formData.target_area}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Continue to Financing
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Financial Qualification</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">What's your financing status? *</label>
            <div className="space-y-2">
              {[
                { value: 'pre_approved', label: 'Pre-approved for a mortgage' },
                { value: 'need_approval', label: 'Need to get pre-approved' },
                { value: 'cash_buyer', label: 'Paying cash' },
                { value: 'need_to_sell_first', label: 'Need to sell current home first' },
                { value: 'exploring_options', label: 'Still exploring financing options' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="financing_status"
                    value={option.value}
                    checked={formData.financing_status === option.value}
                    onChange={(e) => updateFormData({ financing_status: e.target.value as any })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Price range you're considering *</label>
            <select
              value={formData.price_range || ''}
              onChange={(e) => updateFormData({ price_range: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select price range</option>
              <option value="under_200k">Under $200,000</option>
              <option value="200k_400k">$200,000 - $400,000</option>
              <option value="400k_600k">$400,000 - $600,000</option>
              <option value="600k_800k">$600,000 - $800,000</option>
              <option value="800k_1m">$800,000 - $1,000,000</option>
              <option value="over_1m">Over $1,000,000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Are you working with another agent? *</label>
            <div className="space-y-2">
              {[
                { value: 'no', label: 'No, not working with anyone' },
                { value: 'yes_not_exclusive', label: 'Yes, but no exclusive agreement' },
                { value: 'yes_exclusive', label: 'Yes, signed exclusive agreement' },
                { value: 'had_bad_experience', label: 'Had bad experience, looking for new agent' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="working_with_agent"
                    value={option.value}
                    checked={formData.working_with_agent === option.value}
                    onChange={(e) => updateFormData({ working_with_agent: e.target.value as any })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!formData.financing_status || !formData.price_range || !formData.working_with_agent}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Final Step
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Communication Preferences</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Best time to contact you *</label>
            <select
              value={formData.best_contact_time || ''}
              onChange={(e) => updateFormData({ best_contact_time: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select best time</option>
              <option value="morning">Morning (8AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 5PM)</option>
              <option value="evening">Evening (5PM - 8PM)</option>
              <option value="weekend">Weekends</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred contact method *</label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { value: 'phone', label: 'Phone call' },
                { value: 'text', label: 'Text message' },
                { value: 'email', label: 'Email' },
                { value: 'video_call', label: 'Video call' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="preferred_contact"
                    value={option.value}
                    checked={formData.preferred_contact === option.value}
                    onChange={(e) => updateFormData({ preferred_contact: e.target.value as any })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.best_contact_time || !formData.preferred_contact}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Get My Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced Real Estate Lead Scoring Algorithm
function calculateRealEstateScore(data: RealEstateLeadData): number {
  let score = 0

  // Intent scoring (0-3 points)
  switch (data.intent) {
    case 'buy':
    case 'sell':
      score += 3
      break
    case 'both':
      score += 2.5
      break
    case 'rent':
      score += 1
      break
    case 'just_looking':
      score += 0.5
      break
  }

  // Timeline scoring (0-3 points)
  switch (data.timeline) {
    case 'immediate':
      score += 3
      break
    case '1_month':
      score += 2.5
      break
    case '3_months':
      score += 2
      break
    case '6_months':
      score += 1
      break
    case '1_year':
      score += 0.5
      break
    case 'no_timeline':
      score += 0
      break
  }

  // Financing scoring (0-2 points)
  switch (data.financing_status) {
    case 'pre_approved':
    case 'cash_buyer':
      score += 2
      break
    case 'need_approval':
      score += 1.5
      break
    case 'need_to_sell_first':
      score += 1
      break
    case 'exploring_options':
      score += 0.5
      break
  }

  // Agent status scoring (0-1.5 points)
  switch (data.working_with_agent) {
    case 'no':
    case 'had_bad_experience':
      score += 1.5
      break
    case 'yes_not_exclusive':
      score += 1
      break
    case 'yes_exclusive':
      score += 0
      break
  }

  // Urgency reason bonus (0-0.5 points)
  if (['job_relocation', 'family_growth'].includes(data.urgency_reason!)) {
    score += 0.5
  }

  return Math.min(Math.round(score), 10) // Cap at 10
}