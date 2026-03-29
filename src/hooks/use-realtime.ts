"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useEventStore } from "@/stores/event-store";
import { useAdminStore } from "@/stores/admin-store";
import type { Registration, ScanLog } from "@/lib/types/database";

export function useRealtimeRegistrations(eventId?: string) {
  const updateRegistration = useEventStore((s) => s.updateRegistration);

  useEffect(() => {
    const channel = supabase
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "registrations",
          ...(eventId ? { filter: `event_id=eq.${eventId}` } : {}),
        },
        (payload) => {
          const updated = payload.new as Registration;
          updateRegistration(updated.id, updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, updateRegistration]);
}

export function useRealtimeScanLogs(eventId?: string) {
  const addScanLog = useAdminStore((s) => s.addScanLog);

  useEffect(() => {
    const channel = supabase
      .channel("scan-logs-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scan_logs",
          ...(eventId ? { filter: `event_id=eq.${eventId}` } : {}),
        },
        (payload) => {
          addScanLog(payload.new as ScanLog);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, addScanLog]);
}
