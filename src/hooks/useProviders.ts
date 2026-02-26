import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type Hospital = Tables<'hospitals'>
type Pharmacy = Tables<'pharmacies'>

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setHospitals(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات المستشفيات')
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const getHospitalById = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('hospitals')
        .select('*')
        .eq('hospital_id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات المستشفى')
      return null
    }
  }

  return {
    hospitals,
    loading,
    error,
    fetchHospitals,
    getHospitalById
  }
}

export function usePharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setPharmacies(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات الصيدليات')
      setPharmacies([])
    } finally {
      setLoading(false)
    }
  }

  const getPharmacyById = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('pharmacy_id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب بيانات الصيدلية')
      return null
    }
  }

  return {
    pharmacies,
    loading,
    error,
    fetchPharmacies,
    getPharmacyById
  }
}
