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

type ScanStatus = "scanning" | "success" | "duplicate" | "invalid";

export default function AdminScannerPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("scanning");
  const [lastScannedName, setLastScannedName] = useState("");
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scanLogs = useAdminStore((s) => s.scanLogs);
  const addScanLog = useAdminStore((s) => s.addScanLog);
  const adminUser = useAuthStore((s) => s.user);
  const registrations = useEventStore((s) => s.registrations);
  const updateRegistration = useEventStore((s) => s.updateRegistration);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);
  // Prevent processing the same QR code repeatedly
  const lastProcessedRef = useRef<string>("");
  const processingRef = useRef(false);
  const autoResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveScanLog = useCallback(async (log: ScanLog) => {
    addScanLog(log);
    const { id, ...rest } = log;
    await supabase.from("scan_logs").insert({ id, ...rest }).single();
  }, [addScanLog]);

  const handleScanResult = useCallback(
    async (decodedText: string) => {
      // Debounce: skip if already processing or same QR scanned within cooldown
      if (processingRef.current) return;
      if (decodedText === lastProcessedRef.current) return;

      processingRef.current = true;
      lastProcessedRef.current = decodedText;

      const scannedBy = adminUser?.id || "unknown";
      const payload = decryptQRHash(decodedText);

      if (!payload) {
        // Not a SummitFlow QR — silently ignore non-SummitFlow QRs, only flag if it looks encrypted but fails
        processingRef.current = false;
        // Only show invalid if it looks like an encrypted string (has base64 chars)
        if (decodedText.length > 20) {
          setScanStatus("invalid");
          await saveScanLog({
            id: uuidv4(),
            registration_id: null,
            scanned_by: scannedBy,
            event_id: "unknown",
            scan_result: "Invalid",
            scan_location: "Main Entrance",
            scanned_name: null,
            created_at: new Date().toISOString(),
          });
          // Auto-resume after 3 seconds
          autoResumeTimerRef.current = setTimeout(() => {
            setScanStatus("scanning");
            lastProcessedRef.current = "";
            processingRef.current = false;
          }, 3000);
        } else {
          lastProcessedRef.current = "";
        }
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
          scan_location: "Main Entrance",
          scanned_name: null,
          created_at: new Date().toISOString(),
        });
        autoResumeTimerRef.current = setTimeout(() => {
          setScanStatus("scanning");
          lastProcessedRef.current = "";
          processingRef.current = false;
        }, 3000);
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
          scan_location: "Main Entrance",
          scanned_name: reg.full_name,
          created_at: new Date().toISOString(),
        });
        autoResumeTimerRef.current = setTimeout(() => {
          setScanStatus("scanning");
          lastProcessedRef.current = "";
          processingRef.current = false;
        }, 4000);
        return;
      }

      // Valid check-in!
      const checkInUpdates = {
        status: "Checked-In" as const,
        checked_in_at: new Date().toISOString(),
        checked_in_by: scannedBy,
      };

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
        scan_location: "Main Entrance",
        scanned_name: reg.full_name,
        created_at: new Date().toISOString(),
      });

      // Auto-resume scanning after 4 seconds
      autoResumeTimerRef.current = setTimeout(() => {
        setScanStatus("scanning");
        lastProcessedRef.current = "";
        processingRef.current = false;
      }, 4000);
    },
    [registrations, updateRegistration, saveScanLog, adminUser?.id]
  );

  // Auto-start camera on mount
  useEffect(() => {
    let mounted = true;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted) return;

        const scanner = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.333,
          },
          (decodedText: string) => {
            handleScanResult(decodedText);
          },
          () => {
            // QR not detected in this frame — this is normal, keep scanning
          }
        );
      } catch (err) {
        if (mounted) {
          setCameraError(
            "Camera access denied or not available. Please allow camera permissions and reload."
          );
        }
        console.error("Scanner init error:", err);
      }
    }

    initScanner();

    return () => {
      mounted = false;
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
      }
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
        html5QrCodeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep handleScanResult reference fresh for the scanner callback
  const handleScanResultRef = useRef(handleScanResult);
  useEffect(() => {
    handleScanResultRef.current = handleScanResult;
  }, [handleScanResult]);

  const handleDismiss = () => {
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
    setScanStatus("scanning");
    setLastScannedName("");
    lastProcessedRef.current = "";
    processingRef.current = false;
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
          <div id="qr-reader" ref={scannerRef} className="w-full h-full [&_video]:!object-cover" />

          {/* Scanning overlay with animated corners */}
          {scanStatus === "scanning" && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[250px] h-[250px]">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-brand-orange rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-brand-orange rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-brand-orange rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-brand-orange rounded-br-lg" />
                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-brand-orange/80 animate-scan-line" />
              </div>
            </div>
          )}

          {/* Camera error */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 px-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="#DC2626" strokeWidth="2" />
              </svg>
              <p className="text-slate-400 text-sm text-center mt-3">{cameraError}</p>
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
                <p className="font-bold text-slate-900">Booking Confirmed</p>
                <p className="text-sm text-slate-500 mt-1">{lastScannedName}</p>
                <p className="text-xs text-green-600 mt-1">Check-in successful</p>
                <button
                  onClick={handleDismiss}
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
                <p className="font-bold text-error-800">Already Checked-In</p>
                <p className="text-sm text-slate-500 mt-1">{lastScannedName}</p>
                <button
                  onClick={handleDismiss}
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
                <p className="font-bold text-error-800">Invalid QR Code</p>
                <p className="text-sm text-slate-500 mt-1">This QR code is not a valid SummitFlow booking</p>
                <button
                  onClick={handleDismiss}
                  className="mt-3 text-xs text-brand-orange font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex justify-center mt-3">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${
            scanStatus === "scanning"
              ? "bg-green-500/20 text-green-400"
              : scanStatus === "success"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              scanStatus === "scanning" ? "bg-green-400 animate-pulse" : scanStatus === "success" ? "bg-green-400" : "bg-red-400"
            }`} />
            {scanStatus === "scanning" ? "Scanning for QR codes..." : scanStatus === "success" ? "Check-in confirmed" : scanStatus === "duplicate" ? "Duplicate scan" : "Invalid QR"}
          </div>
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
              <p className="text-sm text-slate-400 text-center py-4">Point the camera at a QR code to scan.</p>
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
                      {log.scan_location} &middot; {log.scan_result === "Success" ? "Booking Confirmed" : log.scan_result === "Duplicate" ? "Already checked-in" : "Invalid QR code"}
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
