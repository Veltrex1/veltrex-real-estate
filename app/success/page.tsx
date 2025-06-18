'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [customerEmail, setCustomerEmail] = useState('')

  useEffect(() => {
    // In a real app, you'd verify the session with Stripe
    // For now, we'll just show the success message
    if (sessionId) {
      console.log('Payment successful for session:', sessionId)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Veltrex! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            Your payment has been processed successfully. We're setting up your AI-powered lead qualification system now.
          </p>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next:</h3>
            <div className="text-left space-y-3">
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</span>
                <span className="text-blue-800">Our team will contact you within 1 hour to begin setup</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</span>
                <span className="text-blue-800">We'll integrate with your existing CRM and lead sources</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</span>
                <span className="text-blue-800">Your AI qualification system goes live within 24-48 hours</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</span>
                <span className="text-blue-800">Start seeing 300% more qualified appointments within 30 days</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need immediate assistance?</h3>
            <p className="text-gray-600 mb-3">
              Our onboarding team is standing by to help you get started.
            </p>
            <div className="space-y-2">
              <div>
                <strong>Email:</strong> onboarding@veltrex.com
              </div>
              <div>
                <strong>Phone:</strong> (555) 123-VELTREX
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Access Your Dashboard
            </Link>
            
            <Link 
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>

          {/* Session Info (for testing) */}
          {sessionId && (
            <div className="mt-8 text-xs text-gray-400">
              Session ID: {sessionId}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}