"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="w-8" />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg overflow-hidden">
          <Image src="/icons/SummitFlow Logo.jpg" alt="SF" width={28} height={28} className="object-cover" />
        </div>
        <span className="font-bold text-slate-900 text-base">SummitFlow</span>
      </div>
      <Link href="/admin/profile" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon name="profile" variant="dark" size={16} />
      </Link>
    </header>
  );
}
