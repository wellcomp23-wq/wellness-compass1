import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useLabs() {
  const [labs, setLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLabs()
  }, [])

  const fetchLabs = async () => {
    try {
      setLoading(true)
      
      // Fetch from the 'laboratories' table as per the database schema
      const { data, error: err } = await supabase
        .from('laboratories')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setLabs(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching labs:', err)
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات المختبرات')
      setLabs([])
    } finally {
      setLoading(false)
    }
  }

  return {
    labs,
    loading,
    error,
    fetchLabs
  }
}
