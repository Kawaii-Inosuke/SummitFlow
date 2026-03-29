"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/ui/admin-header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { mockVolunteer } from "@/lib/mock-data";
import type { User, UserRole } from "@/lib/types/database";

const mockStaff: (User & { status: string })[] = [
  { ...mockVolunteer, status: "Active" },
  {
    id: "u4", auth_id: "auth-4", name: "Priya Mehta", reg_no: "RA2211003010200",
    email: "priya@srmist.edu.in", avatar_url: null, role: "Volunteer" as UserRole,
    points: 800, created_at: "2023-10-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
    status: "Active",
  },
  {
    id: "u5", auth_id: "auth-5", name: "Rahul Verma", reg_no: "RA2211003010300",
    email: "rahul@srmist.edu.in", avatar_url: null, role: "Student" as UserRole,
    points: 400, created_at: "2023-11-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
    status: "Inactive",
  },
];

const mockActivity: Record<string, { action: string; time: string; event: string }[]> = {
  u3: [
    { action: "Scanned QR - Ayush", time: "10:15 AM", event: "E-Summit 2.0" },
    { action: "Scanned QR - Ananya Rao", time: "10:30 AM", event: "E-Summit 2.0" },
    { action: "Flagged duplicate - Arjun", time: "10:45 AM", event: "E-Summit 2.0" },
    { action: "Scanned QR - Vikram", time: "11:02 AM", event: "E-Summit 2.0" },
  ],
  u4: [
    { action: "Scanned QR - Priya Mehta", time: "10:20 AM", event: "E-Summit 2.0" },
    { action: "Invalid QR detected", time: "10:42 AM", event: "E-Summit 2.0" },
  ],
  u5: [],
};

export default function StaffPage() {
  const [staff, setStaff] = useState(mockStaff);
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState<string | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, role: newRole, status: newRole === "Student" ? "Inactive" : "Active" } : s))
    );
    setShowRoleModal(null);
  };

  const activityMember = staff.find((s) => s.id === showActivityModal);
  const activityData = showActivityModal ? (mockActivity[showActivityModal] || []) : [];

  return (
    <div className="min-h-dvh bg-surface pb-20">
      <AdminHeader />

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Staff & Volunteers</h2>
          <span className="text-xs text-slate-400">{staff.length} members</span>
        </div>

        <div className="space-y-3">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    member.role === "Admin" ? "bg-brand-orange/10 text-brand-orange"
                    : member.role === "Volunteer" ? "bg-green-50 text-success"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    {member.role}
                  </span>
                  <span className={`text-[10px] ${member.status === "Active" ? "text-success" : "text-slate-400"}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowRoleModal(member.id)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Change Role
                </button>
                <button
                  onClick={() => setShowActivityModal(member.id)}
                  className="flex-1 py-2 rounded-lg bg-brand-orange/10 text-xs font-medium text-brand-orange hover:bg-brand-orange/20 transition-colors"
                >
                  View Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRoleModal && (
        <BottomSheet title="Assign Role" onClose={() => setShowRoleModal(null)} defaultHeight={50}>
          <p className="text-xs text-slate-400 mb-3">
            Assigning for: <span className="font-medium text-slate-600">{staff.find((s) => s.id === showRoleModal)?.name}</span>
          </p>
          <div className="space-y-2">
            {(["Student", "Volunteer", "Admin"] as UserRole[]).map((role) => {
              const currentRole = staff.find((s) => s.id === showRoleModal)?.role;
              const isCurrentRole = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(showRoleModal, role)}
                  className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between px-4 ${
                    isCurrentRole
                      ? "bg-brand-orange text-white border-brand-orange"
                      : "border-slate-200 text-slate-700 hover:bg-brand-orange/5 hover:border-brand-orange/30"
                  }`}
                >
                  <span>{role}</span>
                  {isCurrentRole && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {showActivityModal && (
        <BottomSheet title="Activity Log" onClose={() => setShowActivityModal(null)}>
          {activityMember && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{activityMember.name}</p>
                <p className="text-xs text-slate-400">{activityMember.role} &middot; {activityMember.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {activityData.length === 0 ? (
              <div className="text-center py-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" className="mx-auto mb-2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <p className="text-sm text-slate-400">No activity recorded yet</p>
              </div>
            ) : (
              activityData.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.event} &middot; {item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </BottomSheet>
      )}

      <BottomNav variant="admin" />
    </div>
  );
}
