import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type Doctor = Tables<'doctors'>

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('doctors')
        .select('*')
        .order('average_rating', { ascending: false })

      if (err) throw err
      setDoctors(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات الأطباء')
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const getDoctorById = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات الطبيب')
      return null
    }
  }

  const getDoctorsBySpecialization = async (specialization: string) => {
    try {
      const { data, error: err } = await supabase
        .from('doctors')
        .select('*')
        .eq('specialization', specialization)
        .order('average_rating', { ascending: false })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب الأطباء')
      return []
    }
  }

  const updateDoctor = async (id: string, updates: Partial<Doctor>) => {
    try {
      const { data, error: err } = await supabase
        .from('doctors')
        .update(updates)
        .eq('doctor_id', id)
        .select()
        .single()

      if (err) throw err
      setDoctors(doctors.map(d => d.doctor_id === id ? data : d))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث بيانات الطبيب')
      return null
    }
  }

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    getDoctorById,
    getDoctorsBySpecialization,
    updateDoctor
  }
}
