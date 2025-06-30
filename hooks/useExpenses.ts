import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Expense {
  id: string
  amount: number
  description?: string
  merchant?: string
  location?: string
  date: string
  categoryId: string
  category: {
    id: string
    name: string
    icon?: string
  }
}

interface CreateExpenseData {
  amount: number
  description?: string
  merchant?: string
  location?: string
  categoryId: string
  date?: string
}

export function useTransactions() {
  const { isSignedIn } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    if (!isSignedIn) return

    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data.expenses.map((e: any) => ({ ...e, amount: Number(e.amount) })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchIncomes = async () => {
    if (!isSignedIn) return

    try {
      const response = await fetch('/api/incomes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch incomes')
      }

      const data = await response.json()
      setIncomes(data.incomes.map((i: any) => ({ ...i, amount: Number(i.amount) })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchExpenses(), fetchIncomes()])
    setLoading(false)
  }

  const createTransaction = async (data: any) => {
    if (!isSignedIn) return null

    try {
      let response
      if (data.type === 'INCOME') {
        response = await fetch('/api/incomes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }

      const result = await response.json()
      if (data.type === 'INCOME') setIncomes(prev => [{ ...result.income, amount: Number(result.income.amount) }, ...prev])
      else setExpenses(prev => [{ ...result.expense, amount: Number(result.expense.amount) }, ...prev])
      return data.type === 'INCOME' ? result.income : result.expense
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }

  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === month - 1 && expenseDate.getFullYear() === year
    })
  }

  const getMonthlyIncomes = (month: number, year: number) => {
    return incomes.filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate.getMonth() === month - 1 && incomeDate.getFullYear() === year
    })
  }

  const getTotalExpenses = (month?: number, year?: number) => {
    let filteredExpenses = expenses
    
    if (month && year) {
      filteredExpenses = getMonthlyExpenses(month, year)
    }

    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getTotalIncomes = (month?: number, year?: number) => {
    let filteredIncomes = incomes
    
    if (month && year) {
      filteredIncomes = getMonthlyIncomes(month, year)
    }

    return filteredIncomes.reduce((total, income) => total + income.amount, 0)
  }

  const getTotalBalance = (month?: number, year?: number) => {
    return getTotalIncomes(month, year) - getTotalExpenses(month, year)
  }

  const getTotalSavings = (month?: number, year?: number) => {
    return getTotalIncomes(month, year) - getTotalExpenses(month, year);
  };

  useEffect(() => {
    if (isSignedIn) fetchAll()
  }, [isSignedIn])

  return {
    expenses,
    incomes,
    loading,
    error,
    createTransaction,
    fetchAll,
    getMonthlyExpenses,
    getMonthlyIncomes,
    getTotalExpenses,
    getTotalIncomes,
    getTotalBalance,
    getTotalSavings,
  }
} 