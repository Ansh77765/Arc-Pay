"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[224px] shrink-0 border-r border-[#E9EBF0] bg-white lg:flex lg:min-h-[calc(100vh-70px)] lg:flex-col">

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <div className="px-3.5 py-6">

        {/* SECTION LABEL */}

        <div className="mb-3 px-3">

          <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#A0A6B1]">
            Workspace
          </p>

        </div>

        <nav className="space-y-1">

          <SidebarItem
            href="/"
            label="Home"
            description="Overview"
            icon={
              <Home
                size={17}
                strokeWidth={1.7}
              />
            }
            active={
              pathname === "/"
            }
          />

          <SidebarItem
            href="/send"
            label="Payments"
            description="Send USDC"
            icon={
              <ArrowUpRight
                size={17}
                strokeWidth={1.8}
              />
            }
            active={pathname.startsWith("/send")}
          />

          <SidebarItem
            href="/activity"
            label="Activity"
            description="Transactions"
            icon={
              <Activity
                size={17}
                strokeWidth={1.7}
              />
            }
            active={pathname.startsWith(
              "/activity"
            )}
          />

        </nav>

        {/* IDENTITY */}

        <div className="mt-7 px-3">

          <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.16em] text-[#A0A6B1]">
            Identity
          </p>

          <Link
            href="/"
            className="group block overflow-hidden rounded-[16px] border border-[#E7E9EF] bg-[#FAFBFD] p-3 transition hover:border-[#DDE1EA] hover:bg-white hover:shadow-[0_8px_22px_rgba(17,19,26,0.045)]"
          >

            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F0F1FF] text-[#6366F1]">

                <Sparkles
                  size={14}
                  strokeWidth={1.7}
                />

              </div>

              <div className="min-w-0">

                <p className="text-[9px] font-semibold text-[#444952]">
                  Arc Pay
                </p>

                <p className="mt-0.5 truncate text-[8px] text-[#9AA0AB]">
                  Payment identity
                </p>

              </div>

            </div>

            <div className="mt-3 flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

              <span className="text-[7px] font-semibold text-[#7E8490]">
                Arc Testnet
              </span>

            </div>

          </Link>

        </div>

      </div>

      {/* =====================================================
          SETTINGS / FOOTER
          ===================================================== */}

      <div className="mt-auto border-t border-[#EEF0F4] px-3.5 py-4">

        <SidebarItem
          href="/settings"
          label="Settings"
          description="Preferences"
          icon={
            <Settings
              size={17}
              strokeWidth={1.7}
            />
          }
          active={pathname.startsWith(
            "/settings"
          )}
        />

        <div className="mt-3 px-3">

          <p className="text-[7px] leading-4 text-[#A0A6B1]">
            Arc Pay
            <span className="mx-1">·</span>
            Testnet
          </p>

        </div>

      </div>

    </aside>
  );
}

function SidebarItem({
  href,
  label,
  description,
  icon,
  active,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[50px] items-center gap-3 rounded-[14px] px-3 transition-all ${
        active
          ? "bg-[#F0F1FF] text-[#11131A]"
          : "text-[#737985] hover:bg-[#F7F8FA] hover:text-[#11131A]"
      }`}
    >

      {/* ACTIVE INDICATOR */}

      {active && (
        <span className="absolute left-0 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-r-full bg-[#6366F1]" />
      )}

      {/* ICON */}

      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition-all ${
          active
            ? "bg-white text-[#5B61D6] shadow-[0_2px_7px_rgba(99,102,241,0.10)]"
            : "bg-transparent text-[#858B97] group-hover:bg-white group-hover:text-[#555B67]"
        }`}
      >
        {icon}
      </span>

      {/* TEXT */}

      <span className="min-w-0">

        <span
          className={`block text-[10px] tracking-[-0.01em] ${
            active
              ? "font-semibold"
              : "font-medium"
          }`}
        >
          {label}
        </span>

        <span
          className={`mt-0.5 block text-[7px] ${
            active
              ? "text-[#7C82A1]"
              : "text-[#A0A6B1]"
          }`}
        >
          {description}
        </span>

      </span>

    </Link>
  );
}
