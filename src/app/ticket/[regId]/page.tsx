"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Icon } from "@/components/ui/icon";
import { useEventStore } from "@/stores/event-store";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
}

export default function TicketPage() {
  const params = useParams();
  const regId = params.regId as string;
  const registrations = useEventStore((s) => s.registrations);
  const events = useEventStore((s) => s.events);
  const [shareCopied, setShareCopied] = useState(false);

  const registration = registrations.find((r) => r.id === regId);
  const event = registration ? events.find((e) => e.id === registration.event_id) : null;

  const handleExportPDF = () => {
    window.print();
  };

  const handleShareTicket = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Ticket: ${event?.title || "Event"}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleDownloadCertificate = () => {
    if (!registration || !event) return;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" style="background:#fff; font-family:sans-serif;">
        <rect width="780" height="580" x="10" y="10" fill="none" stroke="#f97316" stroke-width="10" rx="20"/>
        <text x="400" y="150" font-size="40" font-weight="bold" text-anchor="middle" fill="#0f172a" letter-spacing="2">CERTIFICATE OF ATTENDANCE</text>
        <text x="400" y="240" font-size="20" text-anchor="middle" fill="#64748b">This is proudly presented to</text>
        <text x="400" y="310" font-size="44" font-weight="bold" text-anchor="middle" fill="#ea580c">${registration.full_name}</text>
        <text x="400" y="380" font-size="20" text-anchor="middle" fill="#64748b">for successfully participating in</text>
        <text x="400" y="450" font-size="32" font-weight="bold" text-anchor="middle" fill="#0f172a">${event.title}</text>
        <text x="400" y="520" font-size="14" text-anchor="middle" fill="#94a3b8">SummitFlow • Verified Digital Certificate</text>
      </svg>
    `.trim();
  
    const encodedData = window.btoa(unescape(encodeURIComponent(svg)));
    const url = `data:image/svg+xml;base64,${encodedData}`;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title}_Certificate.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!registration || !event) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-slate-400">Ticket not found</p>
      </div>
    );
  }

  const isValidated = registration.status === "Checked-In";
  const isPaidPending = event.access_type === "Paid" && registration.status === "Pending";

  return (
    <div className="min-h-dvh bg-white pb-20">
      <Header title="Ticket Validation" showBack />

      <div className="px-5 py-6 flex flex-col items-center">
        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            isValidated ? "bg-green-50 text-success" : "bg-orange-50 text-brand-orange"
          }`}
        >
          <Icon name="validate" variant="orange" size={14} />
          {isValidated ? "VALIDATED" : "PENDING"}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-3">Ticket Confirmed</h2>

        {/* ===== PRINT AREA ===== */}
        <div className="ticket-print-area w-full flex flex-col items-center">
          <p className="text-base font-bold text-slate-900 mt-4 mb-2 print:block hidden">{event.title}</p>

          <div className="mt-6 p-4 border-2 border-dashed border-brand-orange rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
            {isPaidPending && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center p-4">
                <Icon name="validate" variant="dark" size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-800 text-center">Payment Required</p>
                <p className="text-xs text-slate-600 text-center mt-1">
                  Only after paying you can unlock the QR
                </p>
                <button className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">
                  Pay to Unlock
                </button>
              </div>
            )}
            
            <QRCodeSVG
              value={registration.qr_hash}
              size={180}
              level="H"
              includeMargin
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            ID: {registration.qr_hash.substring(0, 24)}...
          </p>

          <div className="w-full mt-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon name="time" variant="orange" size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Time</p>
                  <p className="text-sm font-semibold text-slate-900">{formatTime(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon name="events" variant="orange" size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon name="location" variant="orange" size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-slate-900">{event.venue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ===== END PRINT AREA ===== */}

        {/* Actions */}
        <div className="w-full mt-8 space-y-3">
          {isValidated && (
            <button
              onClick={handleDownloadCertificate}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mb-2"
            >
              <Icon name="pdf" variant="orange" size={16} className="brightness-0 invert" />
              Download Certificate
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="pdf" variant="orange" size={16} className="brightness-0 invert" />
            Export Ticket PDF
          </button>
          <button
            onClick={handleShareTicket}
            className="w-full bg-white text-slate-900 font-medium py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="share" variant="dark" size={16} />
            {shareCopied ? "Link Copied!" : "Share Ticket"}
          </button>
        </div>
      </div>

      <BottomNav variant="student" />
    </div>
  );
}
