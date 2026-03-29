"use client";

import { useState } from "react";
import { useEventStore } from "@/stores/event-store";
import { EventCard } from "@/components/ui/event-card";
import { BottomNav } from "@/components/ui/bottom-nav";

const TABS = ["All Events", "Hackathons", "Wishlist", "Registered"];

export default function DiscoveryPage() {
  const events = useEventStore((s) => s.events);
  const wishlist = useEventStore((s) => s.wishlist);
  const registrations = useEventStore((s) => s.registrations);
  const [activeTab, setActiveTab] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");

  const isRegistered = (eventId: string) => 
    registrations.some((r) => r.event_id === eventId);

  const searchedEvents = events.filter((e) => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents =
    activeTab === "All Events"
      ? searchedEvents.filter((e) => !isRegistered(e.id))
      : activeTab === "Hackathons"
      ? searchedEvents.filter((e) => e.domain === "HACKATHON")
      : activeTab === "Wishlist"
      ? searchedEvents.filter((e) => wishlist.includes(e.id))
      : activeTab === "Registered"
      ? searchedEvents.filter((e) => isRegistered(e.id))
      : [];

  return (
    <div className="min-h-dvh bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                <circle cx="11" cy="11" r="8" fill="none" stroke="white" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Discovery</h1>
          </div>
          
          <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search for events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-800 flex-1 ml-2 placeholder:text-slate-400"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Featured heading */}
      <div className="px-4 pt-2 pb-3">
        <h2 className="text-lg font-bold text-slate-900">Featured Events</h2>
      </div>

      {/* Event cards */}
      <div className="px-4 space-y-4">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No events found in this category</p>
          </div>
        )}
      </div>

      <BottomNav variant="student" />
    </div>
  );
}
