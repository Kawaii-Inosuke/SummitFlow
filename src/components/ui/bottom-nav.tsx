"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

interface NavItem {
  label: string;
  href: string;
  iconName: string;
}

const studentNav: NavItem[] = [
  { label: "Home", href: "/discovery", iconName: "home" },
  { label: "Events", href: "/tickets", iconName: "booking" },
  { label: "Profile", href: "/profile", iconName: "profile" },
];

const adminNav: NavItem[] = [
  { label: "Scanner", href: "/admin/scanner", iconName: "scanner" },
  { label: "Analytics", href: "/admin/budget", iconName: "dashboard" },
  { label: "Events", href: "/admin/events", iconName: "events" },
  { label: "Staff", href: "/admin/staff", iconName: "staff" },
];

export function BottomNav({ variant = "student" }: { variant?: "student" | "admin" }) {
  const pathname = usePathname();
  const items = variant === "admin" ? adminNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-200 px-2 py-2 z-50">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-brand-orange" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon name={item.iconName} variant={isActive ? "orange" : "gray"} size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
