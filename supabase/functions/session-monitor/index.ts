
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Session monitor check started');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active sessions that have expired
    const now = new Date().toISOString();
    const { data: expiredSessions, error: sessionError } = await supabaseClient
      .from('user_sessions')
      .select(`
        *,
        users!inner(*)
      `)
      .eq('is_active', true)
      .lt('end_time', now);

    if (sessionError) {
      throw new Error("Failed to fetch expired sessions");
    }

    console.log(`Found ${expiredSessions?.length || 0} expired sessions`);

    for (const session of expiredSessions || []) {
      try {
        // Deactivate the session
        await supabaseClient
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', session.id);

        // Get user's MAC address from their device info (you may need to add this to your users table)
        // For now, we'll assume MAC address is stored in user metadata or a separate devices table
        const { data: userDevices } = await supabaseClient
          .from('user_devices')
          .select('mac_address')
          .eq('user_id', session.user_id)
          .limit(1);

        if (userDevices && userDevices.length > 0) {
          const macAddress = userDevices[0].mac_address;
          
          // Call router blacklist function
          const blacklistResponse = await supabaseClient.functions.invoke('manage-router-blacklist', {
            body: {
              action: 'blacklist',
              macAddress: macAddress,
              userId: session.user_id
            }
          });

          if (blacklistResponse.error) {
            console.error(`Failed to blacklist user ${session.user_id}:`, blacklistResponse.error);
          } else {
            console.log(`Successfully blacklisted user ${session.user_id} with MAC ${macAddress}`);
          }
        }

        // Log session expiry
        await supabaseClient
          .from('usage_logs')
          .insert({
            user_id: session.user_id,
            session_id: session.id,
            action: 'session_expired',
            details: {
              expired_at: now,
              auto_blacklisted: true
            }
          });

      } catch (error) {
        console.error(`Error processing expired session ${session.id}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processedSessions: expiredSessions?.length || 0,
      message: "Session monitoring completed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Session monitor error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
