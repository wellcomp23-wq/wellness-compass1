import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

// ✅ FIXED: Use UPPERCASE values that match the database enum
export const AppRoles = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  PHARMACIST: "PHARMACIST",
  LAB_MANAGER: "LAB_MANAGER",
  HOSPITAL_MANAGER: "HOSPITAL_MANAGER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
} as const;

export type AppRole = typeof AppRoles[keyof typeof AppRoles];

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return session.user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data;
};

// ✅ FIXED: Query from 'users' table instead of 'user_roles'
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    return data?.role || null;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
};

// ✅ FIXED: Use UPPERCASE role values
export const getRoleBasedRedirect = (role: UserRole | null): string => {
  switch (role) {
    case AppRoles.PATIENT:
      return "/home";
    case AppRoles.DOCTOR:
      return "/doctor-dashboard";
    case AppRoles.PHARMACIST:
      return "/pharmacy-dashboard";
    case AppRoles.LAB_MANAGER:
      return "/lab-dashboard";
    case AppRoles.HOSPITAL_MANAGER:
      return "/hospital-dashboard";
    case AppRoles.SYSTEM_ADMIN:
      return "/admin-dashboard";
    default:
      return "/home"; // Default for unknown roles
  }
};

export const signOut = async () => {
  const { error } = await supabase.signOut();
  if (error) throw error;
};
