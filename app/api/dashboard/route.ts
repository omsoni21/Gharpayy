import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/dashboard
 * Get dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')

    // Basic counts
    const totalLeads = await prisma.lead.count({
      where: agentId ? { assignedToId: agentId } : {},
    })

    // Leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      where: agentId ? { assignedToId: agentId } : {},
      _count: true,
    })

    const statusMap: Record<string, number> = {}
    leadsByStatus.forEach(item => {
      statusMap[item.status] = item._count
    })

    // Recent leads (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLeads = await prisma.lead.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        ...(agentId && { assignedToId: agentId }),
      },
    })

    // Bookings this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const bookingsThisMonth = await prisma.lead.count({
      where: {
        status: 'BOOKED',
        updatedAt: { gte: startOfMonth },
        ...(agentId && { assignedToId: agentId }),
      },
    })

    // Visits scheduled this week
    const visitsThisWeek = await prisma.visit.count({
      where: {
        visitDate: { gte: new Date() },
        status: 'SCHEDULED',
        ...(agentId && { scheduledBy: agentId }),
      },
    })

    // Conversion rate (Booked / Total leads)
    const conversionRate = totalLeads > 0 
      ? ((statusMap['BOOKED'] || 0) / totalLeads) * 100 
      : 0

    // Follow-ups due today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const followUpsDue = await prisma.lead.count({
      where: {
        nextFollowUpAt: {
          lte: tomorrow,
        },
        status: {
          notIn: ['BOOKED', 'LOST'],
        },
        ...(agentId && { assignedToId: agentId }),
      },
    })

    // Agent performance (if no specific agent requested)
    let agentPerformance: {
      id: string
      name: string
      email: string
      totalLeads: number
      activeLeads: number
      bookings: number
      conversionRate: string
    }[] = []
    
    if (!agentId) {
      const agents = await prisma.agent.findMany({
        where: { isActive: true },
        include: {
          leads: {
            where: agentId ? { assignedToId: agentId } : {},
          },
        },
      })

      agentPerformance = await Promise.all(
        agents.map(async agent => {
          const [bookedCount, totalActive] = await Promise.all([
            prisma.lead.count({
              where: { assignedToId: agent.id, status: 'BOOKED' },
            }),
            prisma.lead.count({
              where: {
                assignedToId: agent.id,
                status: { in: ['NEW_LEAD', 'CONTACTED', 'REQUIREMENT_COLLECTED'] },
              },
            }),
          ])

          return {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            totalLeads: agent.leads.length,
            activeLeads: totalActive,
            bookings: bookedCount,
            conversionRate: agent.leads.length > 0 
              ? ((bookedCount / agent.leads.length) * 100).toFixed(1)
              : '0',
          }
        })
      )
    }

    // Pipeline distribution for visualization
    const pipelineData = [
      { stage: 'New Lead', count: statusMap['NEW_LEAD'] || 0, color: '#3b82f6' },
      { stage: 'Contacted', count: statusMap['CONTACTED'] || 0, color: '#60a5fa' },
      { stage: 'Requirement Collected', count: statusMap['REQUIREMENT_COLLECTED'] || 0, color: '#93c5fd' },
      { stage: 'Property Suggested', count: statusMap['PROPERTY_SUGGESTED'] || 0, color: '#dbeafe' },
      { stage: 'Visit Scheduled', count: statusMap['VISIT_SCHEDULED'] || 0, color: '#fbbf24' },
      { stage: 'Visit Completed', count: statusMap['VISIT_COMPLETED'] || 0, color: '#f59e0b' },
      { stage: 'Booked', count: statusMap['BOOKED'] || 0, color: '#10b981' },
      { stage: 'Lost', count: statusMap['LOST'] || 0, color: '#ef4444' },
    ]

    return NextResponse.json({
      summary: {
        totalLeads,
        recentLeads,
        bookingsThisMonth,
        visitsThisWeek,
        followUpsDue,
        conversionRate: conversionRate.toFixed(2),
      },
      leadsByStatus: statusMap,
      pipeline: pipelineData,
      agentPerformance,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
