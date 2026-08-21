"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CreditCard,
  Home,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[210px] shrink-0 border-r border-[#E7E7EA] bg-white lg:flex lg:min-h-[calc(100vh-68px)] lg:flex-col">

      {/* NAVIGATION */}
      <div className="px-3 py-6">
        <nav className="space-y-1">

          <SidebarItem
            href="/"
            label="Home"
            icon={
              <Home
                size={19}
                strokeWidth={1.7}
              />
            }
            active={pathname === "/"}
          />

          <SidebarItem
            href="/send"
            label="Payments"
            icon={
              <CreditCard
                size={19}
                strokeWidth={1.7}
              />
            }
            active={pathname.startsWith("/send")}
          />

          <SidebarItem
            href="/activity"
            label="Activity"
            icon={
              <Activity
                size={19}
                strokeWidth={1.7}
              />
            }
            active={pathname.startsWith("/activity")}
          />

        </nav>
      </div>

      {/* SETTINGS */}
      <div className="mt-auto border-t border-[#EEEEF1] px-3 py-4">
        <SidebarItem
          href="/settings"
          label="Settings"
          icon={
            <Settings
              size={19}
              strokeWidth={1.7}
            />
          }
          active={pathname.startsWith("/settings")}
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-[46px] items-center gap-3 rounded-[15px] px-4 text-[13px] transition-all ${
        active
          ? "bg-[#F3F3F4] font-semibold text-[#111111]"
          : "font-medium text-[#686970] hover:bg-[#F8F8F9] hover:text-[#111111]"
      }`}
    >
      <span
        className={`transition-colors ${
          active
            ? "text-[#111111]"
            : "text-[#777880] group-hover:text-[#111111]"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}
