import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useDoctorData() {
  const [doctor, setDoctor] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      
      // الحصول على الطبيب الحالي
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('لم يتم العثور على المستخدم')

      const { data: doctorData, error: doctorErr } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_id', user.id)
        .single()

      if (doctorErr && doctorErr.code !== 'PGRST116') throw doctorErr
      setDoctor(doctorData)

      // الحصول على المواعيد
      const { data: appointmentsData, error: appointmentsErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: true })

      if (appointmentsErr) throw appointmentsErr
      setAppointments(appointmentsData || [])

      // الحصول على المرضى الذين لديهم مواعيد مع هذا الطبيب
      const patientIds = appointmentsData?.map(a => a.patient_id) || []
      
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsErr } = await supabase
          .from('patients')
          .select('*')
          .in('patient_id', patientIds)

        if (patientsErr) throw patientsErr
        setPatients(patientsData || [])
      } else {
        setPatients([])
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('appointment_id', appointmentId)

      if (error) throw error
      await fetchDoctorData()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الحالة')
      return false
    }
  }

  return {
    doctor,
    appointments,
    patients,
    loading,
    error,
    fetchDoctorData,
    updateAppointmentStatus
  }
}
