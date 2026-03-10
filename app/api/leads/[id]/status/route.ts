import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/leads/[id]/status
 * Update lead status in the pipeline
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, agentId, notes } = body

    if (!status || !agentId) {
      return NextResponse.json(
        { error: 'Status and agentId are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = [
      'NEW_LEAD',
      'CONTACTED',
      'REQUIREMENT_COLLECTED',
      'PROPERTY_SUGGESTED',
      'VISIT_SCHEDULED',
      'VISIT_COMPLETED',
      'BOOKED',
      'LOST',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Update lead status
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        lastContactedAt: new Date(),
      },
      include: {
        assignedTo: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: id,
        agentId,
        type: 'STATUS_CHANGED',
        description: `Status changed to ${status}${notes ? ` - ${notes}` : ''}`,
      },
    })

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}
