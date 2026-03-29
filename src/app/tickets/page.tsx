"use client";

import Link from "next/link";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Icon } from "@/components/ui/icon";
import { useEventStore } from "@/stores/event-store";
import { useAuthStore } from "@/stores/auth-store";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export default function TicketsPage() {
  const registrations = useEventStore((s) => s.registrations);
  const events = useEventStore((s) => s.events);
  const user = useAuthStore((s) => s.user);

  const myRegs = registrations.filter((r) => r.user_id === user?.id);

  return (
    <div className="min-h-dvh bg-surface pb-20">
      <Header title="My Tickets" />

      <div className="px-4 py-4 space-y-3">
        {myRegs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No tickets yet. Register for an event!</p>
          </div>
        ) : (
          myRegs.map((reg) => {
            const event = events.find((e) => e.id === reg.event_id);
            if (!event) return null;
            const isCheckedIn = reg.status === "Checked-In";

            return (
              <div key={reg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <Link href={`/ticket/${reg.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="booking" variant="orange" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{event.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(event.date)} &middot; {event.venue}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                      isCheckedIn
                        ? "bg-green-50 text-success"
                        : reg.status === "Cancelled"
                        ? "bg-red-50 text-error-600"
                        : "bg-orange-50 text-brand-orange"
                    }`}
                  >
                    {reg.status}
                  </span>
                </Link>

                {isCheckedIn && (
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <Link
                      href={`/feedback/${reg.id}`}
                      className="flex items-center justify-between text-sm font-medium text-brand-orange hover:text-brand-orange-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="pdf" variant="orange" size={14} />
                        {reg.feedback_submitted ? "View Certificate" : "Rate & Get Certificate"}
                      </div>
                      <Icon name="forward" variant="gray" size={14} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav variant="student" />
    </div>
  );
}
