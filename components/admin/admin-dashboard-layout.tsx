'use client'

import { useState } from 'react'
import { AgencyManagement } from './agency-management'
import { AgencyOnboarding } from './agency-onboarding'

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
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Revenue</h3>
                  <p className="text-2xl font-bold text-blue-600">$47,500</p>
                  <p className="text-sm text-blue-700">+25% from last month</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Agencies</h3>
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-sm text-green-700">2 new this month</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Total Agents</h3>
                  <p className="text-2xl font-bold text-purple-600">347</p>
                  <p className="text-sm text-purple-700">Across all agencies</p>
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