'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Plus, Phone, Mail, MapPin } from 'lucide-react'

interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  source: string
  status: string
  priority: string
  budget?: string
  location?: string
  assignedTo?: {
    name: string
  }
  createdAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    budget: '',
    location: '',
    requirements: ''
  })

  useEffect(() => {
    loadLeads()
  }, [filterStatus])

  const loadLeads = async () => {
    try {
      const url = filterStatus 
        ? `/api/leads?status=${filterStatus}` 
        : '/api/leads'
      
      const res = await fetch(url)
      const data = await res.json()
      setLeads(data.leads || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to load leads:', error)
      setLoading(false)
    }
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadData)
      })
      
      if (response.ok) {
        alert('Lead created successfully!')
        setShowAddModal(false)
        setNewLeadData({
          name: '',
          phone: '',
          email: '',
          source: 'Website',
          budget: '',
          location: '',
          requirements: ''
        })
        loadLeads() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create lead:', error)
      alert('Failed to create lead')
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.email?.toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW_LEAD: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      REQUIREMENT_COLLECTED: 'bg-purple-100 text-purple-800',
      PROPERTY_SUGGESTED: 'bg-indigo-100 text-indigo-800',
      VISIT_SCHEDULED: 'bg-orange-100 text-orange-800',
      VISIT_COMPLETED: 'bg-teal-100 text-teal-800',
      BOOKED: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700',
    }
    return colors[priority] || 'bg-gray-100 text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                {leads.length} total leads
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-semibold">Add New Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="NEW_LEAD">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REQUIREMENT_COLLECTED">Requirement Collected</option>
            <option value="PROPERTY_SUGGESTED">Property Suggested</option>
            <option value="VISIT_SCHEDULED">Visit Scheduled</option>
            <option value="VISIT_COMPLETED">Visit Completed</option>
            <option value="BOOKED">Booked</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    {lead.location && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {lead.location}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.assignedTo?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal - Enhanced */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new lead</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-6">
              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadData.name}
                    onChange={(e) => setNewLeadData({...newLeadData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newLeadData.phone}
                      onChange={(e) => setNewLeadData({...newLeadData, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                      pattern="[+]{1}[0-9]{10,15}"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLeadData.email}
                      onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                </div>

                {/* Source Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newLeadData.source}
                    onChange={(e) => setNewLeadData({...newLeadData, source: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select a source</option>
                    <option value="Website">🌐 Website</option>
                    <option value="WhatsApp">📱 WhatsApp</option>
                    <option value="Social Media">📢 Social Media</option>
                    <option value="Phone Call">📞 Phone Call</option>
                    <option value="Lead Form">📝 Lead Form</option>
                    <option value="Referral">👥 Referral</option>
                  </select>
                </div>

                {/* Budget and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      value={newLeadData.budget}
                      onChange={(e) => setNewLeadData({...newLeadData, budget: e.target.value})}
                      placeholder="₹10,000 - ₹15,000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      value={newLeadData.location}
                      onChange={(e) => setNewLeadData({...newLeadData, location: e.target.value})}
                      placeholder="e.g., Indiranagar, Bangalore"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    value={newLeadData.requirements}
                    onChange={(e) => setNewLeadData({...newLeadData, requirements: e.target.value})}
                    rows={4}
                    placeholder="Describe specific requirements, preferences, or special needs..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Lead 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
