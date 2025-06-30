import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Debt {
  id: string
  type: 'LENT' | 'BORROWED'
  person: string
  amount: number
  description?: string
  date: string
  dueDate?: string
  status: 'PENDING' | 'SETTLED'
  category?: string
}

interface CreateDebtData {
  type: 'LENT' | 'BORROWED'
  person: string
  amount: number
  description?: string
  dueDate?: string
  category?: string
}

export function useDebts() {
  const { isSignedIn } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDebts = async () => {
    if (!isSignedIn) return

    try {
      setLoading(true)
      const response = await fetch('/api/debts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch debts')
      }

      const data = await response.json()
      console.log('Fetched debts:', data.debts)
      setDebts(data.debts)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createDebt = async (debtData: CreateDebtData) => {
    if (!isSignedIn) return null

    try {
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debtData),
      })

      if (!response.ok) {
        throw new Error('Failed to create debt')
      }

      const data = await response.json()
      console.log('Created debt:', data.debt)
      await fetchDebts()
      return data.debt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }

  const settleDebt = async (debtId: string) => {
    if (!isSignedIn) return false

    try {
      const response = await fetch(`/api/debts/${debtId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'SETTLED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to settle debt')
      }

      setDebts(prev => 
        prev.map(debt => 
          debt.id === debtId ? { ...debt, status: 'SETTLED' as const } : debt
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const deleteDebt = async (debtId: string) => {
    if (!isSignedIn) return false

    try {
      const response = await fetch(`/api/debts/${debtId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete debt')
      }

      setDebts(prev => prev.filter(debt => debt.id !== debtId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const getDebtSummary = () => {
    const lent = debts.filter(debt => debt.type === 'LENT' && debt.status === 'PENDING')
    const borrowed = debts.filter(debt => debt.type === 'BORROWED' && debt.status === 'PENDING')
    
    const totalLent = lent.reduce((sum, debt) => sum + debt.amount, 0)
    const totalBorrowed = borrowed.reduce((sum, debt) => sum + debt.amount, 0)
    
    return {
      totalLent,
      totalBorrowed,
      netAmount: totalLent - totalBorrowed,
      pendingCount: lent.length + borrowed.length,
    }
  }

  useEffect(() => {
    fetchDebts()
  }, [isSignedIn])

  return {
    debts,
    loading,
    error,
    createDebt,
    settleDebt,
    deleteDebt,
    fetchDebts,
    getDebtSummary,
  }
} 