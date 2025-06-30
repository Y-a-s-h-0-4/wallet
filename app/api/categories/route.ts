import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/categories - Get all categories for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all categories for the user and global defaults
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'EXPENSE' or 'INCOME'

    const where: any = {
      OR: [
        { userId },
        { isDefault: true, userId: null }
      ]
    }
    if (type) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up the DB user by Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, icon, color, type } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' }, 
        { status: 400 }
      )
    }

    // Check if category already exists for this user
    const existing = await prisma.category.findFirst({
      where: { name, type, userId: user.id }
    });
    if (existing) {
      return NextResponse.json({ category: existing }, { status: 200 });
    }

    try {
      const category = await prisma.category.create({
        data: {
          name,
          icon,
          color,
          type,
          userId: user.id,
          isDefault: false,
        },
      });
      return NextResponse.json({ category }, { status: 201 });
    } catch (error: any) {
      // Handle unique constraint error gracefully
      if (error.code === 'P2002') {
        const existing = await prisma.category.findFirst({
          where: { name, type, userId: user.id }
        });
        if (existing) {
          return NextResponse.json({ category: existing }, { status: 200 });
        }
      }
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: error?.message || error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 