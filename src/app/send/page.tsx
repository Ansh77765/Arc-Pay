"use client";

import {
  ArrowUpRight,
  ChevronDown,
  Info,
  Wallet,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

export default function SendPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="px-6 pb-16 pt-8 sm:px-10 lg:px-12">

            {/* Header */}
            <div className="mb-10">
              <p className="text-[12px] font-medium text-[#85868E]">
                Payments
              </p>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">
                Send USDC
              </h1>

              <p className="mt-2 text-[13px] text-[#85868E]">
                Send USDC to a wallet on the Arc network.
              </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,650px)_330px]">

              {/* SEND CARD */}
              <section className="rounded-[22px] border border-[#E7E7EA] bg-white">

                {/* Card header */}
                <div className="border-b border-[#EEEEF1] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F6]">
                      <ArrowUpRight
                        size={19}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div>
                      <h2 className="text-[15px] font-semibold">
                        Payment details
                      </h2>

                      <p className="mt-1 text-[11px] text-[#92939B]">
                        Enter the recipient and amount.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6">

                  {/* Recipient */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[#33343A]">
                        Recipient
                      </label>

                      <span className="text-[10px] text-[#A0A1A8]">
                        Wallet address
                      </span>
                    </div>

                    <div className="flex h-[54px] items-center rounded-[14px] border border-[#E2E2E6] bg-white px-4 transition focus-within:border-[#BDBDC5]">
                      <input
                        type="text"
                        placeholder="0x..."
                        className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-[#222329] outline-none placeholder:text-[#B2B3BA]"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[#33343A]">
                        Amount
                      </label>

                      <button
                        type="button"
                        className="text-[10px] font-medium text-[#777880]"
                      >
                        Max
                      </button>
                    </div>

                    <div className="flex h-[70px] items-center rounded-[14px] border border-[#E2E2E6] bg-white px-4">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="min-w-0 flex-1 bg-transparent text-[28px] font-semibold tracking-[-0.04em] text-[#111111] outline-none placeholder:text-[#B8B9BE]"
                      />

                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-[#F5F5F6] px-3.5 py-2 text-[11px] font-semibold"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-bold">
                          $
                        </span>

                        USDC

                        <ChevronDown
                          size={13}
                          className="text-[#85868E]"
                        />
                      </button>
                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-[#9A9BA2]">
                      <span>Available balance</span>
                      <span>— USDC</span>
                    </div>
                  </div>

                  {/* Network */}
                  <div>
                    <label className="mb-2.5 block text-[12px] font-medium text-[#33343A]">
                      Network
                    </label>

                    <div className="flex h-[58px] items-center justify-between rounded-[14px] border border-[#E2E2E6] px-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F6]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#31A66A]" />
                        </span>

                        <div>
                          <p className="text-[12px] font-medium">
                            Arc Testnet
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#96979F]">
                            USDC network
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-medium text-[#31A66A]">
                        Connected
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex gap-3 rounded-[14px] bg-[#F7F7F8] p-4">
                    <Info
                      size={15}
                      className="mt-0.5 shrink-0 text-[#777880]"
                    />

                    <p className="text-[10px] leading-5 text-[#777880]">
                      Always verify the recipient address
                      and network before sending funds.
                    </p>
                  </div>

                  {/* Continue */}
                  <button
                    type="button"
                    disabled
                    className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#111111] text-[12px] font-semibold text-white opacity-40"
                  >
                    Continue
                  </button>

                  <p className="text-center text-[10px] text-[#A0A1A8]">
                    Wallet confirmation will appear here
                    once sending is connected.
                  </p>
                </div>
              </section>

              {/* RIGHT SIDE */}
              <aside>
                <div className="rounded-[22px] border border-[#E7E7EA] bg-white p-6">

                  <div className="flex h-[110px] items-center justify-center rounded-[16px] bg-[#F7F7F8]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                      <Wallet
                        size={29}
                        strokeWidth={1.4}
                        className="text-[#55565D]"
                      />
                    </div>
                  </div>

                  <h2 className="mt-6 text-[19px] font-semibold tracking-[-0.03em]">
                    Sending USDC
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[#7F8088]">
                    Your payment will be signed by your
                    connected wallet before it is submitted
                    to Arc.
                  </p>

                  <div className="mt-6 space-y-4 border-t border-[#EEEEF1] pt-5">

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#94959D]">
                        Asset
                      </span>

                      <span className="text-[11px] font-medium">
                        USDC
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#94959D]">
                        Network
                      </span>

                      <span className="text-[11px] font-medium">
                        Arc Testnet
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#94959D]">
                        Custody
                      </span>

                      <span className="text-[11px] font-medium">
                        Non-custodial
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
