
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Payment creation request received');
  
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

    const { planId, phoneNumber } = await req.json();
    
    if (!planId || !phoneNumber) {
      throw new Error("Plan ID and phone number are required");
    }

    console.log(`Creating payment for user ${user.id}, plan ${planId}`);

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('data_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount_ksh: plan.price_ksh,
        phone_number: phoneNumber,
        status: 'pending',
        payment_method: 'mpesa'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error("Failed to create payment record");
    }

    console.log('Payment record created:', payment.id);

    // Simulate M-Pesa STK push process
    // In a real implementation, you would integrate with Safaricom's M-Pesa API
    const mockMpesaResponse = {
      success: true,
      transactionId: `MPESA${Date.now()}`,
      checkoutRequestId: payment.id
    };

    return new Response(JSON.stringify({
      success: true,
      paymentId: payment.id,
      message: "Payment initiated successfully",
      mpesaResponse: mockMpesaResponse
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
