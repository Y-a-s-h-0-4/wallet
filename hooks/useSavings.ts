import { useState, useEffect, useCallback } from 'react';

export function useSavings() {
  const [savings, setSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/savings');
      if (!res.ok) throw new Error('Failed to fetch savings');
      const data = await res.json();
      const total = Array.isArray(data.savings)
        ? data.savings.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0)
        : 0;
      setSavings(total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setSavings(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  return { savings, loading, error, refetch: fetchSavings };
} 