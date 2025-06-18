'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface OnboardingData {
  // Basic Info
  agencyName: string
  billingEmail: string
  packageType: 'premium' | 'essential'
  
  // Branding
  primaryColor: string
  secondaryColor: string
  customDomain?: string
  
  // Team Setup
  adminName: string
  adminEmail: string
  adminPhone: string
  agentLimit: number
}

export function AgencyOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    agencyName: '',
    billingEmail: '',
    packageType: 'premium',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    agentLimit: 50
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create agency
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          name: data.agencyName,
          package_type: data.packageType,
          billing_email: data.billingEmail,
          monthly_fee: data.packageType === 'premium' ? 3500 : 2000,
          setup_fee: data.packageType === 'premium' ? 5000 : 2500,
          agent_limit: data.agentLimit,
          custom_branding: {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            customDomain: data.customDomain
          },
          onboarding_completed: true,
          subscription_status: 'active'
        })
        .select()
        .single()

      if (agencyError) throw agencyError

      // Create admin user
      await supabase
        .from('agents')
        .insert({
          agency_id: agency.id,
          name: data.adminName,
          email: data.adminEmail,
          phone: data.adminPhone,
          role: 'admin',
          permissions: {
            manage_agents: true,
            view_billing: true,
            edit_settings: true,
            manage_leads: true
          },
          is_active: true
        })

      onComplete()
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('Error creating agency. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agency Name</label>
                <input
                  type="text"
                  value={data.agencyName}
                  onChange={(e) => setData({ ...data, agencyName: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Acme Real Estate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Email</label>
                <input
                  type="email"
                  value={data.billingEmail}
                  onChange={(e) => setData({ ...data, billingEmail: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="billing@acmerealestate.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Package Type</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.packageType === 'essential' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setData({ ...data, packageType: 'essential' })}
                >
                  <h4 className="font-semibold">Essential</h4>
                  <p className="text-sm text-gray-600">$20/month + $25 setup</p>
                  <p className="text-xs mt-1">Up to 25 agents</p>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.packageType === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setData({ ...data, packageType: 'premium' })}
                >
                  <h4 className="font-semibold">Premium</h4>
                  <p className="text-sm text-gray-600">$35/month + $50 setup</p>
                  <p className="text-xs mt-1">Up to 50+ agents</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Brand Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                    className="w-12 h-12 border rounded"
                  />
                  <input
                    type="text"
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                    className="flex-1 p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                    className="w-12 h-12 border rounded"
                  />
                  <input
                    type="text"
                    value={data.secondaryColor}
                    onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                    className="flex-1 p-3 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Custom Domain (Optional)</label>
              <input
                type="text"
                value={data.customDomain || ''}
                onChange={(e) => setData({ ...data, customDomain: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="leads.acmerealestate.com"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Brand Preview</h4>
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: data.primaryColor }}
              >
                <h5 className="font-bold">{data.agencyName || 'Your Agency Name'}</h5>
                <div 
                  className="mt-2 p-2 rounded"
                  style={{ backgroundColor: data.secondaryColor }}
                >
                  Sample branded element
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Admin Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Name</label>
                <input
                  type="text"
                  value={data.adminName}
                  onChange={(e) => setData({ ...data, adminName: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Email</label>
                <input
                  type="email"
                  value={data.adminEmail}
                  onChange={(e) => setData({ ...data, adminEmail: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="john@acmerealestate.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Admin Phone</label>
              <input
                type="tel"
                value={data.adminPhone}
                onChange={(e) => setData({ ...data, adminPhone: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Agent Limit</label>
              <select
                value={data.agentLimit}
                onChange={(e) => setData({ ...data, agentLimit: parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg"
              >
                <option value={25}>25 agents</option>
                <option value={50}>50 agents</option>
                <option value={100}>100 agents</option>
                <option value={250}>250 agents</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review & Complete</h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Agency Details</h4>
                  <p className="text-sm text-gray-600">{data.agencyName}</p>
                  <p className="text-sm text-gray-600">{data.billingEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium">Package</h4>
                  <p className="text-sm text-gray-600 capitalize">{data.packageType}</p>
                  <p className="text-sm text-gray-600">
                    ${data.packageType === 'premium' ? '35' : '20'}/month
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium">Admin Contact</h4>
                <p className="text-sm text-gray-600">{data.adminName}</p>
                <p className="text-sm text-gray-600">{data.adminEmail}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium">Setup Summary</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Agency profile created</li>
                  <li>✓ Custom branding configured</li>
                  <li>✓ Admin user setup</li>
                  <li>✓ Agent limits: {data.agentLimit}</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Agency Onboarding</h2>
        <div className="flex items-center mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  i <= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i}
              </div>
              {i < 4 && (
                <div
                  className={`w-16 h-1 mx-2 transition-all ${
                    i < step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        {step === 4 ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !data.agencyName || !data.billingEmail || !data.adminName || !data.adminEmail}
            className="px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Agency...' : 'Complete Setup'}
          </button>
        ) : (
          <button
            onClick={() => setStep(Math.min(4, step + 1))}
            disabled={
              (step === 1 && (!data.agencyName || !data.billingEmail)) ||
              (step === 3 && (!data.adminName || !data.adminEmail))
            }
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}