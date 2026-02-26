import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'

type Appointment = Tables<'appointments'>
type AppointmentInsert = TablesInsert<'appointments'>

export function useAppointments(patientId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [patientId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let query = supabase.from('appointments').select(`
        *,
        doctor:doctors(first_name, last_name, specialty, hospital:hospitals(hospital_name))
      `)

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data, error: err } = await query.order('appointment_date', { ascending: false })

      if (err) throw err
      setAppointments(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب المواعيد')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointment: AppointmentInsert) => {
    try {
      const { data, error: err } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single()

      if (err) throw err
      setAppointments([data, ...appointments])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حجز الموعد')
      return null
    }
  }

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error: err } = await supabase
        .from('appointments')
        .update(updates)
        .eq('appointment_id', id)
        .select()
        .single()

      if (err) throw err
      setAppointments(appointments.map(a => a.appointment_id === id ? data : a))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الموعد')
      return null
    }
  }

  const cancelAppointment = async (id: string) => {
    return updateAppointment(id, { status: 'CANCELED' })
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(
      a => a.appointment_date >= today && a.status !== 'CANCELED'
    )
  }

  const getPastAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(
      a => a.appointment_date < today || a.status === 'COMPLETED'
    )
  }

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    getPastAppointments
  }
}
