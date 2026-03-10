import { prisma } from '../prisma'
import type { Agent, Lead } from '@prisma/client'

/**
 * Lead Assignment Service
 * Implements round-robin assignment with workload balancing
 */

export interface AssignmentOptions {
  method?: 'round-robin' | 'workload' | 'manual'
  preferredAgentId?: string
}

export async function assignLead(
  options: AssignmentOptions = {}
): Promise<string | null> {
  const { method = 'round-robin', preferredAgentId } = options

  // Manual assignment takes priority
  if (preferredAgentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: preferredAgentId, isActive: true },
    })
    if (agent) return preferredAgentId
  }

  // Get all active agents
  const activeAgents = await prisma.agent.findMany({
    where: { isActive: true },
    include: {
      leads: {
        where: {
          status: {
            in: ['NEW_LEAD', 'CONTACTED', 'REQUIREMENT_COLLECTED'],
          },
        },
      },
    },
  })

  if (activeAgents.length === 0) {
    console.warn('No active agents available for lead assignment')
    return null
  }

  if (method === 'workload') {
    // Assign to agent with least active leads
    const agentWithLeastLeads = activeAgents.reduce((minAgent, currentAgent) => {
      return currentAgent.leads.length < minAgent.leads.length
        ? currentAgent
        : minAgent
    })
    return agentWithLeastLeads.id
  }

  // Default: Round-robin based on recent assignments
  if (method === 'round-robin') {
    // Get the most recently assigned lead to determine next agent
    const lastAssignedLead = await prisma.lead.findFirst({
      where: {
        assignedToId: {
          in: activeAgents.map(a => a.id),
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { assignedToId: true },
    })

    if (!lastAssignedLead?.assignedToId) {
      // No previous assignments, assign to first agent
      return activeAgents[0].id
    }

    // Find the next agent in sequence
    const currentIndex = activeAgents.findIndex(
      a => a.id === lastAssignedLead.assignedToId
    )
    const nextIndex = (currentIndex + 1) % activeAgents.length
    return activeAgents[nextIndex].id
  }

  return null
}

/**
 * Create a new lead with automatic assignment
 */
export interface CreateLeadInput {
  name: string
  phone: string
  email?: string
  source: string
  budget?: string
  location?: string
  accommodationType?: string
  requirements?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignmentMethod?: 'round-robin' | 'workload'
  preferredAgentId?: string
}

export async function createLead(input: CreateLeadInput) {
  const {
    name,
    phone,
    email,
    source,
    budget,
    location,
    accommodationType,
    requirements,
    priority = 'MEDIUM',
    assignmentMethod = 'round-robin',
    preferredAgentId,
  } = input

  // Check for duplicate phone number
  const existingLead = await prisma.lead.findFirst({
    where: { phone },
  })

  if (existingLead) {
    throw new Error(`Lead with phone ${phone} already exists`)
  }

  // Assign lead to an agent
  const assignedToId = await assignLead({
    method: assignmentMethod,
    preferredAgentId,
  })

  // Set follow-up reminder for Day 1
  const nextFollowUpAt = new Date()
  nextFollowUpAt.setDate(nextFollowUpAt.getDate() + 1)

  // Create the lead
  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      source,
      status: 'NEW_LEAD',
      priority,
      assignedToId,
      budget,
      location,
      accommodationType,
      requirements,
      nextFollowUpAt,
    },
    include: {
      assignedTo: true,
    },
  })

  // Log activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      agentId: assignedToId || '',
      type: 'STATUS_CHANGED',
      description: `Lead created and assigned to ${assignedToId ? 'agent' : 'unassigned'}`,
    },
  })

  return lead
}

/**
 * Update lead status and move through pipeline
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: 'NEW_LEAD' | 'CONTACTED' | 'REQUIREMENT_COLLECTED' | 'PROPERTY_SUGGESTED' | 'VISIT_SCHEDULED' | 'VISIT_COMPLETED' | 'BOOKED' | 'LOST',
  agentId: string,
  notes?: string
) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: newStatus,
      lastContactedAt: new Date(),
    },
    include: {
      assignedTo: true,
    },
  })

  // Log activity
  await prisma.activity.create({
    data: {
      leadId,
      agentId,
      type: 'STATUS_CHANGED',
      description: `Status changed to ${newStatus}${notes ? ` - ${notes}` : ''}`,
    },
  })

  return lead
}

/**
 * Get leads by various filters
 */
export interface LeadFilters {
  status?: string
  assignedToId?: string
  source?: string
  priority?: string
  search?: string
  limit?: number
  offset?: number
}

export async function getLeads(filters: LeadFilters = {}) {
  const {
    status,
    assignedToId,
    source,
    priority,
    search,
    limit = 50,
    offset = 0,
  } = filters

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (assignedToId) {
    where.assignedToId = assignedToId
  }

  if (source) {
    where.source = source
  }

  if (priority) {
    where.priority = priority
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: true,
        visits: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.lead.count({ where }),
  ])

  return {
    leads,
    total,
    hasMore: offset + limit < total,
  }
}
