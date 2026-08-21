"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Wallet,
} from "lucide-react";

export function TopBar() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // UI-only for now.
  // We will connect this to the real wallet state later.
  const connected = false;
  const address = "";

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Unable to copy address");
    }
  };

  return (
    <header className="sticky top-0 z-50 h-[68px] border-b border-[#E7E7EA] bg-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* BRAND */}
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#111111]">
            <span className="text-[15px] font-bold text-white">
              A
            </span>
          </div>

          <div className="leading-none">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#111111]">
              Arc Pay
            </p>

            <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.15em] text-[#96979F]">
              Payments
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* NETWORK */}
          <div className="hidden items-center gap-2 rounded-full border border-[#E7E7EA] px-3 py-2 sm:flex">
            <span className="h-[7px] w-[7px] rounded-full bg-[#31A66A]" />

            <span className="text-[10px] font-medium text-[#66676E]">
              Arc Testnet
            </span>
          </div>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#66676E] transition hover:bg-[#F5F5F6] hover:text-[#111111]"
          >
            <Bell size={17} strokeWidth={1.7} />
          </button>

          {/* WALLET */}
          {connected ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen((value) => !value)
                }
                className="flex h-[40px] items-center gap-2 rounded-full border border-[#E2E2E5] bg-white px-2.5 pr-3 transition hover:bg-[#F7F7F8]"
              >
                <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#F1F1F2]">
                  <Wallet size={14} />
                </span>

                <span className="hidden text-[11px] font-medium text-[#33343A] sm:block">
                  {shortAddress}
                </span>

                <ChevronDown
                  size={13}
                  className={`text-[#96979F] transition-transform ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-[50px] w-[270px] overflow-hidden rounded-[18px] border border-[#E5E5E8] bg-white shadow-[0_18px_50px_-25px_rgba(0,0,0,.25)]">

                  <div className="border-b border-[#EEEEF1] p-4">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#999AA2]">
                      Connected wallet
                    </p>

                    <p className="mt-2 break-all font-mono text-[11px] text-[#44454B]">
                      {address}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] text-[#55565D] hover:bg-[#F7F7F8]"
                    >
                      {copied ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}

                      {copied
                        ? "Copied"
                        : "Copy address"}
                    </button>

                    <a
                      href="#"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-[#55565D] hover:bg-[#F7F7F8]"
                    >
                      <ExternalLink size={15} />
                      View on explorer
                    </a>

                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="flex h-[40px] items-center gap-2 rounded-full bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
            >
              <Wallet size={14} strokeWidth={1.8} />
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
