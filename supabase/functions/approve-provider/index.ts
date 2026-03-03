import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { applicationId } = await req.json()

    if (!applicationId) {
      throw new Error('Application ID is required')
    }

    // 1. Get application details
    const { data: app, error: appError } = await supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (appError || !app) {
      throw new Error('Application not found')
    }

    if (app.status !== 'PENDING') {
      throw new Error('Application is already processed')
    }

    // 2. Generate credentials
    const username = app.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
    const password = Math.random().toString(36).slice(-10) + "!";

    // 3. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: app.email,
      password: password,
      email_confirm: true,
      user_metadata: { role: app.role_requested }
    })

    if (authError) throw authError

    const userId = authUser.user.id

    // 4. Create User Profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: userId,
        email: app.email,
        phone_number: app.phone,
        role: app.role_requested,
        username: username,
        account_status: 'ACTIVE'
      })

    if (profileError) throw profileError

    // 5. Create Role Specific Record
    if (app.role_requested === 'DOCTOR') {
      await supabaseAdmin.from('doctors').insert({
        doctor_id: userId,
        first_name: app.first_name,
        last_name: app.last_name,
        specialization: 'General',
        license_number: 'LIC-' + userId.substring(0, 8)
      })
    } else if (app.role_requested === 'PHARMACIST') {
      await supabaseAdmin.from('pharmacists').insert({
        pharmacist_id: userId,
        first_name: app.first_name,
        last_name: app.last_name,
        license_number: 'LIC-' + userId.substring(0, 8)
      })
    } else if (app.role_requested === 'LAB_MANAGER') {
      await supabaseAdmin.from('laboratories').insert({
        lab_id: userId,
        name: app.first_name + ' ' + app.last_name,
        address: 'To be updated',
        license_number: 'LIC-' + userId.substring(0, 8)
      })
    } else if (app.role_requested === 'HOSPITAL_MANAGER') {
      await supabaseAdmin.from('hospitals').insert({
        hospital_id: userId,
        name: app.first_name + ' ' + app.last_name,
        address: 'To be updated',
        email: app.email,
        phone_number: app.phone
      })
    }

    // 6. Update Application Status
    const { error: updateError } = await supabaseAdmin
      .from('provider_applications')
      .update({ 
        status: 'APPROVED', 
        user_id: userId 
      })
      .eq('id', applicationId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        username, 
        password,
        email: app.email 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
