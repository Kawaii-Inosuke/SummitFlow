"use client";

import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useSupabaseData } from "@/hooks/use-supabase-data";

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize Supabase auth listener
  useSupabaseAuth();
  // Fetch events and registrations from Supabase
  useSupabaseData();

  return <>{children}</>;
}
