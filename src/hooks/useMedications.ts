import { useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "./use-toast"

export interface Medication {
  adherence_id: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency_per_day: number
  start_date: string
  end_date?: string
  instructions?: string
  is_active: boolean
  created_at: string
  medication_type?: string
  image_url?: string
  reminder_times?: string[]
}

export interface Dose {
  dose_id: string
  adherence_id: string
  scheduled_datetime: string
  status: "PENDING" | "TAKEN" | "SKIPPED"
  taken_at?: string
  notes?: string
}

export function useMedications() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error: fetchError } = await supabase
        .from("medication_adherence")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setMedications(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch medications"
      setError(message)
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const addMedication = useCallback(
    async (medicationData: Omit<Medication, "adherence_id" | "patient_id" | "created_at">, reminderTimes: string[]) => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { data, error: insertError } = await supabase
          .from("medication_adherence")
          .insert([
            {
              patient_id: user.id,
              medication_name: medicationData.medication_name,
              dosage: medicationData.dosage,
              frequency_per_day: medicationData.frequency_per_day,
              medication_type: medicationData.medication_type,
              start_date: medicationData.start_date,
              end_date: medicationData.end_date,
              instructions: medicationData.instructions,
              reminder_times: reminderTimes,
              is_active: medicationData.is_active,
            },
          ])
          .select()

        if (insertError) throw insertError

        // Generate doses for the next 30 days
        if (data && data.length > 0) {
          const adherenceId = data[0].adherence_id
          const startDate = new Date(medicationData.start_date)
          const endDate = medicationData.end_date
            ? new Date(medicationData.end_date)
            : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

          const doses = []
          let currentDate = new Date(startDate)

          while (currentDate <= endDate) {
            for (const time of reminderTimes) {
              const [hours, minutes] = time.split(":").map(Number)
              const doseDateTime = new Date(currentDate)
              doseDateTime.setHours(hours, minutes, 0, 0)

              doses.push({
                adherence_id: adherenceId,
                scheduled_datetime: doseDateTime.toISOString(),
                status: "PENDING",
              })
            }

            currentDate.setDate(currentDate.getDate() + 1)
          }

          if (doses.length > 0) {
            const { error: dosesError } = await supabase
              .from("medication_doses")
              .insert(doses)

            if (dosesError) throw dosesError
          }
        }

        toast({
          title: "نجاح",
          description: "تم إضافة الدواء بنجاح",
        })

        await fetchMedications()
        return data?.[0]
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add medication"
        setError(message)
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchMedications]
  )

  const updateMedication = useCallback(
    async (medicationId: string, medicationData: Omit<Medication, "adherence_id" | "patient_id" | "created_at">, reminderTimes: string[]) => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { error: updateError } = await supabase
          .from("medication_adherence")
          .update({
            medication_name: medicationData.medication_name,
            dosage: medicationData.dosage,
            frequency_per_day: medicationData.frequency_per_day,
            medication_type: medicationData.medication_type,
            start_date: medicationData.start_date,
            end_date: medicationData.end_date,
            instructions: medicationData.instructions,
            reminder_times: reminderTimes,
          })
          .eq("adherence_id", medicationId)
          .eq("patient_id", user.id)

        if (updateError) throw updateError

        toast({
          title: "نجاح",
          description: "تم تحديث الدواء بنجاح",
        })

        await fetchMedications()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update medication"
        setError(message)
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchMedications]
  )

  const deleteMedication = useCallback(
    async (medicationId: string) => {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { error: deleteError } = await supabase
          .from("medication_adherence")
          .delete()
          .eq("adherence_id", medicationId)
          .eq("patient_id", user.id)

        if (deleteError) throw deleteError

        toast({
          title: "نجاح",
          description: "تم حذف الدواء بنجاح",
        })

        await fetchMedications()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete medication"
        setError(message)
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchMedications]
  )

  const toggleMedication = useCallback(
    async (medicationId: string, currentState: boolean) => {
      try {
        setLoading(true)
        setError(null)

        const { error: updateError } = await supabase
          .from("medication_adherence")
          .update({ is_active: !currentState })
          .eq("adherence_id", medicationId)

        if (updateError) throw updateError

        setMedications(prev =>
          prev.map(m =>
            m.adherence_id === medicationId ? { ...m, is_active: !currentState } : m
          )
        )

        toast({
          title: "نجاح",
          description: !currentState ? "تم تفعيل الدواء" : "تم إيقاف الدواء",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to toggle medication"
        setError(message)
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast]
  )

  const getDoses = useCallback(
    async (adherenceId: string) => {
      try {
        const { data, error: fetchError } = await supabase
          .from("medication_doses")
          .select("*")
          .eq("adherence_id", adherenceId)
          .order("scheduled_datetime", { ascending: true })

        if (fetchError) throw fetchError

        return data || []
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch doses"
        console.error(message)
        return []
      }
    },
    []
  )

  const updateDoseStatus = useCallback(
    async (doseId: string, status: "TAKEN" | "SKIPPED" | "PENDING") => {
      try {
        const { error: updateError } = await supabase
          .from("medication_doses")
          .update({
            status,
            taken_at: status === "TAKEN" ? new Date().toISOString() : null,
          })
          .eq("dose_id", doseId)

        if (updateError) throw updateError

        toast({
          title: "نجاح",
          description: "تم تحديث حالة الجرعة",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update dose"
        toast({
          title: "خطأ",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast]
  )

  return {
    medications,
    loading,
    error,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    toggleMedication,
    getDoses,
    updateDoseStatus,
  }
}
