"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useEventStore } from "@/stores/event-store";
import type { Event } from "@/lib/types/database";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export function EventCard({ event }: { event: Event }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const wishlist = useEventStore((s) => s.wishlist);
  const toggleWishlist = useEventStore((s) => s.toggleWishlist);
  const isWishlisted = wishlist.includes(event.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    toggleWishlist(event.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Cover Image */}
      <div className="h-36 bg-slate-200 relative overflow-hidden">
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/50 text-sm font-medium">Event Cover</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-all ${
            isAnimating ? "scale-125" : "scale-100"
          } hover:bg-white`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#EC5B13" : "none"}
            stroke={isWishlisted ? "#EC5B13" : "#94A3B8"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Trending badge */}
        <div className="absolute top-3 right-3 bg-brand-orange text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 7.5L10.5 12H14.5L12 16.5" />
          </svg>
          Trending
        </div>
        {/* Limited badge */}
        {event.max_attendees && event.max_attendees <= 100 && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            Limited
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{event.title}</h3>
          <p className="text-[11px] font-semibold text-brand-orange uppercase tracking-wide mt-0.5">
            {event.domain || "EVENT"}
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Icon name="events" variant="gray" size={12} />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="location" variant="gray" size={12} />
            {event.venue}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-slate-900">
            {event.access_type === "Free" ? (
              "Free"
            ) : (
              <>&#8377;{event.price.toFixed(2)}</>
            )}
          </span>
          <Link
            href={`/reserve/${event.id}`}
            className="bg-brand-orange text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-orange-hover transition-colors"
          >
            Reserve
          </Link>
        </div>
      </div>
    </div>
  );
}
