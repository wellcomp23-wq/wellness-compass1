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
      // بما أن المختبرات قد تكون مخزنة في جدول مختلف أو في جدول hospitals
      // سنحاول جلب البيانات من جدول مخصص للمختبرات إذا كان موجوداً
      // أو من جدول hospitals مع تصفية حسب النوع
      
      const { data, error: err } = await supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setLabs(data || [])
      setError(null)
    } catch (err) {
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
