"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  ArrowDownLeft,
  Copy,
  Check,
  Wallet,
  ShieldCheck,
} from "lucide-react";

import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { shortAddress } from "@/lib/format";

export default function ReceivePage() {
  const { address, isConnected } = useAccount();

  const [copied, setCopied] = useState(false);

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
    <div className="min-h-screen bg-[#F7F8FC] text-[#111318]">
      <TopBar />

      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[760px]">

            {/* Header */}
            <div className="mb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B5FEF]">
                Receive
              </p>

              <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#111318]">
                Receive USDC
              </h1>

              <p className="mt-2 text-[13px] text-[#737987]">
                Share your wallet address to receive USDC
                on Arc.
              </p>
            </div>

            {!isConnected || !address ? (
              <div className="rounded-[24px] border border-[#E5E8EF] bg-white p-10 text-center shadow-[0_12px_40px_-25px_rgba(20,30,60,.2)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F1FF] text-[#5B5FEF]">
                  <Wallet size={24} />
                </div>

                <h2 className="mt-5 text-[16px] font-semibold text-[#343944]">
                  Connect your wallet
                </h2>

                <p className="mx-auto mt-2 max-w-[320px] text-[12px] leading-5 text-[#969CA7]">
                  Connect your wallet from the top-right
                  corner to generate your receive address.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)]">

                {/* QR */}
                <div className="rounded-[24px] border border-[#E5E8EF] bg-white p-6 shadow-[0_12px_40px_-25px_rgba(20,30,60,.2)]">
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#F7F8FC]">
                    <div className="text-center">
                      <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-[#C9CDD8] bg-white">
                        <div className="px-4 text-[10px] leading-4 text-[#9AA0AA]">
                          QR code
                          <br />
                          coming next
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#8C929D]">
                    <ShieldCheck
                      size={14}
                      className="text-[#5B5FEF]"
                    />
                    Arc Testnet · USDC
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-[24px] border border-[#E5E8EF] bg-white p-7 shadow-[0_12px_40px_-25px_rgba(20,30,60,.2)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F1FF] text-[#5B5FEF]">
                    <ArrowDownLeft size={19} />
                  </div>

                  <h2 className="mt-5 text-[18px] font-semibold text-[#20242D]">
                    Your wallet address
                  </h2>

                  <p className="mt-2 text-[11px] leading-5 text-[#969CA7]">
                    Send USDC to this address using the
                    Arc network.
                  </p>

                  <div className="mt-6 rounded-xl border border-[#E5E8EF] bg-[#F8F9FB] p-4">
                    <p className="break-all font-mono text-[11px] leading-5 text-[#4F5663]">
                      {address}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyAddress}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5B5FEF] text-[12px] font-semibold text-white transition hover:bg-[#4F53DE]"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy address
                      </>
                    )}
                  </button>

                  <div className="mt-5 border-t border-[#EEF0F4] pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#969CA7]">
                        Network
                      </span>

                      <span className="text-[10px] font-semibold text-[#596170]">
                        Arc Testnet
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-[#969CA7]">
                        Asset
                      </span>

                      <span className="text-[10px] font-semibold text-[#596170]">
                        USDC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#E5E8EF] bg-white p-5">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#5B5FEF]"
              />

              <div>
                <p className="text-[11px] font-semibold text-[#454B56]">
                  Non-custodial payments
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#969CA7]">
                  Arc Pay never controls your wallet or
                  private keys. Always verify the network
                  before sending funds.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
