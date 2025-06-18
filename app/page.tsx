import Link from 'next/link'
import { AdvancedRealEstateForm } from '@/components/lead-qualification/lead-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">Veltrex</div>
            <div className="flex space-x-4">
              <Link 
                href="/pricing" 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Get Started
              </Link>
              <Link 
                href="/demo" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Demo
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Veltrex Real Estate AI Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Triple your qualified appointments with 60-second AI lead qualification
          </p>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">60s</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600">300%</div>
              <div className="text-gray-600">More Qualified Leads</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">15+</div>
              <div className="text-gray-600">Hours Saved Weekly</div>
            </div>
          </div>

          <AdvancedRealEstateForm />
          
          {/* Demo Links */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              href="/pricing" 
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-medium text-lg"
            >
              💰 Get Started - $5K Setup
            </Link>
            <Link 
              href="/demo" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              🎯 View Full Demo
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              📊 See Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}