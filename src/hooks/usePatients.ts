import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type Patient = Tables<'patients'>

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setPatients(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات المرضى')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const getPatientById = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات المريض')
      return null
    }
  }

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { data, error: err } = await supabase
        .from('patients')
        .update(updates)
        .eq('patient_id', id)
        .select()
        .single()

      if (err) throw err
      setPatients(patients.map(p => p.patient_id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث بيانات المريض')
      return null
    }
  }

  return {
    patients,
    loading,
    error,
    fetchPatients,
    getPatientById,
    updatePatient
  }
}
