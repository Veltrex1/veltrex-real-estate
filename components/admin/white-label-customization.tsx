'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface WhiteLabelConfig {
  agency_id: string
  agency_name: string
  branding: {
    logo_url: string
    primary_color: string
    secondary_color: string
    custom_domain: string
    company_name: string
    tagline: string
    footer_text: string
  }
  features: {
    hide_veltrex_branding: boolean
    custom_login_page: boolean
    custom_dashboard_layout: boolean
    custom_email_templates: boolean
  }
  contact_info: {
    support_email: string
    support_phone: string
    address: string
  }
  package_type: string
  is_active: boolean
}

export function WhiteLabelCustomization() {
  const [configs, setConfigs] = useState<WhiteLabelConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<WhiteLabelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchWhiteLabelConfigs()
  }, [])

  const fetchWhiteLabelConfigs = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      const mockConfigs: WhiteLabelConfig[] = [
        {
          agency_id: '1',
          agency_name: 'Premier Realty Group',
          branding: {
            logo_url: 'https://via.placeholder.com/150x50/1f2937/ffffff?text=Premier+Realty',
            primary_color: '#1f2937',
            secondary_color: '#f59e0b',
            custom_domain: 'leads.premierrealty.com',
            company_name: 'Premier Realty Group',
            tagline: 'Your Premier Real Estate Partner',
            footer_text: '© 2025 Premier Realty Group. All rights reserved.'
          },
          features: {
            hide_veltrex_branding: true,
            custom_login_page: true,
            custom_dashboard_layout: true,
            custom_email_templates: true
          },
          contact_info: {
            support_email: 'support@premierrealty.com',
            support_phone: '+1-555-PREMIER',
            address: '123 Main St, Business District, CA 90210'
          },
          package_type: 'premium',
          is_active: true
        },
        {
          agency_id: '2',
          agency_name: 'Sunset Properties',
          branding: {
            logo_url: 'https://via.placeholder.com/150x50/dc2626/ffffff?text=Sunset+Props',
            primary_color: '#dc2626',
            secondary_color: '#fbbf24',
            custom_domain: 'app.sunsetproperties.com',
            company_name: 'Sunset Properties',
            tagline: 'Where Dreams Meet Reality',
            footer_text: '© 2025 Sunset Properties. Licensed Real Estate Brokerage.'
          },
          features: {
            hide_veltrex_branding: true,
            custom_login_page: false,
            custom_dashboard_layout: true,
            custom_email_templates: false
          },
          contact_info: {
            support_email: 'help@sunsetproperties.com',
            support_phone: '+1-555-SUNSET',
            address: '456 Ocean View Dr, Coastal City, CA 90211'
          },
          package_type: 'essential',
          is_active: true
        }
      ]
      setConfigs(mockConfigs)
      if (mockConfigs.length > 0) {
        setSelectedConfig(mockConfigs[0])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching white-label configs:', error)
      setLoading(false)
    }
  }

  const updateBranding = async (field: string, value: string) => {
    if (!selectedConfig) return

    const updatedConfig = {
      ...selectedConfig,
      branding: {
        ...selectedConfig.branding,
        [field]: value
      }
    }

    setSelectedConfig(updatedConfig)
    setConfigs(configs.map(config => 
      config.agency_id === selectedConfig.agency_id ? updatedConfig : config
    ))

    // In real implementation, update Supabase here
  }

  const updateFeature = async (feature: string, enabled: boolean) => {
    if (!selectedConfig) return

    const updatedConfig = {
      ...selectedConfig,
      features: {
        ...selectedConfig.features,
        [feature]: enabled
      }
    }

    setSelectedConfig(updatedConfig)
    setConfigs(configs.map(config => 
      config.agency_id === selectedConfig.agency_id ? updatedConfig : config
    ))
  }

  const updateContactInfo = async (field: string, value: string) => {
    if (!selectedConfig) return

    const updatedConfig = {
      ...selectedConfig,
      contact_info: {
        ...selectedConfig.contact_info,
        [field]: value
      }
    }

    setSelectedConfig(updatedConfig)
    setConfigs(configs.map(config => 
      config.agency_id === selectedConfig.agency_id ? updatedConfig : config
    ))
  }

  const generateCustomCSS = (config: WhiteLabelConfig) => {
    return `
/* Custom CSS for ${config.agency_name} */
:root {
  --primary-color: ${config.branding.primary_color};
  --secondary-color: ${config.branding.secondary_color};
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: ${config.branding.primary_color}dd;
  border-color: ${config.branding.primary_color}dd;
}

.text-primary {
  color: var(--primary-color);
}

.bg-primary {
  background-color: var(--primary-color);
}

.border-primary {
  border-color: var(--primary-color);
}
`.trim()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White-Label Customization</h1>
          <p className="text-gray-600">Customize branding and features for each agency</p>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {previewMode ? 'Exit Preview' : 'Preview Mode'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agency Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Agency</h2>
            </div>
            <div className="p-4 space-y-2">
              {configs.map((config) => (
                <button
                  key={config.agency_id}
                  onClick={() => setSelectedConfig(config)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedConfig?.agency_id === config.agency_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{config.agency_name}</div>
                  <div className="text-sm text-gray-500 capitalize">{config.package_type} Package</div>
                  <div className="text-xs text-gray-400">{config.branding.custom_domain}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          {selectedConfig && (
            <div className="space-y-6">
              {/* Branding Configuration */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Branding Configuration</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={selectedConfig.branding.logo_url} 
                        alt="Logo" 
                        className="h-12 w-auto border border-gray-200 rounded"
                      />
                      <input
                        type="url"
                        value={selectedConfig.branding.logo_url}
                        onChange={(e) => updateBranding('logo_url', e.target.value)}
                        placeholder="Logo URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedConfig.branding.primary_color}
                          onChange={(e) => updateBranding('primary_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedConfig.branding.primary_color}
                          onChange={(e) => updateBranding('primary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={selectedConfig.branding.secondary_color}
                          onChange={(e) => updateBranding('secondary_color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedConfig.branding.secondary_color}
                          onChange={(e) => updateBranding('secondary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={selectedConfig.branding.company_name}
                        onChange={(e) => updateBranding('company_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
                      <input
                        type="text"
                        value={selectedConfig.branding.custom_domain}
                        onChange={(e) => updateBranding('custom_domain', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={selectedConfig.branding.tagline}
                      onChange={(e) => updateBranding('tagline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                    <input
                      type="text"
                      value={selectedConfig.branding.footer_text}
                      onChange={(e) => updateBranding('footer_text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features Configuration */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Features & Customization</h2>
                </div>
                <div className="p-6 space-y-4">
                  {Object.entries(selectedConfig.features).map(([feature, enabled]) => (
                    <label key={feature} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <p className="text-sm text-gray-500">
                          {feature === 'hide_veltrex_branding' && 'Remove all Veltrex branding from the interface'}
                          {feature === 'custom_login_page' && 'Use agency-branded login page'}
                          {feature === 'custom_dashboard_layout' && 'Customize dashboard layout and components'}
                          {feature === 'custom_email_templates' && 'Use agency-branded email templates'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateFeature(feature, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      value={selectedConfig.contact_info.support_email}
                      onChange={(e) => updateContactInfo('support_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                    <input
                      type="tel"
                      value={selectedConfig.contact_info.support_phone}
                      onChange={(e) => updateContactInfo('support_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={selectedConfig.contact_info.address}
                      onChange={(e) => updateContactInfo('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Custom CSS */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Generated CSS</h2>
                  <p className="text-sm text-gray-600">Custom CSS based on branding configuration</p>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generateCustomCSS(selectedConfig)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMode && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Preview: {selectedConfig.agency_name}</h2>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 h-full overflow-y-auto" style={{ backgroundColor: '#f9fafb' }}>
              {/* Mock Dashboard Preview */}
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div 
                  className="px-6 py-4 border-b border-gray-200"
                  style={{ backgroundColor: selectedConfig.branding.primary_color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={selectedConfig.branding.logo_url} 
                        alt="Logo" 
                        className="h-8 w-auto"
                      />
                      <div>
                        <h1 className="text-white text-xl font-bold">{selectedConfig.branding.company_name}</h1>
                        <p className="text-white text-sm opacity-90">{selectedConfig.branding.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900">Total Leads</h3>
                      <p className="text-2xl font-bold" style={{ color: selectedConfig.branding.primary_color }}>
                        1,247
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900">Qualified Leads</h3>
                      <p className="text-2xl font-bold" style={{ color: selectedConfig.branding.secondary_color }}>
                        342
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
                      <p className="text-2xl font-bold text-green-600">27.4%</p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">{selectedConfig.branding.footer_text}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      Support: {selectedConfig.contact_info.support_email} | {selectedConfig.contact_info.support_phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}