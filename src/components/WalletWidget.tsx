
"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";

import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";
import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  FAUCET_URL,
} from "@/lib/config";
import { shortAddress, formatUsdc } from "@/lib/format";

export function WalletWidget() {
  const { address, isConnected, chainId } = useAccount();

  const {
    connect,
    isPending,
    error: connectError,
  } = useConnect();

  const { disconnect } = useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const wrongNetwork =
    isConnected && chainId !== arcTestnet.id;

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: Boolean(address) && !wrongNetwork,
      refetchInterval: 15_000,
    },
  });

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * CONNECT WALLET
   */

  async function handleConnect() {
    if (isPending) return;

    try {
      if (typeof window === "undefined") {
        return;
      }

      if (!window.ethereum) {
        alert(
          "No browser wallet detected. Please install MetaMask or Rabby."
        );
        return;
      }

      const connector = injected({
        shimDisconnect: true,
      });

      await connect({
        connector,
        chainId: arcTestnet.id,
      });
    } catch (error) {
      console.error(
        "Arc Pay wallet connection failed:",
        error
      );
    }
  }

  /*
   * CONNECTED + CORRECT NETWORK
   */

  if (isConnected && !wrongNetwork) {
    return (
      <div
        ref={menuRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() =>
            setMenuOpen((value) => !value)
          }
          className="group flex items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.055]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.06] text-sm">
            ◈
          </span>

          <span className="flex flex-col items-start leading-tight">
            <span className="tabular text-xs font-semibold text-white">
              {balanceLoading
                ? "Loading…"
                : `${formatUsdc(
                    formatUnits(
                      balance ?? 0n,
                      USDC_DECIMALS
                    )
                  )} USDC`}
            </span>

            <span className="font-mono text-[10px] text-white/40">
              {address
                ? shortAddress(address)
                : ""}
            </span>
          </span>

          <span className="ml-1 text-xs text-white/30">
            {menuOpen ? "⌃" : "⌄"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0d14] p-1.5 shadow-2xl">
            <div className="px-3 pb-2 pt-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                Connected wallet
              </p>

              <p className="mt-1 truncate font-mono text-xs text-white/70">
                {address}
              </p>
            </div>

            <div className="my-1 border-t border-white/[0.06]" />

            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/[0.05] hover:text-white"
            >
              <span>
                Get testnet USDC
              </span>

              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-red-300/80 hover:bg-red-400/[0.07]"
            >
              <span>
                Disconnect
              </span>

              <span>×</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /*
   * WRONG NETWORK
   */

  if (wrongNetwork) {
    return (
      <button
        type="button"
        disabled={isSwitching}
        onClick={() =>
          switchChain({
            chainId: arcTestnet.id,
          })
        }
        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-400/[0.11] disabled:opacity-60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />

        {isSwitching
          ? "Switching…"
          : "Switch to Arc Testnet"}
      </button>
    );
  }

  /*
   * NOT CONNECTED
   */

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        disabled={isPending}
        onClick={handleConnect}
        className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#080b11] shadow-lg shadow-white/[0.08] transition-all duration-200 hover:-translate-y-px hover:bg-white/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#080b11] text-[10px] font-bold text-white">
          ◈
        </span>

        <span>
          {isPending
            ? "Connecting…"
            : "Connect wallet"}
        </span>
      </button>

      {connectError && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-red-400/20 bg-[#0a0d14] p-3 text-xs text-red-300 shadow-2xl">
          {connectError.message}
        </div>
      )}
    </div>
  );
}

