import { create } from "zustand";
import type { Event, Registration } from "@/lib/types/database";

interface EventState {
  events: Event[];
  registrations: Registration[];
  selectedEvent: Event | null;
  filter: string;
  wishlist: string[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  setRegistrations: (registrations: Registration[]) => void;
  selectEvent: (event: Event | null) => void;
  setFilter: (filter: string) => void;
  addRegistration: (registration: Registration) => void;
  updateRegistration: (id: string, updates: Partial<Registration>) => void;
  toggleWishlist: (eventId: string) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  registrations: [],
  selectedEvent: null,
  filter: "All Events",
  wishlist: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  setRegistrations: (registrations) => set({ registrations }),
  selectEvent: (selectedEvent) => set({ selectedEvent }),
  setFilter: (filter) => set({ filter }),
  addRegistration: (registration) =>
    set((state) => ({ registrations: [...state.registrations, registration] })),
  updateRegistration: (id, updates) =>
    set((state) => ({
      registrations: state.registrations.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  toggleWishlist: (eventId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(eventId)
        ? state.wishlist.filter((id) => id !== eventId)
        : [...state.wishlist, eventId],
    })),
}));
