'use client'

import { useState } from 'react'
import { AgencyManagement } from './agency-management'
import { AgencyOnboarding } from './agency-onboarding'
import { UsageBillingDashboard } from './usage-billing-dashboard'
import { TeamManagementSystem } from './team-management-system'
import { WhiteLabelCustomization } from './white-label-customization'

interface AdminDashboardLayoutProps {
  children?: React.ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Veltrex Admin</h1>
            <p className="text-gray-600">Multi-Agency Management Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Admin Portal</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Agency Dashboard
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'onboarding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Agency Onboarding
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Usage & Billing
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Management
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            White-Label Branding
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Platform Analytics
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && <AgencyManagement />}
        {activeTab === 'onboarding' && (
          <AgencyOnboarding 
            onComplete={() => {
              // Switch back to dashboard after successful onboarding
              setActiveTab('dashboard')
              // You could also show a success message here
              alert('Agency onboarded successfully!')
            }} 
          />
        )}
        {activeTab === 'usage' && <UsageBillingDashboard />}
        {activeTab === 'team' && <TeamManagementSystem />}
        {activeTab === 'branding' && <WhiteLabelCustomization />}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Revenue</h3>
                  <p className="text-2xl font-bold text-blue-600">$127,500</p>
                  <p className="text-sm text-blue-700">+34% from last month</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Agencies</h3>
                  <p className="text-2xl font-bold text-green-600">47</p>
                  <p className="text-sm text-green-700">12 new this month</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Total Agents</h3>
                  <p className="text-2xl font-bold text-purple-600">1,247</p>
                  <p className="text-sm text-purple-700">Across all agencies</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Features Active</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Usage Tracking & Billing</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Real-time monitoring across all agencies</p>
                  </div>
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Team Management</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Role-based permissions system</p>
                  </div>
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">White-Label Branding</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Custom branding for each agency</p>
                  </div>
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Multi-Agency Management</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Centralized control dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}