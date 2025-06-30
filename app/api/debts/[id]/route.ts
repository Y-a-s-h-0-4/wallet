import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma, getUserByClerkId } from '@/lib/db'

// PATCH /api/debts/[id] - Update a debt
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, amount, description, dueDate } = body

    const debt = await prisma.debt.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 })
    }

    const updatedDebt = await prisma.debt.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    })

    return NextResponse.json({ debt: updatedDebt })

  } catch (error) {
    console.error('Error updating debt:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/debts/[id] - Delete a debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const debt = await prisma.debt.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 })
    }

    await prisma.debt.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting debt:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 