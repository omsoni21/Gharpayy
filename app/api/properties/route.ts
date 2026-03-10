import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/properties
 * Get all properties
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location')
    const type = searchParams.get('type')

    const where: any = {}

    if (location) {
      where.location = location
    }

    if (type) {
      where.type = type
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        visits: {
          take: 5,
          orderBy: { visitDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(properties)
  } catch (error: any) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/properties
 * Create a new property
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const property = await prisma.property.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city || 'Bangalore',
        state: body.state || 'Karnataka',
        pincode: body.pincode,
        location: body.location,
        type: body.type,
        furnishing: body.furnishing,
        amenities: body.amenities || [],
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        vacancyStatus: body.vacancyStatus || 'VACANT',
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
