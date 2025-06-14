
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Get user session request received');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    console.log(`Getting active session for user ${user.id}`);

    // Get active session
    const { data: session, error: sessionError } = await supabaseClient
      .from('user_sessions')
      .select(`
        *,
        data_plans(*),
        payments(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      throw new Error("Failed to fetch user session");
    }

    if (!session) {
      return new Response(JSON.stringify({
        hasActiveSession: false,
        session: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if session has expired
    const now = new Date();
    const endTime = new Date(session.end_time);
    
    if (now > endTime) {
      // Deactivate expired session
      await supabaseClient
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      // Log session end
      await supabaseClient
        .from('usage_logs')
        .insert({
          user_id: user.id,
          session_id: session.id,
          action: 'session_expired',
          details: {
            expired_at: now.toISOString()
          }
        });

      return new Response(JSON.stringify({
        hasActiveSession: false,
        session: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      hasActiveSession: true,
      session: {
        id: session.id,
        planName: session.data_plans.name,
        duration: `${session.data_plans.duration_hours} ${session.data_plans.duration_hours === 1 ? 'hour' : 'hours'}`,
        price: session.data_plans.price_ksh,
        startTime: session.start_time,
        endTime: session.end_time,
        isActive: session.is_active
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Get user session error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      hasActiveSession: false,
      session: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
