import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../lib/generated/prisma'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://lfqrqkplepbibndgneka.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is not set')
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Static default categories
export const STATIC_DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', type: 'EXPENSE' as const },
  { name: 'Transportation', icon: '🚗', type: 'EXPENSE' as const },
  { name: 'Shopping', icon: '🛍️', type: 'EXPENSE' as const },
  { name: 'Bills & Utilities', icon: '💡', type: 'EXPENSE' as const },
  { name: 'Entertainment', icon: '🎬', type: 'EXPENSE' as const },
  { name: 'Healthcare', icon: '🏥', type: 'EXPENSE' as const },
  { name: 'Education', icon: '📚', type: 'EXPENSE' as const },
  { name: 'Other', icon: '📦', type: 'EXPENSE' as const },
  { name: 'Salary', icon: '💰', type: 'INCOME' as const },
  { name: 'Freelance', icon: '💼', type: 'INCOME' as const },
  { name: 'Investment', icon: '📈', type: 'INCOME' as const },
  { name: 'Other Income', icon: '💵', type: 'INCOME' as const },
]

// Insert static default categories for a user if not present
export async function ensureDefaultCategories(userId: string) {
  for (const category of STATIC_DEFAULT_CATEGORIES) {
    const exists = await prisma.category.findFirst({
      where: { name: category.name, type: category.type, userId },
    })
    if (!exists) {
      await prisma.category.create({
        data: {
          ...category,
          userId,
          isDefault: true,
        },
      })
    }
  }
}

// Database utility functions
export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: { clerkId },
    include: {
      categories: true,
      budgets: true,
      goals: true,
    }
  })
}

export async function createUserFromClerk(clerkUser: any) {
  const user = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.email_addresses?.[0]?.email_address || '',
      firstName: clerkUser.first_name || '',
      lastName: clerkUser.last_name || '',
      avatar: clerkUser.image_url || '',
    }
  })
  await ensureDefaultCategories(user.id)
  // Fetch the user again with relations
  return await getUserByClerkId(clerkUser.id)
}

export async function getOrCreateUser(clerkUser: any) {
  let user = await getUserByClerkId(clerkUser.id)
  if (!user) {
    user = await createUserFromClerk(clerkUser)
  } else {
    await ensureDefaultCategories(user.id)
  }
  return user
} 