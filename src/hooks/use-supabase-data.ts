"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useEventStore } from "@/stores/event-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminStore } from "@/stores/admin-store";

/**
 * Fetches events, registrations, expenses, and scan logs from Supabase
 * and syncs them into the Zustand stores.
 */
export function useSupabaseData() {
  const setEvents = useEventStore((s) => s.setEvents);
  const setRegistrations = useEventStore((s) => s.setRegistrations);
  const setExpenses = useAdminStore((s) => s.setExpenses);
  const setScanLogs = useAdminStore((s) => s.setScanLogs);
  const user = useAuthStore((s) => s.user);

  // Fetch all events
  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        setEvents(data);
      }
    }

    fetchEvents();
  }, [setEvents]);

  // Fetch user-specific registrations (or all for admin)
  const userId = user?.id;
  const userRole = user?.role;
  useEffect(() => {
    if (!userId) return;

    async function fetchRegistrations() {
      let query = supabase.from("registrations").select("*");

      // Admin sees all registrations, students see only their own
      if (userRole !== "Admin") {
        query = query.eq("user_id", userId!);
      }

      const { data, error } = await query;
      if (!error && data) {
        setRegistrations(data);
      }
    }

    fetchRegistrations();
  }, [userId, userRole, setRegistrations]);

  // Fetch expenses and scan logs for admin users
  useEffect(() => {
    if (!user?.id || user.role !== "Admin") return;

    async function fetchAdminData() {
      const [expensesRes, scanLogsRes] = await Promise.all([
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("scan_logs").select("*").order("created_at", { ascending: false }),
      ]);

      if (!expensesRes.error && expensesRes.data) {
        setExpenses(expensesRes.data);
      }
      if (!scanLogsRes.error && scanLogsRes.data) {
        setScanLogs(scanLogsRes.data);
      }
    }

    fetchAdminData();
  }, [user?.id, user?.role, setExpenses, setScanLogs]);
}
