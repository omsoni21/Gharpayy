import { NextRequest, NextResponse } from 'next/server'
import { createLead, getLeads } from '@/lib/services/lead-service'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/leads
 * Create a new lead (from form submissions, WhatsApp, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Validate source
    const validSources = ['WhatsApp', 'Website', 'Social Media', 'Phone Call', 'Lead Form', 'Referral']
    if (!body.source || !validSources.includes(body.source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const lead = await createLead({
      name: body.name,
      phone: body.phone,
      email: body.email,
      source: body.source,
      budget: body.budget,
      location: body.location,
      accommodationType: body.accommodationType,
      requirements: body.requirements,
      priority: body.priority || 'MEDIUM',
      assignmentMethod: body.assignmentMethod || 'round-robin',
      preferredAgentId: body.preferredAgentId,
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error: any) {
    console.error('Error creating lead:', error)
    
    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads
 * Get leads with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters = {
      status: searchParams.get('status') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      source: searchParams.get('source') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    }

    const { leads, total, hasMore } = await getLeads(filters)

    return NextResponse.json({
      leads,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore,
      },
    })
  } catch (error: any) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
