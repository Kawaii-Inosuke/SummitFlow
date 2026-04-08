"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useEventStore } from "@/stores/event-store";
import { useAuthStore } from "@/stores/auth-store";
import { ToSModal } from "@/components/ui/tos-modal";

const INTEREST_OPTIONS = [
  "Select your field",
  "Technology",
  "Entrepreneurship",
  "Design",
  "Marketing",
  "DevOps",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
];

export default function ReservationPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const events = useEventStore((s) => s.events);
  const addRegistration = useEventStore((s) => s.addRegistration);
  const user = useAuthStore((s) => s.user);

  const event = events.find((e) => e.id === eventId);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    studentId: user?.reg_no || "",
    phone: "",
    interest: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isToSOpen, setIsToSOpen] = useState(false);

  const handleSubmit = async () => {
    if (!form.fullName || !form.studentId || !form.phone || !form.interest || !agreed || !user || !event) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          event_id: eventId,
          full_name: form.fullName,
          student_id: form.studentId,
          phone: form.phone || null,
          primary_interest: form.interest || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Update local store
      addRegistration(data);
      router.push(`/ticket/${data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-slate-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <Header title={event.title} showBack />

      {/* Event banner */}
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="text-brand-orange text-xs font-semibold uppercase tracking-wider">
            {event.domain || "EVENT"}
          </span>
          <h2 className="text-white text-xl font-bold mt-1">Innovation & Future</h2>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-6">
        <h3 className="text-xl font-bold text-slate-900">Reserve Your Spot</h3>
        <p className="text-slate-500 text-sm mt-1">
          Fill in your details to complete the booking for the premier fintech summit. Join 15,000+ industry leaders.
        </p>

        <div className="mt-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Student / Professional ID</label>
            <input
              type="text"
              placeholder="RA22110030XXXXX"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-3 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-50">
                +91
              </span>
              <input
                type="tel"
                placeholder="XXXXX-XXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Primary Interest */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Interest</label>
            <select
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              {INTEREST_OPTIONS.map((opt) => (
                <option key={opt} value={opt === "Select your field" ? "" : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600 text-center">{submitError}</p>
            </div>
          )}

          {/* Terms */}
          <label className={`flex items-start gap-3 ${submitting ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              disabled={submitting}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
            />
            <span className="text-xs text-slate-500 leading-relaxed">
              By continuing, you agree to our{" "}
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsToSOpen(true); }}
                className="text-brand-orange font-medium hover:underline focus:outline-none"
              >
                Terms of Service
              </button>
            </span>
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!form.fullName || !form.studentId || !form.phone || !form.interest || !agreed || submitting}
            className="w-full bg-brand-orange text-white font-semibold py-3.5 rounded-xl hover:bg-brand-orange-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                Complete Booking
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <ToSModal isOpen={isToSOpen} onClose={() => setIsToSOpen(false)} />
    </div>
  );
}
