import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log("/api/auth/sync called");
    const { userId } = await auth()
    
    if (!userId) {
      console.log("No userId from Clerk auth");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())

    console.log("Clerk user:", clerkUser);

    // Sync user with our database
    const user = await getOrCreateUser(clerkUser)
    console.log("DB user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      }
    })

  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || error }, 
      { status: 500 }
    )
  }
} 