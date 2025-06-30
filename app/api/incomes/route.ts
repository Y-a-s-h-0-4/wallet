import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma, getUserByClerkId } from '@/lib/db';

// GET /api/incomes - Get all incomes for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const categoryId = searchParams.get('categoryId');
    const where: any = { userId: user.id };
    if (month && year) {
      where.date = {
        gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        lt: new Date(parseInt(year), parseInt(month), 1),
      };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const incomes = await prisma.income.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ incomes });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incomes - Create a new income
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const body = await request.json();
    console.log('Income POST body:', body);
    const { amount, description, merchant, categoryId, date } = body;
    if (!amount || !categoryId) {
      console.error('Missing amount or categoryId');
      return NextResponse.json({ error: 'Amount and category are required' }, { status: 400 });
    }
    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        description,
        source: merchant, // treat merchant as source for income
        categoryId,
        date: date ? new Date(date) : new Date(),
        userId: user.id,
      },
      include: { category: true },
    });
    console.log('Created income:', income);
    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 