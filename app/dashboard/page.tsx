'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, CheckCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface DashboardData {
  summary: {
    totalLeads: number
    recentLeads: number
    bookingsThisMonth: number
    visitsThisWeek: number
    followUpsDue: number
    conversionRate: string
  }
  leadsByStatus: Record<string, number>
  pipeline: Array<{
    stage: string
    count: number
    color: string
  }>
  agentPerformance: Array<{
    id: string
    name: string
    email: string
    totalLeads: number
    activeLeads: number
    bookings: number
    conversionRate: string
  }>
  timestamp?: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    fetch('/api/dashboard')
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Dashboard data received:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard:', err);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData()
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gharpayy CRM Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Just now'}
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Leads"
            value={data.summary.totalLeads}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            subtitle={`${data.summary.recentLeads} this week`}
          />
          <SummaryCard
            title="Bookings (Month)"
            value={data.summary.bookingsThisMonth}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            subtitle={`${data.summary.conversionRate}% conversion rate`}
          />
          <SummaryCard
            title="Visits Scheduled"
            value={data.summary.visitsThisWeek}
            icon={<Calendar className="h-6 w-6" />}
            color="yellow"
            subtitle="This week"
          />
          <SummaryCard
            title="Follow-ups Due"
            value={data.summary.followUpsDue}
            icon={<Clock className="h-6 w-6" />}
            color="red"
            subtitle="Pending today"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pipeline Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Sales Pipeline
            </h2>
            <div className="space-y-3">
              {data.pipeline.map(stage => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{stage.stage}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${data.summary.totalLeads > 0 ? (stage.count / data.summary.totalLeads) * 100 : 0}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leads by Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.leadsByStatus).map(([status, count]) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    {status.replace(/_/g, ' ')}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.agentPerformance.map(agent => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.totalLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.activeLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {agent.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red'
  subtitle?: string
}

function SummaryCard({ title, value, icon, color, subtitle }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  )
}
