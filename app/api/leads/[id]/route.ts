import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/leads/[id]
 * Get a specific lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            property: true,
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}
