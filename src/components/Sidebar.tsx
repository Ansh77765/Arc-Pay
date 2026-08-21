"use client";

import Link from "next/link";
import {
  Home,
  CreditCard,
  Activity,
  Settings,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-[210px] shrink-0 border-r border-[#E8E8EB] bg-white lg:flex lg:min-h-[calc(100vh-68px)] lg:flex-col">
      <div className="px-3 py-6">
        <nav className="space-y-1">
          <SidebarItem
            href="/"
            label="Home"
            icon={<Home size={19} strokeWidth={1.7} />}
            active
          />

          <SidebarItem
            href="/send"
            label="Payments"
            icon={<CreditCard size={19} strokeWidth={1.7} />}
          />

          <SidebarItem
            href="/activity"
            label="Activity"
            icon={<Activity size={19} strokeWidth={1.7} />}
          />
        </nav>
      </div>

      <div className="mt-auto border-t border-[#EEEEF1] px-3 py-4">
        <SidebarItem
          href="/settings"
          label="Settings"
          icon={<Settings size={19} strokeWidth={1.7} />}
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[46px] items-center gap-3 rounded-[14px] px-4 text-[13px] transition ${
        active
          ? "bg-[#F3F3F4] font-semibold text-[#111111]"
          : "font-medium text-[#686970] hover:bg-[#F8F8F9] hover:text-[#111111]"
      }`}
    >
      {icon}

      <span>{label}</span>
    </Link>
  );
}
