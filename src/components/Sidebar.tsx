"use client";

import Link from "next/link";
import {
  Home,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Settings,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-[#E8EAF0] bg-white lg:flex lg:min-h-[calc(100vh-68px)] lg:flex-col">
      <div className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A0A5AF]">
          Menu
        </p>

        <nav className="space-y-1">
          <SidebarItem
            href="/"
            icon={<Home size={17} strokeWidth={1.8} />}
            label="Home"
            active
          />

          <SidebarItem
            href="/send"
            icon={<ArrowUpRight size={17} strokeWidth={1.8} />}
            label="Send"
          />

          <SidebarItem
            href="/receive"
            icon={<ArrowDownLeft size={17} strokeWidth={1.8} />}
            label="Receive"
          />

          <SidebarItem
            href="/activity"
            icon={<Activity size={17} strokeWidth={1.8} />}
            label="Activity"
          />
        </nav>
      </div>

      <div className="border-t border-[#E8EAF0] p-4">
        <SidebarItem
          href="/settings"
          icon={<Settings size={17} strokeWidth={1.8} />}
          label="Settings"
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
        active
          ? "bg-[#EEF2FF] text-[#5B5FEF]"
          : "text-[#6B7280] hover:bg-[#F7F8FC] hover:text-[#111318]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
