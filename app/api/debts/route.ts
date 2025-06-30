import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma, getUserByClerkId } from '@/lib/db'

// GET /api/debts - Get all debts for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'LENT' or 'BORROWED'
    const status = searchParams.get('status') // 'PENDING' or 'SETTLED'

    const where: any = {
      userId: user.id,
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const debts = await prisma.debt.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ debts })

  } catch (error) {
    console.error('Error fetching debts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/debts - Create a new debt
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, person, amount, description, dueDate, category } = body

    if (!type || !person || !amount) {
      return NextResponse.json(
        { error: 'Type, person, and amount are required' }, 
        { status: 400 }
      )
    }

    const debt = await prisma.debt.create({
      data: {
        type,
        person,
        amount: parseFloat(amount),
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        userId: user.id,
      },
    })
    console.log('Created debt:', debt)

    return NextResponse.json({ debt }, { status: 201 })

  } catch (error) {
    console.error('Error creating debt:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 