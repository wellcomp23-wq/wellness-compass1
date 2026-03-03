import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { app_id } = await req.json()

    if (!app_id) {
      return new Response(JSON.stringify({ error: 'app_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the application details
    const { data: app, error: appError } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('id', app_id)
      .single()

    if (appError || !app) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate username from email hash
    const emailHash = new TextEncoder().encode(app.email)
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailHash)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const username = hashHex.substring(0, 12)

    // Generate a strong random password
    const password = crypto.getRandomValues(new Uint8Array(16))
      .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '')

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: app.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        role: app.role_requested.toUpperCase()
      }
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message || 'Failed to create auth user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!authUser.user) {
      return new Response(JSON.stringify({ error: 'Failed to create auth user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = authUser.user.id

    // Create user profile in users table
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        user_id: userId,
        email: app.email,
        username: username,
        role: app.role_requested.toUpperCase(),
        account_status: 'ACTIVE',
        phone_number: app.phone
      }])

    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create provider-specific record
    if (app.role_requested.toUpperCase() === 'DOCTOR') {
      await supabase.from('doctors').insert([{
        doctor_id: userId,
        first_name: app.first_name,
        last_name: app.last_name,
        specialization: 'عام',
        license_number: 'LIC-' + username
      }])
    } else if (app.role_requested.toUpperCase() === 'PHARMACIST') {
      await supabase.from('pharmacists').insert([{
        pharmacist_id: userId,
        first_name: app.first_name,
        last_name: app.last_name,
        license_number: 'LIC-' + username
      }])
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('provider_applications')
      .update({
        status: 'APPROVED',
        user_id: userId
      })
      .eq('id', app_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      username: username,
      password: password,
      user_id: userId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
