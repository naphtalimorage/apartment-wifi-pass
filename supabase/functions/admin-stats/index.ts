
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Admin stats request received');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Using service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log('Fetching admin statistics');

    // Get total users
    const { count: totalUsers, error: usersError } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      throw new Error("Failed to fetch users count");
    }

    // Get active sessions
    const { count: activeSessions, error: sessionsError } = await supabaseClient
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString());

    if (sessionsError) {
      throw new Error("Failed to fetch active sessions count");
    }

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayPayments, error: revenueError } = await supabaseClient
      .from('payments')
      .select('amount_ksh')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    if (revenueError) {
      throw new Error("Failed to fetch today's revenue");
    }

    const todayRevenue = todayPayments?.reduce((sum, payment) => sum + payment.amount_ksh, 0) || 0;

    // Get recent payments with user details
    const { data: recentPayments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        users(full_name, email),
        data_plans(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      throw new Error("Failed to fetch recent payments");
    }

    // Get current active sessions with user details
    const { data: currentSessions, error: currentSessionsError } = await supabaseClient
      .from('user_sessions')
      .select(`
        *,
        users(full_name, email),
        data_plans(name)
      `)
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (currentSessionsError) {
      throw new Error("Failed to fetch current sessions");
    }

    const stats = {
      totalUsers: totalUsers || 0,
      activeSessions: activeSessions || 0,
      todayRevenue,
      recentPayments: recentPayments || [],
      currentSessions: currentSessions || []
    };

    console.log('Admin stats fetched successfully');

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
