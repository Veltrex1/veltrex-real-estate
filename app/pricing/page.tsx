'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async (packageType: 'premium' | 'essential') => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType,
          agencyName: 'Demo Agency', // We'll make this dynamic later
          agencyEmail: 'demo@agency.com',
          agentCount: 10
        })
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      window.location.href = url

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Demo mode: Use contact form for real purchase')
    } finally {
      setIsLoading(false)
    }
  }

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

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Premium Package */}
          <div className="bg-white border-2 border-blue-500 rounded-lg p-8 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">PREMIUM</h2>
              <p className="text-gray-700 font-semibold">Real Estate Revenue Accelerator</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                $5,000 <span className="text-lg font-semibold">setup</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                + $3,500<span className="text-lg font-semibold">/month</span>
              </div>
              <p className="text-green-600 font-bold mt-2">
                1,771% ROI for 15-agent agency
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-sm flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">60-second AI lead response system</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">12-question qualification with smart scoring</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Cold calling campaigns (FSBO, expired)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Advanced follow-up automation</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Real-time performance dashboard</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">CRM integrations (HubSpot, Salesforce)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">White-label branding options</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Priority support & training</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout('premium')}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 mt-auto"
            >
              {isLoading ? 'Processing...' : 'Start with Premium'}
            </button>
          </div>

          {/* Essential Package */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">ESSENTIAL</h2>
              <p className="text-gray-700 font-semibold">Lead Generation Essentials</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                $2,500 <span className="text-lg font-semibold">setup</span>
              </div>
              <div className="text-2xl font-bold text-gray-700">
                + $2,000<span className="text-lg font-semibold">/month</span>
              </div>
              <p className="text-green-600 font-bold mt-2">
                1,150% ROI for 10-agent agency
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-sm flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">60-second AI lead response</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">8-question qualification system</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Basic appointment booking</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Simple follow-up automation</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Standard CRM integrations</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Basic dashboard and reporting</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3 text-lg font-bold">✓</span>
                <span className="font-semibold">Email support</span>
              </li>
            </ul>

            <button
              onClick={() => handleCheckout('essential')}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-800 disabled:opacity-50 mt-auto"
            >
              {isLoading ? 'Processing...' : 'Start with Essential'}
            </button>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-green-700">
              We guarantee 300% more qualified appointments within 30 days or full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}