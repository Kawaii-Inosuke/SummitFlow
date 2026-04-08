"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";

type AuthMode = "landing" | "login" | "signup";

export default function AuthPage() {
  const { signUp } = useSupabaseAuth();
  const [mode, setMode] = useState<AuthMode>("landing");
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    regNo: "",
  });

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (loginType === "student" && !form.email.endsWith("@srmist.edu.in")) {
      setError("Only @srmist.edu.in emails are allowed");
      return;
    }

    setIsLoading(true);

    try {
      // Call signInWithPassword directly to get the session back
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;
      if (!authData.user) {
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authData.user.id)
        .single();

      if (!profile) {
        setError("User profile not found. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Admin role validation
      if (loginType === "admin" && profile.role !== "Admin") {
        await supabase.auth.signOut();
        setError("This account does not have admin access");
        setIsLoading(false);
        return;
      }

      // Set user in store and redirect with window.location for reliability
      useAuthStore.getState().login(profile);

      if (profile.role === "Admin") {
        window.location.href = "/admin/scanner";
      } else {
        window.location.href = "/discovery";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("Invalid login credentials") || message.includes("refresh_token_not_found")) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError(message);
      }
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.regNo) {
      setError("Please fill in all fields");
      return;
    }
    if (!form.email.endsWith("@srmist.edu.in")) {
      setError("Only @srmist.edu.in emails are allowed");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(form.email, form.password, form.name, form.regNo);

      // Sign in directly after signup
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError || !authData.user) {
        setError("Account created! Please sign in manually.");
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authData.user.id)
        .single();

      if (profile) {
        useAuthStore.getState().login(profile);
        window.location.href = "/discovery";
      } else {
        setError("Account created but profile not found. Please sign in.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      setIsLoading(false);
    }
  };

  // Landing page
  if (mode === "landing") {
    return (
      <div className="min-h-dvh bg-white flex flex-col">
        <div className="h-1 w-full bg-gradient-to-r from-brand-orange via-orange-400 to-brand-orange" />

        <div className="flex items-center gap-2 px-5 py-4">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <Image src="/icons/SummitFlow Logo.jpg" alt="SF" width={32} height={32} className="object-cover" />
          </div>
          <span className="font-bold text-slate-900">SummitFlow</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
          <div className="w-40 h-40 rounded-full border-2 border-slate-200 flex items-center justify-center mb-8 overflow-hidden bg-white shadow-sm">
            <Image src="/icons/SummitFlow Logo.jpg" alt="SummitFlow" width={120} height={120} className="object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-center leading-tight">
            Elevate Your<br /><span className="text-slate-900">Campus Events</span>
          </h1>
          <p className="text-slate-500 text-sm text-center mt-3 leading-relaxed max-w-[280px]">
            The modern event management layer for university life. Smart ticketing, QR check-ins, and real-time analytics in one place.
          </p>

          <div className="w-full max-w-[280px] space-y-3 mt-8">
            <button
              onClick={() => { setLoginType("student"); setMode("login"); }}
              className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="profile" variant="orange" size={18} className="brightness-0 invert" />
              Student Login
            </button>

            <button
              onClick={() => { setLoginType("admin"); setMode("login"); }}
              className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="settings" variant="dark" size={18} />
              Admin Portal
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">New to SummitFlow?</p>
            <button onClick={() => setMode("signup")} className="text-info text-sm font-medium hover:underline">
              Apply for an Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login / Signup forms
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-brand-orange via-orange-400 to-brand-orange" />

      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => { setMode("landing"); setError(""); setForm({ email: "", password: "", name: "", regNo: "" }); }} className="p-1 -ml-1 rounded-lg hover:bg-slate-100">
          <Icon name="back" variant="dark" size={20} />
        </button>
        <span className="font-bold text-slate-900">{mode === "login" ? "Welcome Back" : "Create Account"}</span>
      </div>

      <div className="flex-1 px-6 pt-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center overflow-hidden">
            <Image src="/icons/SummitFlow Logo.jpg" alt="SF" width={48} height={48} className="object-contain" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center">
          {mode === "login"
            ? loginType === "admin" ? "Admin Sign In" : "Student Sign In"
            : "Join SummitFlow"
          }
        </h2>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">
          {mode === "login" ? "Enter your university credentials" : "Fill in your details to get started"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-100 rounded-xl">
            <p className="text-xs text-error-600 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text" placeholder="Your full name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Registration Number</label>
                <input
                  type="text" placeholder="RA22110030XXXXX" value={form.regNo}
                  onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email" placeholder="you@srmist.edu.in" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
            />
            {(mode === "signup" || loginType === "student") && (
              <p className="text-[10px] text-slate-300 mt-1">Only @srmist.edu.in domain accepted</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            disabled={isLoading}
            className="w-full bg-brand-orange text-white font-semibold py-3.5 rounded-xl hover:bg-brand-orange-hover transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading
              ? "Please wait..."
              : mode === "login" ? "Sign In" : "Create Account"
            }
          </button>
        </div>

        <div className="mt-6 text-center">
          {mode === "login" ? (
            // Only show signup link for student login, not admin
            loginType === "student" ? (
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }} className="text-brand-orange font-medium">
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Admin accounts are system-assigned.<br />
                Contact the administrator if you need access.
              </p>
            )
          ) : (
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-brand-orange font-medium">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
