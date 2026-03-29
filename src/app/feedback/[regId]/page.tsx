"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useEventStore } from "@/stores/event-store";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";

export default function FeedbackPage() {
  const params = useParams();
  const regId = params.regId as string;
  const registrations = useEventStore((s) => s.registrations);
  const events = useEventStore((s) => s.events);
  const updateRegistration = useEventStore((s) => s.updateRegistration);
  const user = useAuthStore((s) => s.user);

  const registration = registrations.find((r) => r.id === regId);
  const event = registration ? events.find((e) => e.id === registration.event_id) : null;

  const eventTitle = event?.title || "Event";
  const eventDate = event
    ? new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "";

  const [rating, setRating] = useState<number>(registration?.feedback_rating || 0);
  const [liked, setLiked] = useState(registration?.feedback_liked || "");
  const [improved, setImproved] = useState(registration?.feedback_improved || "");

  const canGetCertificate =
    registration?.status === "Checked-In" && registration?.feedback_submitted;

  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!rating || !registration) return;
    setSubmittingFeedback(true);

    const updates = {
      feedback_submitted: true,
      feedback_rating: rating,
      feedback_liked: liked || null,
      feedback_improved: improved || null,
      certificate_generated: true,
    };

    // Update Supabase
    await supabase
      .from("registrations")
      .update(updates)
      .eq("id", regId);

    // Update local store
    updateRegistration(regId, updates);
    setSubmittingFeedback(false);
  };

  const handleDownloadCertificate = async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const { CertificateDocument } = await import("@/components/certificate-pdf");
    const blob = await pdf(
      CertificateDocument({
        name: user?.name || registration?.full_name || "Student",
        eventTitle,
        date: eventDate,
      })
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SummitFlow-Certificate-${user?.name || "certificate"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!registration || !event) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-slate-400">Registration not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <Header title="Feedback & Certificate" showBack />

      <div className="px-5 py-6">
        {/* Event context */}
        <div className="mb-5 p-3 bg-orange-50 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC5B13" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{eventTitle}</p>
            <p className="text-xs text-slate-500">{eventDate}</p>
          </div>
        </div>

        {/* Rating section */}
        <h2 className="text-xl font-bold text-slate-900">Rate your experience</h2>
        <p className="text-slate-500 text-sm mt-1">How likely are you to recommend this event?</p>

        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold flex-shrink-0 transition-colors ${
                rating === num
                  ? "bg-brand-orange text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Liked */}
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="text-success">&#10003;</span>
            What did you like most? <span className="text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            placeholder="Tell us what you enjoyed most..."
            rows={2}
            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
          />
        </div>

        {/* Improved */}
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="text-brand-orange">&#9998;</span>
            What could be improved? <span className="text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={improved}
            onChange={(e) => setImproved(e.target.value)}
            placeholder="Technical issues, timing, etc."
            rows={2}
            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
          />
        </div>

        {!registration.feedback_submitted && (
          <button
            onClick={handleSubmitFeedback}
            disabled={!rating || submittingFeedback}
            className="w-full mt-6 bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors disabled:opacity-50"
          >
            Submit Feedback
          </button>
        )}

        {/* Certificate section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Your Certificate</h3>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="border-2 border-brand-orange/20 rounded-lg p-4 bg-white text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Certificate of Participation</p>
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 mx-auto my-3 flex items-center justify-center">
                <span className="text-brand-orange text-xl">&#9733;</span>
              </div>
              <p className="font-bold text-slate-900">{user?.name || registration.full_name}</p>
              <p className="text-xs text-slate-500 mt-1">has successfully participated in</p>
              <p className="text-sm font-semibold text-brand-orange mt-1">{eventTitle}</p>
              <div className="flex justify-center gap-6 mt-3 text-[10px] text-slate-400">
                <span>Awarded</span>
                <span>{eventDate}</span>
              </div>
            </div>
          </div>

          {canGetCertificate ? (
            <button
              onClick={handleDownloadCertificate}
              className="w-full mt-4 bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download E-Certificate
            </button>
          ) : (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-xs text-slate-400">
                {registration.status !== "Checked-In"
                  ? "Certificate available after event check-in and feedback submission"
                  : "Submit feedback above to unlock your certificate"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
