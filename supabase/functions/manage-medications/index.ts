import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders })
    }

    const { action, medicationId, medicationData, reminderTimes } = await req.json()

    if (action === "create") {
      const { data: med, error: medError } = await supabase
        .from("medication_adherence")
        .insert([{
          patient_id: user.id,
          medication_name: medicationData.medication_name,
          dosage: medicationData.dosage,
          frequency_per_day: medicationData.frequency_per_day,
          medication_type: medicationData.medication_type || 'PILL',
          start_date: medicationData.start_date,
          end_date: medicationData.end_date,
          instructions: medicationData.instructions,
          reminder_times: reminderTimes,
          is_active: true,
        }])
        .select()

      if (medError) throw medError

      if (med && med.length > 0) {
        const adherenceId = med[0].adherence_id
        const startDate = new Date(medicationData.start_date)
        const durationDays = 30; // Default to 30 days if no end date
        const endDate = medicationData.end_date 
          ? new Date(medicationData.end_date) 
          : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

        const doses = []
        let currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          for (const time of reminderTimes) {
            const [hours, minutes] = time.split(":").map(Number)
            const doseDateTime = new Date(currentDate)
            doseDateTime.setHours(hours, minutes, 0, 0)
            
            if (doseDateTime >= startDate) {
              doses.push({
                adherence_id: adherenceId,
                scheduled_datetime: doseDateTime.toISOString(),
                status: "PENDING",
              })
            }
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }

        if (doses.length > 0) {
          const { error: dosesError } = await supabase.from("medication_doses").insert(doses)
          if (dosesError) throw dosesError
        }
      }

      return new Response(JSON.stringify({ success: true, data: med }), { status: 200, headers: corsHeaders })
    }

    if (action === "update") {
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
      
      // Optional: Regenerate future doses if reminder times changed
      // For now, keeping it simple as per user request for "easy storage"
      
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    }

    if (action === "delete") {
      // Doses will be deleted by ON DELETE CASCADE if configured, 
      // otherwise we delete them manually
      await supabase.from("medication_doses").delete().eq("adherence_id", medicationId)
      
      const { error: deleteError } = await supabase
        .from("medication_adherence")
        .delete()
        .eq("adherence_id", medicationId)
        .eq("patient_id", user.id)

      if (deleteError) throw deleteError
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    }

    if (action === "update_dose") {
      const { doseId, status } = medicationData
      const { error: updateError } = await supabase
        .from("medication_doses")
        .update({
          status: status,
          taken_at: status === "TAKEN" ? new Date().toISOString() : null,
        })
        .eq("dose_id", doseId)

      if (updateError) throw updateError
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders })
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
