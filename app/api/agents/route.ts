import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/agents
 * Get all active agents
 */
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: { isActive: true },
      include: {
        leads: {
          where: {
            status: {
              in: ['NEW_LEAD', 'CONTACTED', 'REQUIREMENT_COLLECTED'],
            },
          },
        },
        _count: {
          select: {
            leads: true,
            activities: true,
            visitsScheduled: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(
      agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        isActive: agent.isActive,
        activeLeadsCount: agent.leads.length,
        totalLeadsCount: agent._count.leads,
        activitiesCount: agent._count.activities,
        visitsCount: agent._count.visitsScheduled,
      }))
    )
  } catch (error: any) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
