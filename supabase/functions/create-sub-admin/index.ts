import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // Create admin client (with service role for privileged operations)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Create user client (to verify the calling user)
    const authHeader = req.headers.get("Authorization")!
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify the calling user
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check that caller is an active super_admin
    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single()

    if (profileError || !callerProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (callerProfile.role !== "super_admin" || !callerProfile.is_active) {
      return new Response(JSON.stringify({ error: "Only active Super Admins can create Sub Admins" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Parse request body
    const { full_name, email, password, city_id } = await req.json()

    if (!full_name || !email || !password) {
      return new Response(JSON.stringify({ error: "full_name, email, and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Create new auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "sub_admin" },
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Upsert profile with sub_admin role
    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .upsert({
        id: newUser.user.id,
        email,
        full_name,
        role: "sub_admin",
        city_id: city_id || null,
        is_active: true,
      })

    if (profileUpdateError) {
      // Rollback: delete the created auth user
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return new Response(JSON.stringify({ error: profileUpdateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Log the activity
    await adminClient.from("activity_logs").insert({
      user_id: user.id,
      action: "create_sub_admin",
      table_name: "profiles",
      record_id: newUser.user.id,
      details: `Created sub admin: ${email} for city: ${city_id || "none"}`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sub Admin created successfully",
        user_id: newUser.user.id,
        email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
