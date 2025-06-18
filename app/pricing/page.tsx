export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Veltrex Pricing</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Premium Package */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Premium Package</h2>
            <div className="text-3xl font-bold mb-4">$5,000 setup + $3,500/month</div>
            <ul className="space-y-2 mb-6">
              <li>✓ 60-second AI lead response</li>
              <li>✓ Advanced qualification system</li>
              <li>✓ CRM integrations</li>
              <li>✓ White-label branding</li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Get Started
            </button>
          </div>

          {/* Essential Package */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Essential Package</h2>
            <div className="text-3xl font-bold mb-4">$2,500 setup + $2,000/month</div>
            <ul className="space-y-2 mb-6">
              <li>✓ 60-second AI lead response</li>
              <li>✓ Basic qualification</li>
              <li>✓ Standard integrations</li>
            </ul>
            <button className="w-full bg-gray-600 text-white py-3 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}