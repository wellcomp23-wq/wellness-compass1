import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Prescription {
  prescription_id: string
  patient_id: string
  issue_date: string
  patient_name?: string
}

export function useDoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('prescriptions')
        .select('*, patients:patient_id(first_name, last_name)')
        .eq('issuing_doctor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      
      setPrescriptions(data?.map((p: any) => ({
        ...p,
        patient_name: p.patients ? `${p.patients.first_name} ${p.patients.last_name}` : 'Unknown'
      })) || [])
      setLoading(false)
    }
    fetchPrescriptions()
  }, [])

  return { prescriptions, loading }
}
