import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { jwtVerify, SignJWT } from "https://esm.sh/jose@5.0.0";

// Type Definitions
interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    user_id?: string;
    session?: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    user?: {
      id: string;
      phone_number: string;
      role?: string;
    };
  };
  error?: string;
  status_code?: number;
}

// Utility Functions
function isValidPhoneFormat(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

function isValidOTPCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

async function verifyOTPWithTwilio(
  phoneNumber: string,
  otpCode: string,
  twilioAccountSid: string,
  twilioAuthToken: string,
  twilioVerifyServiceSid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phoneNumber,
          Code: otpCode,
        }).toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "OTP verification failed",
      };
    }

    if (data.status !== "approved") {
      return {
        success: false,
        error: "Invalid or expired OTP code",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Twilio verification error:", error);
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
      attempt_type: "VERIFY",
      status: status,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error("Failed to record OTP attempt:", error);
  }
}

async function updateOTPVerificationStatus(
  supabaseClient: any,
  phoneNumber: string,
  status: "VERIFIED" | "FAILED" | "EXPIRED"
): Promise<void> {
  try {
    const updates: any = {
      verification_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "VERIFIED") {
      updates.verified_at = new Date().toISOString();
    }

    await supabaseClient
      .from("otp_verifications")
      .update(updates)
      .eq("phone_number", phoneNumber);
  } catch (error) {
    console.error("Failed to update OTP verification status:", error);
  }
}

async function findOrCreateUser(
  supabaseClient: any,
  phoneNumber: string
): Promise<{
  success: boolean;
  userId?: string;
  isNewUser?: boolean;
  error?: string;
}> {
  try {
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabaseClient
      .from("users")
      .select("user_id, role")
      .eq("phone_number", phoneNumber)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking for existing user:", selectError);
      return {
        success: false,
        error: "Database error while checking user",
      };
    }

    if (existingUser) {
      // User exists
      return {
        success: true,
        userId: existingUser.user_id,
        isNewUser: false,
      };
    }

    // Create new user
    // Note: In a real scenario, you might want to use Supabase Auth to create the user
    // For now, we'll create a user in the users table
    const { data: newUser, error: insertError } = await supabaseClient
      .from("users")
      .insert({
        phone_number: phoneNumber,
        role: "PATIENT", // Default role for new users
        account_status: "ACTIVE",
      })
      .select("user_id")
      .single();

    if (insertError) {
      console.error("Error creating new user:", insertError);
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    return {
      success: true,
      userId: newUser.user_id,
      isNewUser: true,
    };
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    return {
      success: false,
      error: `User management error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function createJWTSession(
  userId: string,
  phoneNumber: string,
  jwtSecret: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const expiresIn = 60 * 60 * 24; // 24 hours

    // Create access token
    const accessToken = await new SignJWT({
      sub: userId,
      phone_number: phoneNumber,
      type: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(`${expiresIn}s`)
      .setIssuedAt()
      .sign(secret);

    // Create refresh token (longer expiration)
    const refreshExpiresIn = 60 * 60 * 24 * 7; // 7 days
    const refreshToken = await new SignJWT({
      sub: userId,
      phone_number: phoneNumber,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(`${refreshExpiresIn}s`)
      .setIssuedAt()
      .sign(secret);

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn,
    };
  } catch (error) {
    console.error("Error creating JWT session:", error);
    return {
      success: false,
      error: `Session creation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Main Handler
serve(async (req: Request): Promise<Response> => {
  // Handle CORS
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

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
        status_code: 405,
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    // Parse request body
    const body: VerifyOTPRequest = await req.json();
    const { phone_number, otp_code } = body;

    // Validate input
    if (!phone_number || typeof phone_number !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Phone number is required",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (!otp_code || typeof otp_code !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OTP code is required",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate phone format
    if (!isValidPhoneFormat(phone_number)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid phone number format",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate OTP format
    if (!isValidOTPCode(otp_code)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid OTP format. Must be 6 digits.",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");
    const JWT_SECRET = Deno.env.get("JWT_SECRET");

    // Validate environment variables
    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !TWILIO_ACCOUNT_SID ||
      !TWILIO_AUTH_TOKEN ||
      !TWILIO_VERIFY_SERVICE_SID ||
      !JWT_SECRET
    ) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
          status_code: 500,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get client IP address
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Check if OTP verification record exists and is not expired
    const { data: otpRecord, error: otpError } = await supabaseClient
      .from("otp_verifications")
      .select("*")
      .eq("phone_number", phone_number)
      .eq("verification_status", "PENDING")
      .single();

    if (otpError || !otpRecord) {
      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "FAILED",
        "No pending OTP verification found"
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "No pending OTP verification. Please request a new one.",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await updateOTPVerificationStatus(
        supabaseClient,
        phone_number,
        "EXPIRED"
      );
      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "FAILED",
        "OTP code expired"
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "OTP code has expired. Please request a new one.",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts_count >= otpRecord.max_attempts) {
      await updateOTPVerificationStatus(
        supabaseClient,
        phone_number,
        "FAILED"
      );
      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "BLOCKED",
        "Max verification attempts exceeded"
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many failed attempts. Please request a new OTP.",
          status_code: 429,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Verify OTP with Twilio
    const twilioResult = await verifyOTPWithTwilio(
      phone_number,
      otp_code,
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_VERIFY_SERVICE_SID
    );

    if (!twilioResult.success) {
      // Increment attempts count
      await supabaseClient
        .from("otp_verifications")
        .update({
          attempts_count: otpRecord.attempts_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("phone_number", phone_number);

      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "FAILED",
        twilioResult.error
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: twilioResult.error || "OTP verification failed",
          status_code: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // OTP verified successfully
    await updateOTPVerificationStatus(
      supabaseClient,
      phone_number,
      "VERIFIED"
    );

    // Find or create user
    const userResult = await findOrCreateUser(supabaseClient, phone_number);

    if (!userResult.success || !userResult.userId) {
      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "FAILED",
        userResult.error
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: userResult.error || "Failed to process user account",
          status_code: 500,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Create JWT session
    const sessionResult = await createJWTSession(
      userResult.userId,
      phone_number,
      JWT_SECRET
    );

    if (!sessionResult.success) {
      await recordOTPAttempt(
        supabaseClient,
        phone_number,
        ipAddress,
        "FAILED",
        sessionResult.error
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: sessionResult.error || "Failed to create session",
          status_code: 500,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Record successful verification
    await recordOTPAttempt(
      supabaseClient,
      phone_number,
      ipAddress,
      "SUCCESS"
    );

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully",
        data: {
          user_id: userResult.userId,
          session: {
            access_token: sessionResult.accessToken,
            refresh_token: sessionResult.refreshToken,
            expires_in: sessionResult.expiresIn,
          },
          user: {
            id: userResult.userId,
            phone_number: phone_number,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in verify-otp:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        status_code: 500,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
