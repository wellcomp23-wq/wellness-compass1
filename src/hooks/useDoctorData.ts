import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Doctor {
  doctor_id: string
  first_name: string
  last_name: string
  specialization?: string
  profile_picture_url?: string
  average_rating?: number
  is_verified?: boolean
}

export interface Appointment {
  appointment_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'
  patient_name?: string
}

export interface Patient {
  patient_id: string
  first_name: string
  last_name: string
  last_appointment_date?: string
}

export function useDoctorData() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: docData } = await supabase
          .from('doctors')
          .select('*')
          .eq('doctor_id', user.id)
          .single()
        setDoctor(docData)

        const { data: apts } = await supabase
          .from('appointments')
          .select('*, patients:patient_id(first_name, last_name)')
          .eq('doctor_id', user.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .limit(3)
        
        setUpcomingAppointments(apts?.map((a: any) => ({
          ...a,
          patient_name: a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : 'Unknown'
        })) || [])

        const { data: pts } = await supabase
          .from('patients')
          .select('*')
          .limit(3)
        setRecentPatients(pts || [])

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('appointment_id', id)
    return !error
  }

  return { doctor, upcomingAppointments, recentPatients, loading, error, updateAppointmentStatus }
}
