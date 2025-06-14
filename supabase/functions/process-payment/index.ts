
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Payment processing request received');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { paymentId, mpesaTransactionId } = await req.json();
    
    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    console.log(`Processing payment ${paymentId}`);

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*, data_plans(*)')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // Simulate payment verification (in real implementation, verify with M-Pesa)
    const paymentSuccessful = true; // Mock success

    if (paymentSuccessful) {
      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          mpesa_transaction_id: mpesaTransactionId || `MPESA${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) {
        throw new Error("Failed to update payment status");
      }

      // Create user session
      const sessionEndTime = new Date();
      sessionEndTime.setHours(sessionEndTime.getHours() + payment.data_plans.duration_hours);

      const { data: session, error: sessionError } = await supabaseClient
        .from('user_sessions')
        .insert({
          user_id: payment.user_id,
          plan_id: payment.plan_id,
          payment_id: payment.id,
          end_time: sessionEndTime.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error("Failed to create user session");
      }

      console.log('User session created:', session.id);

      // Log the action
      await supabaseClient
        .from('usage_logs')
        .insert({
          user_id: payment.user_id,
          session_id: session.id,
          action: 'session_started',
          details: {
            plan_name: payment.data_plans.name,
            duration_hours: payment.data_plans.duration_hours,
            amount_paid: payment.amount_ksh
          }
        });

      return new Response(JSON.stringify({
        success: true,
        sessionId: session.id,
        message: "Payment processed and session created successfully"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      // Update payment status to failed
      await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      throw new Error("Payment verification failed");
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
