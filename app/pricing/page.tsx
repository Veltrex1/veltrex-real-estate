'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CheckoutFormData {
  packageType: 'premium' | 'essential'
  agencyName: string
  agencyEmail: string
  agentCount: number
}

export default function PricingPage() {
  const [formData, setFormData] = useState<CheckoutFormData>({
    packageType: 'premium',
    agencyName: '',
    agencyEmail: '',
    agentCount: 10
  })
  const [isLoading, setIsLoading] = useState(false)

  const packages = {
    premium: {
      name: 'Real Estate Revenue Accelerator',
      setupFee: 5000,
      monthlyFee: 3500,
      features: [
        '60-second AI lead response system',
        '12-question qualification with smart scoring',
        'Cold calling campaigns (FSBO, expired, geographic)',
        'Advanced follow-up automation (12-month sequences)',
        'Real-time performance dashboard with ROI tracking',
        'CRM integrations (HubSpot, Salesforce, Pipedrive)',
        'White-label branding options',
        'Priority support & training',
        'Custom automation workflows'
      ],
      roi: '1,771% annually for 15-agent agency',
      savings: '$51,500 monthly savings'
    },
    essential: {
      name: 'Lead Generation Essentials',
      setupFee: 2500,
      monthlyFee: 2000,
      features: [
        '60-second AI lead response',
        '8-question qualification system',
        'Basic appointment booking',
        'Simple follow-up automation',
        'Standard CRM integrations',
        'Basic dashboard and reporting',
        'Email support'
      ],
      roi: '1,150% annually for 10-agent agency',
      savings: '$25,000 monthly savings'
    }
  }

  const handleCheckout = async () => {
    if (!formData.agencyName || !formData.agencyEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      window.location.href = url

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPackage = packages[formData.packageType]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Veltrex
            </Link>
            <div className="flex space-x-4">
              <Link href="/demo" className="text-gray-600 hover:text-gray-900">
                Demo
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Veltrex Package
          </h1>
          <p className="text-xl text-gray-600">
            Start generating 300% more qualified appointments within 30 days
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Package Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Select Package</h2>
            
            {/* Premium Package */}
            <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              formData.packageType === 'premium' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, packageType: 'premium' }))}
            >
              <div className="flex items-center mb-4">
                <input
                  type="radio"
                  name="package"
                  value="premium"
                  checked={formData.packageType === 'premium'}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value as any }))}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-xl font-semibold">PREMIUM</h3>
                  <p className="text-gray-600">{packages.premium.name}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  ${packages.premium.setupFee.toLocaleString()} setup + ${packages.premium.monthlyFee.toLocaleString()}/month
                </div>
                <p className="text-green-600 font-semibold">{packages.premium.roi}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {packages.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Essential Package */}
            <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              formData.packageType === 'essential' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, packageType: 'essential' }))}
            >
              <div className="flex items-center mb-4">
                <input
                  type="radio"
                  name="package"
                  value="essential"
                  checked={formData.packageType === 'essential'}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value as any }))}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-xl font-semibold">ESSENTIAL</h3>
                  <p className="text-gray-600">{packages.essential.name}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  ${packages.essential.setupFee.toLocaleString()} setup + ${packages.essential.monthlyFee.toLocaleString()}/month
                </div>
                <p className="text-green-600 font-semibold">{packages.essential.roi}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {packages.essential.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Agency Information</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Real Estate Agency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.agencyEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="owner@agency.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Agents
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.agentCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentCount: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Setup Fee:</span>
                  <span className="font-medium">${selectedPackage.setupFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Fee:</span>
                  <span className="font-medium">${selectedPackage.monthlyFee.toLocaleString()}/month</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>First Month Total:</span>
                  <span>${(selectedPackage.setupFee + selectedPackage.monthlyFee).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">30-Day Money-Back Guarantee</h4>
              <p className="text-sm text-green-700">
                We guarantee 300% more qualified appointments within 30 days or full refund.
              </p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading || !formData.agencyName || !formData.agencyEmail}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Checkout...' : `Start with ${formData.packageType === 'premium' ? 'Premium' : 'Essential'} Package`}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Secure payment processed by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}