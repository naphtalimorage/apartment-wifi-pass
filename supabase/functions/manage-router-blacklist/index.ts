
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RouterConfig {
  ip: string;
  username: string;
  password: string;
}

const ROUTER_CONFIG: RouterConfig = {
  ip: "192.168.1.1", // You'll need to update this with your actual router IP
  username: "telecomadmin",
  password: "admintelecom"
};

// Helper function to login to router and get session cookie
async function loginToRouter(config: RouterConfig): Promise<string | null> {
  try {
    console.log(`Attempting to login to router at ${config.ip}`);
    
    // First, get the login page to establish session
    const loginPageResponse = await fetch(`http://${config.ip}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!loginPageResponse.ok) {
      throw new Error(`Failed to access router login page: ${loginPageResponse.status}`);
    }

    // Extract session cookie if present
    const cookies = loginPageResponse.headers.get('set-cookie') || '';
    
    // Prepare login data (this may vary based on exact router model)
    const loginData = new URLSearchParams({
      Username: config.username,
      Password: config.password,
      action: 'login'
    });

    // Attempt login
    const loginResponse = await fetch(`http://${config.ip}/login.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookies
      },
      body: loginData.toString()
    });

    if (loginResponse.ok) {
      const sessionCookie = loginResponse.headers.get('set-cookie') || cookies;
      console.log('Successfully logged into router');
      return sessionCookie;
    } else {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
  } catch (error) {
    console.error('Router login error:', error);
    return null;
  }
}

// Function to add MAC address to blacklist
async function addToBlacklist(macAddress: string, sessionCookie: string): Promise<boolean> {
  try {
    console.log(`Adding MAC ${macAddress} to blacklist`);
    
    // This endpoint may vary - common paths include:
    // /firewall.cgi, /access_control.cgi, /mac_filter.cgi
    const blacklistData = new URLSearchParams({
      action: 'add_blacklist',
      mac_address: macAddress,
      status: 'enabled'
    });

    const response = await fetch(`http://${ROUTER_CONFIG.ip}/mac_filter.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: blacklistData.toString()
    });

    return response.ok;
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return false;
  }
}

// Function to remove MAC address from blacklist
async function removeFromBlacklist(macAddress: string, sessionCookie: string): Promise<boolean> {
  try {
    console.log(`Removing MAC ${macAddress} from blacklist`);
    
    const unblacklistData = new URLSearchParams({
      action: 'remove_blacklist',
      mac_address: macAddress
    });

    const response = await fetch(`http://${ROUTER_CONFIG.ip}/mac_filter.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: unblacklistData.toString()
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing from blacklist:', error);
    return false;
  }
}

serve(async (req) => {
  console.log('Router blacklist management request received');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, macAddress, userId } = await req.json();
    
    if (!action || !macAddress) {
      throw new Error("Action and MAC address are required");
    }

    console.log(`Processing ${action} for MAC: ${macAddress}, User: ${userId}`);

    // Login to router
    const sessionCookie = await loginToRouter(ROUTER_CONFIG);
    if (!sessionCookie) {
      throw new Error("Failed to login to router");
    }

    let success = false;
    
    if (action === 'blacklist') {
      success = await addToBlacklist(macAddress, sessionCookie);
      
      // Log the action
      if (userId) {
        await supabaseClient
          .from('usage_logs')
          .insert({
            user_id: userId,
            action: 'blacklisted',
            details: {
              mac_address: macAddress,
              reason: 'session_expired_or_payment_failed'
            }
          });
      }
    } else if (action === 'unblacklist') {
      success = await removeFromBlacklist(macAddress, sessionCookie);
      
      // Log the action
      if (userId) {
        await supabaseClient
          .from('usage_logs')
          .insert({
            user_id: userId,
            action: 'unblacklisted',
            details: {
              mac_address: macAddress,
              reason: 'payment_received'
            }
          });
      }
    } else {
      throw new Error("Invalid action. Use 'blacklist' or 'unblacklist'");
    }

    return new Response(JSON.stringify({
      success,
      message: success ? `Successfully ${action}ed MAC address` : `Failed to ${action} MAC address`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: success ? 200 : 400,
    });

  } catch (error) {
    console.error('Router blacklist management error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
