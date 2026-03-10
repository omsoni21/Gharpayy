import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create agents
  const agent1 = await prisma.agent.upsert({
    where: { email: 'agent1@gharpayy.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'agent1@gharpayy.com',
      phone: '+91 9876543210',
      isActive: true,
    },
  })

  const agent2 = await prisma.agent.upsert({
    where: { email: 'agent2@gharpayy.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'agent2@gharpayy.com',
      phone: '+91 9876543211',
      isActive: true,
    },
  })

  const agent3 = await prisma.agent.upsert({
    where: { email: 'agent3@gharpayy.com' },
    update: {},
    create: {
      name: 'Amit Patel',
      email: 'agent3@gharpayy.com',
      phone: '+91 9876543212',
      isActive: true,
    },
  })

  console.log('✅ Agents created:', agent1.name, agent2.name, agent3.name)

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunrise PG',
      address: '123, Main Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      location: 'Indiranagar',
      type: 'PAYING_GUEST',
      furnishing: 'FULLY_FURNISHED',
      amenities: 'WiFi,Food,Laundry,Security',
      minPrice: 8000,
      maxPrice: 15000,
      vacancyStatus: 'VACANT',
    },
  })

  const property2 = await prisma.property.create({
    data: {
      name: 'Green Valley Apartments',
      address: '45, Park Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560002',
      location: 'Koramangala',
      type: 'FLAT',
      furnishing: 'SEMI_FURNISHED',
      amenities: 'WiFi,Parking,Gym',
      minPrice: 12000,
      maxPrice: 20000,
      vacancyStatus: 'LIMITED',
    },
  })

  const property3 = await prisma.property.create({
    data: {
      name: 'Student Hub PG',
      address: '78, College Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560003',
      location: 'Jayanagar',
      type: 'PAYING_GUEST',
      furnishing: 'FULLY_FURNISHED',
      amenities: 'WiFi,Food,Study Room,AC',
      minPrice: 10000,
      maxPrice: 18000,
      vacancyStatus: 'VACANT',
    },
  })

  console.log('✅ Properties created:', property1.name, property2.name, property3.name)

  // Create sample leads
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Rahul Verma',
      phone: '+91 9123456789',
      email: 'rahul@example.com',
      source: 'Website',
      status: 'NEW_LEAD',
      priority: 'HIGH',
      assignedToId: agent1.id,
      budget: '10000-15000',
      location: 'Indiranagar',
      accommodationType: 'Single Room',
      requirements: 'Looking for a peaceful area near my office',
      nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  })

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Sneha Reddy',
      phone: '+91 9234567890',
      email: 'sneha@example.com',
      source: 'WhatsApp',
      status: 'CONTACTED',
      priority: 'MEDIUM',
      assignedToId: agent2.id,
      budget: '8000-12000',
      location: 'Koramangala',
      accommodationType: 'Shared Room',
      requirements: 'Need accommodation near my college',
      nextFollowUpAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
    },
  })

  const lead3 = await prisma.lead.create({
    data: {
      name: 'Arjun Singh',
      phone: '+91 9345678901',
      email: 'arjun@example.com',
      source: 'Lead Form',
      status: 'VISIT_SCHEDULED',
      priority: 'HIGH',
      assignedToId: agent3.id,
      budget: '12000-18000',
      location: 'Jayanagar',
      accommodationType: 'Single Room',
      requirements: 'Looking for AC room with good food',
    },
  })

  console.log('✅ Leads created:', lead1.name, lead2.name, lead3.name)

  // Create sample visit
  const visit = await prisma.visit.create({
    data: {
      leadId: lead3.id,
      propertyId: property3.id,
      scheduledBy: agent3.id,
      visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      visitTime: '10:00 AM',
      status: 'SCHEDULED',
    },
  })

  console.log('✅ Visit scheduled')

  // Create activities
  await prisma.activity.create({
    data: {
      leadId: lead1.id,
      agentId: agent1.id,
      type: 'CALL_OUTBOUND',
      description: 'Initial contact call - discussed requirements',
    },
  })

  await prisma.activity.create({
    data: {
      leadId: lead2.id,
      agentId: agent2.id,
      type: 'WHATSAPP_MESSAGE',
      description: 'Sent property details via WhatsApp',
    },
  })

  console.log('✅ Activities logged')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
