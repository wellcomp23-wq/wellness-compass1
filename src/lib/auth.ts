import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

// Define the roles for clarity and consistency
export const AppRoles = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  PHARMACIST: "pharmacy",
  LAB_MANAGER: "lab",
  HOSPITAL_MANAGER: "hospital",
  SYSTEM_ADMIN: "admin",
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

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  
  if (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
  return data?.role || null;
};

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
      return "/home"; // Default for unknown roles or patients
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
