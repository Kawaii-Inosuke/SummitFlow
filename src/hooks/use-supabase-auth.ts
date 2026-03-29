"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/types/database";

export function useSupabaseAuth() {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .single();

          if (profile) {
            login(profile as User);
          }
        } else {
          logout();
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [login, logout, setLoading]);

  const signInWithEmail = async (email: string, password: string, isAdmin = false) => {
    // Validate university domain for students only; admins can use any email
    if (!isAdmin && !email.endsWith("@srmist.edu.in")) {
      throw new Error("Only @srmist.edu.in email addresses are allowed");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, regNo: string) => {
    if (!email.endsWith("@srmist.edu.in")) {
      throw new Error("Only @srmist.edu.in email addresses are allowed");
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      await supabase.from("users").insert({
        auth_id: data.user.id,
        name,
        reg_no: regNo,
        email,
        role: "Student",
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      if (typeof window !== "undefined") {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
      logout();
    }
  };

  return { signInWithEmail, signUp, signOut };
}
