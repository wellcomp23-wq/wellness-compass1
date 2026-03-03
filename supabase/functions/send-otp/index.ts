import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Type Definitions
interface SendOTPRequest {
  phone_number: string;
  country_code?: string;
}

// Utility Functions
function normalizeYemeniPhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (!/^(7|1)\d{8}$/.test(cleaned)) {
    return null;
  }
  return `+967${cleaned}`;
}

function normalizeUSPhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  // US phone numbers should be 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return null;
  }
  return `+1${cleaned}`;
}

function isValidPhoneFormat(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

async function sendOTPViaTwilio(
  phoneNumber: string,
  twilioAccountSid: string,
  twilioAuthToken: string,
  twilioVerifyServiceSid: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    console.log(`Attempting to send OTP to: ${phoneNumber}`);
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Channel: "sms",
        }).toString(),
      }
    );

    const data = await response.json();
    console.log("Twilio API Response Status:", response.status);

    if (!response.ok) {
      console.error("Twilio API Error Data:", JSON.stringify(data));
      return {
        success: false,
        error: data.message || `Twilio error ${response.status}`,
      };
    }

    console.log("Twilio OTP sent successfully, SID:", data.sid);
    return {
      success: true,
      sid: data.sid,
    };
  } catch (error) {
    console.error("Twilio Fetch Exception:", error);
    return {
      success: false,
      error: `Twilio service error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function recordOTPAttempt(
  supabaseClient: any,
  phoneNumber: string,
  ipAddress: string,
  status: "SUCCESS" | "FAILED" | "BLOCKED",
  errorMessage?: string
): Promise<void> {
  try {
    await supabaseClient.from("otp_attempts").insert({
      phone_number: phoneNumber,
      ip_address: ipAddress,
      attempt_type: "SEND",
      status: status,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error("Failed to record OTP attempt in DB:", error);
  }
}

async function createOrUpdateOTPVerification(
  supabaseClient: any,
  phoneNumber: string,
  twilioSid: string
): Promise<void> {
  try {
    const { data: existingData } = await supabaseClient
      .from("otp_verifications")
      .select("id")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (existingData) {
      await supabaseClient
        .from("otp_verifications")
        .update({
          twilio_sid: twilioSid,
          verification_status: "PENDING",
          attempts_count: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("phone_number", phoneNumber);
    } else {
      await supabaseClient.from("otp_verifications").insert({
        phone_number: phoneNumber,
        twilio_sid: twilioSid,
        verification_status: "PENDING",
        attempts_count: 0,
        max_attempts: 3,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.error("Failed to create/update OTP verification in DB:", error);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const body: SendOTPRequest = await req.json();
    const { phone_number } = body;

    if (!phone_number) {
      return new Response(JSON.stringify({ success: false, error: "Phone number required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Try to normalize as Yemeni number first
    let normalizedPhone = normalizeYemeniPhoneNumber(phone_number);
    
    // If not Yemeni, try US number
    if (!normalizedPhone) {
      normalizedPhone = normalizeUSPhoneNumber(phone_number);
    }
    
    // If still not normalized, check if it's already in E.164 format
    if (!normalizedPhone) {
      if (isValidPhoneFormat(phone_number)) {
        normalizedPhone = phone_number;
      } else {
        return new Response(JSON.stringify({ success: false, error: "Invalid phone format. Use +1 (US) or +967 (Yemen)" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }
    
    console.log(`Normalized phone number: ${phone_number} -> ${normalizedPhone}`);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      console.error("Missing Env Vars");
      return new Response(JSON.stringify({ success: false, error: "Server config error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    const twilioResult = await sendOTPViaTwilio(
      normalizedPhone,
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_VERIFY_SERVICE_SID
    );

    if (!twilioResult.success) {
      await recordOTPAttempt(supabaseClient, normalizedPhone, ipAddress, "FAILED", twilioResult.error);
      return new Response(JSON.stringify({ success: false, error: twilioResult.error }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    await recordOTPAttempt(supabaseClient, normalizedPhone, ipAddress, "SUCCESS");
    await createOrUpdateOTPVerification(supabaseClient, normalizedPhone, twilioResult.sid || "");

    return new Response(JSON.stringify({ success: true, message: "OTP sent", data: { sid: twilioResult.sid } }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Global Handler Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
