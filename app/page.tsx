import Link from 'next/link'
import { Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">Gharpayy CRM</h1>
            <div className="flex gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/leads" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Leads
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lead Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your PG accommodation business with automated lead capture, 
            intelligent assignment, and comprehensive tracking.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-600" />}
            title="Automated Lead Capture"
            description="Capture leads from WhatsApp, Website, Social Media, and Phone calls automatically"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-green-600" />}
            title="Smart Assignment"
            description="Round-robin and workload-based lead distribution to your agents"
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-purple-600" />}
            title="Visit Scheduling"
            description="Schedule and track property visits with automated reminders"
          />
          <FeatureCard
            icon={<CheckCircle className="h-8 w-8 text-orange-600" />}
            title="Pipeline Management"
            description="Track leads from initial contact to final booking"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/leads"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg"
          >
            View All Leads
          </Link>
        </div>

        {/* API Info */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">POST /api/leads</code>
              <p className="text-gray-600 mt-1">Create new lead from any source</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">GET /api/leads</code>
              <p className="text-gray-600 mt-1">List all leads with filters</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">PATCH /api/leads/[id]/status</code>
              <p className="text-gray-600 mt-1">Update lead pipeline status</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">POST /api/visits</code>
              <p className="text-gray-600 mt-1">Schedule property visits</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">GET /api/dashboard</code>
              <p className="text-gray-600 mt-1">Get analytics and metrics</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <code className="text-blue-600 font-mono">GET /api/properties</code>
              <p className="text-gray-600 mt-1">List available properties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
