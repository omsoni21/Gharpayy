import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/visits
 * Schedule a new visit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { leadId, propertyId, scheduledBy, visitDate, visitTime } = body

    // Validate required fields
    if (!leadId || !propertyId || !scheduledBy || !visitDate || !visitTime) {
      return NextResponse.json(
        { error: 'leadId, propertyId, scheduledBy, visitDate, and visitTime are required' },
        { status: 400 }
      )
    }

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: scheduledBy },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Create visit
    const visit = await prisma.visit.create({
      data: {
        leadId,
        propertyId,
        scheduledBy,
        visitDate: new Date(visitDate),
        visitTime,
        status: 'SCHEDULED',
      },
      include: {
        lead: true,
        property: true,
        scheduledByAgent: true,
      },
    })

    // Update lead status to VISIT_SCHEDULED
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'VISIT_SCHEDULED',
        lastContactedAt: new Date(),
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId,
        agentId: scheduledBy,
        type: 'VISIT_SCHEDULED',
        description: `Visit scheduled for ${visitTime} on ${new Date(visitDate).toLocaleDateString()} at ${property.name}`,
      },
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (error: any) {
    console.error('Error scheduling visit:', error)
    return NextResponse.json(
      { error: 'Failed to schedule visit' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/visits
 * Get upcoming visits
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'SCHEDULED'
    const agentId = searchParams.get('agentId')

    const where: any = { status: status as any }

    if (agentId) {
      where.scheduledBy = agentId
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        lead: true,
        property: true,
        scheduledByAgent: true,
      },
      orderBy: { visitDate: 'asc' },
      take: 50,
    })

    return NextResponse.json(visits)
  } catch (error: any) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    )
  }
}
