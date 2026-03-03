import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface LabTest {
  request_id: string
  patient_id: string
  test_name: string
  status: 'PENDING' | 'COMPLETED'
  requested_at: string
  patient_name?: string
}

export function useDoctorLabTests() {
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTests = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('lab_test_requests')
        .select('*, patients:patient_id(first_name, last_name)')
        .eq('doctor_id', user.id)
        .eq('status', 'PENDING')
      
      setLabTests(data?.map((t: any) => ({
        ...t,
        patient_name: t.patients ? `${t.patients.first_name} ${t.patients.last_name}` : 'Unknown'
      })) || [])
      setLoading(false)
    }
    fetchTests()
  }, [])

  return { labTests, loading, refetch: () => {} }
}
