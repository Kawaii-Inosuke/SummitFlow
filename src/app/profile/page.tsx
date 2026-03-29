"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useEventStore } from "@/stores/event-store";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

type SettingsPanel = null | "edit-profile" | "notifications" | "privacy";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const registrations = useEventStore((s) => s.registrations);
  const [activePanel, setActivePanel] = useState<SettingsPanel>(null);

  const [editName, setEditName] = useState(user?.name || "");
  const [editSaved, setEditSaved] = useState(false);

  const [notifEventUpdates, setNotifEventUpdates] = useState(true);
  const [notifScanAlerts, setNotifScanAlerts] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [privacySaved, setPrivacySaved] = useState(false);

  const myRegs = registrations.filter((r) => r.user_id === user?.id);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Sep 2023";

  const { signOut } = useSupabaseAuth();
  
  const handleLogout = async () => { 
    await signOut(); 
    window.location.href = "/";
  };

  const handleSaveProfile = () => {
    if (editName.trim()) updateUser({ name: editName.trim() });
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2000);
  };

  const handleSaveNotifications = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handleSavePrivacy = () => {
    if (newPassword.length >= 6) {
      setPrivacySaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPrivacySaved(false), 2000);
    }
  };

  const settingsItems = [
    {
      key: "edit-profile" as SettingsPanel,
      label: "Edit Profile",
      subtitle: "Name, email, and avatar",
      icon: <Icon name="profile" variant="dark" size={18} />,
    },
    {
      key: "notifications" as SettingsPanel,
      label: "Notifications",
      subtitle: "Manage message settings",
      icon: <Icon name="notifications" variant="dark" size={18} />,
    },
    {
      key: "privacy" as SettingsPanel,
      label: "Privacy & Security",
      subtitle: "Password and security options",
      icon: <Icon name="privacy and security" variant="dark" size={18} />,
    },
  ];

  return (
    <div className="min-h-dvh bg-surface pb-20">
      <Header title="Profile" />

      <div className="px-5 py-6">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-brand-orange flex items-center justify-center overflow-hidden">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-3">{user?.name || "Student"}</h2>
          <p className="text-xs text-brand-orange font-medium">{user?.reg_no}</p>
          <p className="text-xs text-slate-400 mt-0.5">Member since {memberSince}</p>
        </div>

        <div className="flex items-center justify-center gap-6 mt-5 py-4 bg-white rounded-xl border border-slate-200">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{myRegs.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Events</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{user?.points?.toLocaleString() || 0}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Points</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-lg font-bold text-brand-orange">Gold</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Rank</p>
          </div>
        </div>

        {myRegs.length > 0 && (
          <Link href={`/feedback/${myRegs[0].id}`} className="mt-4 block bg-white rounded-xl p-4 border border-slate-200 hover:border-brand-orange/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Icon name="pdf" variant="orange" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Feedback & Certificates</p>
                  <p className="text-xs text-slate-400">Rate events & download certificates</p>
                </div>
              </div>
              <Icon name="forward" variant="gray" size={16} />
            </div>
          </Link>
        )}

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Account Settings</h3>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActivePanel(item.key)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">{item.icon}</div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
                <Icon name="forward" variant="gray" size={16} />
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleLogout} className="w-full mt-6 py-3 rounded-xl border-2 border-red-200 text-error-600 font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <Icon name="logout" variant="dark" size={16} />
          Log Out
        </button>
      </div>

      {activePanel === "edit-profile" && (
        <BottomSheet title="Edit Profile" onClose={() => setActivePanel(null)}>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-brand-orange flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400" />
              <p className="text-[10px] text-slate-300 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
              <input type="text" value={user?.reg_no || ""} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400" />
            </div>
            <button onClick={handleSaveProfile} className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors">
              {editSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </BottomSheet>
      )}

      {activePanel === "notifications" && (
        <BottomSheet title="Notifications" onClose={() => setActivePanel(null)}>
          <div className="space-y-4">
            {[
              { label: "Event Updates", desc: "Get notified about event changes", value: notifEventUpdates, setter: setNotifEventUpdates },
              { label: "Scan Alerts", desc: "Check-in and ticket scan alerts", value: notifScanAlerts, setter: setNotifScanAlerts },
              { label: "Promotions", desc: "New events and offers", value: notifPromotions, setter: setNotifPromotions },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <button onClick={() => item.setter(!item.value)} className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? "bg-brand-orange" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${item.value ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
            <button onClick={handleSaveNotifications} className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors">
              {notifSaved ? "Saved!" : "Save Preferences"}
            </button>
          </div>
        </BottomSheet>
      )}

      {activePanel === "privacy" && (
        <BottomSheet title="Privacy & Security" onClose={() => setActivePanel(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Two-factor authentication</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Coming soon — available in a future update</p>
            </div>
            <button onClick={handleSavePrivacy} disabled={!currentPassword || newPassword.length < 6} className="w-full bg-brand-orange text-white font-semibold py-3 rounded-xl hover:bg-brand-orange-hover transition-colors disabled:opacity-50">
              {privacySaved ? "Password Updated!" : "Update Password"}
            </button>
          </div>
        </BottomSheet>
      )}

      <BottomNav variant="student" />
    </div>
  );
}
