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

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const authHeader = req.headers.get("Authorization")!
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify calling user
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Verify caller is active super_admin
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single()

    if (!callerProfile || callerProfile.role !== "super_admin" || !callerProfile.is_active) {
      return new Response(JSON.stringify({ error: "Only Super Admins can update admin users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { target_user_id, full_name, city_id, is_active } = await req.json()

    if (!target_user_id) {
      return new Response(JSON.stringify({ error: "target_user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get target user profile
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", target_user_id)
      .single()

    if (!targetProfile) {
      return new Response(JSON.stringify({ error: "Target user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Prevent deactivating the last super_admin
    if (targetProfile.role === "super_admin" && is_active === false) {
      const { count } = await adminClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("is_active", true)

      if (count && count <= 1) {
        return new Response(
          JSON.stringify({ error: "Cannot deactivate the last active Super Admin" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (city_id !== undefined) updates.city_id = city_id
    if (is_active !== undefined) updates.is_active = is_active

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", target_user_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Log activity
    await adminClient.from("activity_logs").insert({
      user_id: user.id,
      action: "update_admin_user",
      table_name: "profiles",
      record_id: target_user_id,
      details: `Updated admin user: ${JSON.stringify(updates)}`,
    })

    return new Response(
      JSON.stringify({ success: true, message: "User updated successfully" }),
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
