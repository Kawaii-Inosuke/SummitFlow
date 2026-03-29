"use client";

import { useState, useRef } from "react";
import { AdminHeader } from "@/components/ui/admin-header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useEventStore } from "@/stores/event-store";
import { useAuthStore } from "@/stores/auth-store";
import { uploadEventCover } from "@/lib/supabase/storage";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { Event } from "@/lib/types/database";

const DOMAINS = ["Technology", "Entrepreneurship", "Design", "Marketing", "Hackathon", "Workshop"];

export default function EventCreationPage() {
  const setEvents = useEventStore((s) => s.setEvents);
  const events = useEventStore((s) => s.events);
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    setShowDraftSaved(true);
    setTimeout(() => setShowDraftSaved(false), 2000);
  };

  const [form, setForm] = useState({
    title: "",
    organizer: "",
    domain: "",
    accessType: "Free" as "Free" | "Paid",
    price: "",
    date: "",
    description: "",
    venue: "",
    maxAttendees: "",
    budget: "",
  });

  const progress = step === 1 ? 25 : 75;

  const [createError, setCreateError] = useState("");

  const handleCreate = async () => {
    setIsUploading(true);
    setCreateError("");
    const eventId = uuidv4();

    try {
      // Upload cover image to Supabase Storage if one was selected
      let coverUrl: string | null = null;
      if (coverFile) {
        coverUrl = await uploadEventCover(coverFile, eventId);
      }

      const eventData = {
        id: eventId,
        title: form.title || "New Event",
        description: form.description || null,
        domain: form.domain?.toUpperCase() || null,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        end_date: null,
        venue: form.venue || "TBD",
        cover_image: coverUrl,
        organizer: form.organizer || null,
        access_type: form.accessType,
        price: parseFloat(form.price) || 0,
        total_budget: parseFloat(form.budget) || 0,
        max_attendees: parseInt(form.maxAttendees) || null,
        status: "Draft" as const,
        created_by: user?.id || null,
      };

      // Insert into Supabase database
      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      // Update local store with the returned row
      const newEvent: Event = data as Event;
      setEvents([...events, newEvent]);
      setIsUploading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
        setCoverPreview(null);
        setCoverFile(null);
        setForm({ title: "", organizer: "", domain: "", accessType: "Free", price: "", date: "", description: "", venue: "", maxAttendees: "", budget: "" });
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create event";
      setCreateError(message);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white pb-20">
      <AdminHeader />

      <div className="px-5 py-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-brand-orange text-xs font-semibold uppercase">Step {step} of 2</span>
          <span className="text-xs text-slate-400">{progress}% Complete</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{step === 1 ? "Basic Details" : "Additional Details"}</h2>
        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 mb-6">
          <div className="h-full bg-brand-orange rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Name</label>
              <input type="text" placeholder="e.g. Summer Tech Summit 2024" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Organizer</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded bg-brand-orange/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EC5B13" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input type="text" placeholder="Who is hosting this?" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="flex-1 text-sm focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Domain</label>
              <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-500 focus:outline-none focus:border-brand-orange appearance-none bg-white">
                <option value="">Select category</option>
                {DOMAINS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Type</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <button onClick={() => setForm({ ...form, accessType: "Free" })} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.accessType === "Free" ? "bg-brand-orange text-white" : "bg-white text-slate-500"}`}>Free</button>
                <button onClick={() => setForm({ ...form, accessType: "Paid" })} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.accessType === "Paid" ? "bg-brand-orange text-white" : "bg-white text-slate-500"}`}>Paid</button>
              </div>
              {form.accessType === "Paid" && (
                <input type="number" placeholder="Price in ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Date & Time</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-500 focus:outline-none focus:border-brand-orange" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-orange/40 transition-colors"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <p className="text-sm text-slate-400">Upload Cover Image</p>
                  <p className="text-xs text-slate-300 mt-1">Recommended size: 1600 x 900</p>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSaveDraft} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                {showDraftSaved ? "Draft Saved!" : "Save Draft"}
              </button>
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange-hover transition-colors">Next Step</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea placeholder="Describe the event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue</label>
              <input type="text" placeholder="e.g. TP-2 Auditorium" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Attendees</label>
              <input type="number" placeholder="e.g. 500" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Budget (₹)</label>
              <input type="number" placeholder="e.g. 35000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
              <button onClick={handleCreate} disabled={isUploading} className="flex-1 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange-hover transition-colors disabled:opacity-50">
                {isUploading ? "Uploading..." : "Create Event"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error toast */}
      {createError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm max-w-[90vw]">
          {createError}
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          Event created successfully!
        </div>
      )}

      <BottomNav variant="admin" />
    </div>
  );
}
