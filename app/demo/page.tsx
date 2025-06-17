import { AdvancedRealEstateForm } from '@/components/lead-qualification/lead-form'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Demo Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demo Real Estate Agency</h1>
              <p className="text-gray-600">Powered by Veltrex AI Platform</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">📞 Response Time</div>
              <div className="text-2xl font-bold text-green-600">60 Seconds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Your Free Market Analysis
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Discover what your home is worth in today's market
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  60-Second Response
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  AI-Powered Qualification
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                  Expert Agent Match
                </div>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <div className="mb-12">
            <AdvancedRealEstateForm />
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Response</h3>
              <p className="text-gray-600">Our AI calls you within 60 seconds of submitting your information.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Qualification</h3>
              <p className="text-gray-600">AI asks the right questions to understand your specific needs.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Match</h3>
              <p className="text-gray-600">Connect with the right agent based on your qualifications.</p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">🎯 Live Demo Environment</h4>
            <p className="text-yellow-700">
              This is a working demonstration of the Veltrex AI platform. 
              Submit the form to see the 60-second response system in action!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}