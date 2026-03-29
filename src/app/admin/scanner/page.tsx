"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminHeader } from "@/components/ui/admin-header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEventStore } from "@/stores/event-store";
import { supabase } from "@/lib/supabase/client";
import { decryptQRHash } from "@/lib/qr";
import type { ScanLog } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

type ScanStatus = "idle" | "scanning" | "success" | "duplicate" | "invalid";

export default function AdminScannerPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [lastScannedName, setLastScannedName] = useState("");
  const [showAllLogs, setShowAllLogs] = useState(false);
  const scanLogs = useAdminStore((s) => s.scanLogs);
  const addScanLog = useAdminStore((s) => s.addScanLog);
  const adminUser = useAuthStore((s) => s.user);
  const registrations = useEventStore((s) => s.registrations);
  const updateRegistration = useEventStore((s) => s.updateRegistration);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  const saveScanLog = useCallback(async (log: ScanLog) => {
    addScanLog(log);
    const { id, ...rest } = log;
    await supabase.from("scan_logs").insert({ id, ...rest }).single();
  }, [addScanLog]);

  const handleScanResult = useCallback(
    async (decodedText: string) => {
      const scannedBy = adminUser?.id || "u2";
      const payload = decryptQRHash(decodedText);

      if (!payload) {
        setScanStatus("invalid");
        await saveScanLog({
          id: uuidv4(),
          registration_id: null,
          scanned_by: scannedBy,
          event_id: "e1",
          scan_result: "Invalid",
          scan_location: "Main Hall",
          scanned_name: null,
          created_at: new Date().toISOString(),
        });
        return;
      }

      const reg = registrations.find(
        (r) => r.user_id === payload.uid && r.event_id === payload.eid
      );

      if (!reg) {
        setScanStatus("invalid");
        await saveScanLog({
          id: uuidv4(),
          registration_id: null,
          scanned_by: scannedBy,
          event_id: payload.eid,
          scan_result: "Invalid",
          scan_location: "Main Hall",
          scanned_name: null,
          created_at: new Date().toISOString(),
        });
        return;
      }

      if (reg.status === "Checked-In") {
        setScanStatus("duplicate");
        setLastScannedName(reg.full_name);
        await saveScanLog({
          id: uuidv4(),
          registration_id: reg.id,
          scanned_by: scannedBy,
          event_id: reg.event_id,
          scan_result: "Duplicate",
          scan_location: "Main Hall",
          scanned_name: reg.full_name,
          created_at: new Date().toISOString(),
        });
        return;
      }

      const checkInUpdates = {
        status: "Checked-In" as const,
        checked_in_at: new Date().toISOString(),
        checked_in_by: scannedBy,
      };

      // Update registration in Supabase
      await supabase
        .from("registrations")
        .update(checkInUpdates)
        .eq("id", reg.id);

      updateRegistration(reg.id, checkInUpdates);
      setScanStatus("success");
      setLastScannedName(reg.full_name);
      await saveScanLog({
        id: uuidv4(),
        registration_id: reg.id,
        scanned_by: scannedBy,
        event_id: reg.event_id,
        scan_result: "Success",
        scan_location: "Main Hall",
        scanned_name: reg.full_name,
        created_at: new Date().toISOString(),
      });
    },
    [registrations, updateRegistration, saveScanLog, adminUser?.id]
  );

  const startScanner = useCallback(async () => {
    if (html5QrCodeRef.current) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          handleScanResult(decodedText);
        },
        () => {}
      );
      setScanStatus("scanning");
    } catch {
      console.log("Camera not available, using demo mode");
      setScanStatus("scanning");
    }
  }, [handleScanResult]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop(); } catch {}
      }
    };
  }, []);

  const handleDemoScan = () => {
    const reg = registrations.find((r) => r.status === "Pending");
    if (reg) {
      handleScanResult(reg.qr_hash);
    } else {
      const checkedIn = registrations[0];
      if (checkedIn) {
        setScanStatus("duplicate");
        setLastScannedName(checkedIn.full_name);
        addScanLog({
          id: uuidv4(),
          registration_id: checkedIn.id,
          scanned_by: "u2",
          event_id: checkedIn.event_id,
          scan_result: "Duplicate",
          scan_location: "Main Hall",
          scanned_name: checkedIn.full_name,
          created_at: new Date().toISOString(),
        });
      }
    }
  };

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  const displayedLogs = showAllLogs ? scanLogs : scanLogs.slice(0, 4);

  return (
    <div className="min-h-dvh bg-slate-900 flex flex-col">
      <AdminHeader />

      <div className="flex-1 pb-20">
        {/* Camera viewport */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-slate-800 relative aspect-[4/3]">
          <div id="qr-reader" ref={scannerRef} className="w-full h-full" />

          {scanStatus !== "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">LIVE FEED: MAIN HALL</div>
              <div className="w-48 h-48 border-2 border-slate-600 rounded-xl flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
          )}

          {/* Result overlays */}
          {scanStatus === "success" && (
            <div className="absolute inset-0 bg-success/20 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 text-center shadow-xl mx-8">
                <div className="w-14 h-14 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-bold text-slate-900">Check-In Successful</p>
                <p className="text-sm text-slate-500 mt-1">{lastScannedName}</p>
                <button
                  onClick={() => { setScanStatus("idle"); setLastScannedName(""); }}
                  className="mt-3 text-xs text-brand-orange font-semibold"
                >
                  Scan Next
                </button>
              </div>
            </div>
          )}

          {scanStatus === "duplicate" && (
            <div className="absolute inset-0 bg-error-600/20 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 text-center shadow-xl mx-8 border-2 border-error-400">
                <div className="w-14 h-14 rounded-full bg-error-100 mx-auto mb-3 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <p className="font-bold text-error-800">Duplicate / Already Checked-In</p>
                <p className="text-sm text-slate-500 mt-1">{lastScannedName}</p>
                <button
                  onClick={() => { setScanStatus("idle"); setLastScannedName(""); }}
                  className="mt-3 text-xs text-brand-orange font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {scanStatus === "invalid" && (
            <div className="absolute inset-0 bg-error-600/20 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 text-center shadow-xl mx-8 border-2 border-error-400">
                <div className="w-14 h-14 rounded-full bg-error-100 mx-auto mb-3 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="font-bold text-error-800">Invalid QR Detected</p>
                <p className="text-sm text-slate-500 mt-1">QR code is not valid</p>
                <button
                  onClick={() => { setScanStatus("idle"); setLastScannedName(""); }}
                  className="mt-3 text-xs text-brand-orange font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scan button */}
        <div className="flex justify-center -mt-6 relative z-10">
          <button
            onClick={
              scanStatus === "idle"
                ? startScanner
                : scanStatus === "scanning"
                ? handleDemoScan
                : () => { setScanStatus("idle"); setLastScannedName(""); }
            }
            className="w-14 h-14 rounded-full bg-brand-orange shadow-lg shadow-brand-orange/40 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="none" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" fill="none" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" fill="none" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" fill="none" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Recent Activity - Expandable */}
        <div className="mt-4 mx-4 bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-error-600 text-[10px] font-semibold animate-pulse">
                REAL-TIME
              </span>
            </div>
            <button
              onClick={() => setShowAllLogs(!showAllLogs)}
              className="text-brand-orange text-xs font-medium border border-brand-orange/30 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors"
            >
              {showAllLogs ? "Show Less" : "View All"}
            </button>
          </div>

          <div className={`space-y-3 ${showAllLogs ? "max-h-[400px] overflow-y-auto custom-scroll" : ""}`}>
            {displayedLogs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No scans yet. Tap the button to start scanning.</p>
            ) : (
              displayedLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.scan_result === "Success"
                        ? "bg-green-100"
                        : log.scan_result === "Duplicate"
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    {log.scan_result === "Success" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : log.scan_result === "Duplicate" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EC5B13" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {log.scanned_name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {log.scan_location} &middot; {log.scan_result === "Success" ? "QR Verified" : log.scan_result === "Duplicate" ? "Already checked-in" : "Invalid QR code attempt"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      log.scan_result === "Success"
                        ? "bg-green-50 text-success"
                        : log.scan_result === "Duplicate"
                        ? "bg-orange-50 text-brand-orange"
                        : "bg-red-50 text-error-600"
                    }`}
                  >
                    {formatTime(log.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>

          {showAllLogs && scanLogs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">{scanLogs.length} total scan{scanLogs.length !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav variant="admin" />
    </div>
  );
}
