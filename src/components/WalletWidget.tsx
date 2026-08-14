"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";
import {
  USDC_ADDRESS,
  USDC_DECIMALS,
  FAUCET_URL,
} from "@/lib/config";
import { shortAddress, formatUsdc } from "@/lib/format";
import { formatUnits } from "viem";

function WalletIcon({
  name,
  connectorId,
}: {
  name: string;
  connectorId?: string;
}) {
  const lower = `${name} ${connectorId ?? ""}`.toLowerCase();

  let content = "W";

  if (lower.includes("metamask")) {
    content = "🦊";
  } else if (
    lower.includes("coinbase")
  ) {
    content = "C";
  } else if (
    lower.includes("walletconnect")
  ) {
    content = "W";
  } else if (lower.includes("rabby")) {
    content = "R";
  } else if (lower.includes("phantom")) {
    content = "P";
  } else if (lower.includes("trust")) {
    content = "T";
  } else if (lower.includes("rainbow")) {
    content = "R";
  } else if (lower.includes("brave")) {
    content = "B";
  } else if (lower.includes("okx")) {
    content = "O";
  } else if (name) {
    content = name
      .slice(0, 1)
      .toUpperCase();
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045] text-base shadow-sm">
      {content}
    </span>
  );
}

export function WalletWidget() {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount();

  const {
    connectors,
    connect,
    isPending,
    error,
  } = useConnect();

  const { disconnect } =
    useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const wrongNetwork =
    isConnected &&
    chainId !== arcTestnet.id;

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address
      ? [address]
      : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled:
        Boolean(address) &&
        !wrongNetwork,
      refetchInterval: 15_000,
    },
  });

  useEffect(() => {
    function onClickAway(
      event: MouseEvent
    ) {
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
      onClickAway
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onClickAway
      );
    };
  }, []);

  /*
   * ------------------------------------------------
   * CONNECTED
   * ------------------------------------------------
   */

  if (isConnected && !wrongNetwork) {
    return (
      <div
        className="relative"
        ref={menuRef}
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

          <span className="ml-1 text-xs text-white/30 transition-transform group-hover:text-white/60">
            {menuOpen ? "⌃" : "⌄"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0d14]/95 p-1.5 shadow-2xl backdrop-blur-xl">

            <div className="px-3 pb-2 pt-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
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
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <span>
                Get testnet USDC
              </span>

              <span className="text-white/25">
                ↗
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-red-300/80 transition-colors hover:bg-red-400/[0.07] hover:text-red-300"
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
   * ------------------------------------------------
   * WRONG NETWORK
   * ------------------------------------------------
   */

  if (wrongNetwork) {
    return (
      <button
        type="button"
        onClick={() =>
          switchChain({
            chainId:
              arcTestnet.id,
          })
        }
        disabled={isSwitching}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-2.5 text-sm font-medium text-amber-300 transition-all hover:bg-amber-400/[0.11] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />

        {isSwitching
          ? "Switching…"
          : "Switch to Arc Testnet"}
      </button>
    );
  }

  /*
   * ------------------------------------------------
   * CONNECT WALLET
   * ------------------------------------------------
   */

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() =>
          setMenuOpen((value) => !value)
        }
        className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#080b11] shadow-lg shadow-white/[0.08] transition-all duration-200 hover:-translate-y-px hover:bg-white/90 active:translate-y-0"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#080b11] text-[10px] font-bold text-white">
          ◈
        </span>

        <span>
          Connect wallet
        </span>

        <span className="text-black/30 transition-transform group-hover:translate-y-px">
          ↓
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[330px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0d14]/[0.98] shadow-2xl shadow-black/40 backdrop-blur-2xl">

          {/* Header */}
          <div className="px-5 pb-4 pt-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-white">
                  Connect wallet
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  Choose a wallet to continue
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          {/* Wallet list */}
          <div className="px-2 pb-2">

            {connectors.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-4 text-center">
                <p className="text-sm text-white/60">
                  No wallet detected
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Install an EVM wallet extension
                  to continue.
                </p>
              </div>
            ) : (
              connectors.map(
                (connector) => (
                  <button
                    key={connector.uid}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      connect({
                        connector,
                        chainId:
                          arcTestnet.id,
                      });

                      setMenuOpen(
                        false
                      );
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 hover:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <WalletIcon
                      name={
                        connector.name
                      }
                      connectorId={
                        connector.id
                      }
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white/90">
                        {connector.name}
                      </span>

                      <span className="mt-0.5 block text-[11px] text-white/30">
                        {connector.name
                          .toLowerCase()
                          .includes(
                            "injected"
                          )
                          ? "Browser wallet"
                          : "EVM wallet"}
                      </span>
                    </span>

                    <span className="text-sm text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/50">
                      →
                    </span>
                  </button>
                )
              )
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] text-emerald-300">
                ✓
              </span>

              <p className="text-[10px] leading-4 text-white/30">
                Your wallet stays in your control.
                Arc Pay never holds your funds.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="border-t border-red-400/10 bg-red-400/[0.04] px-4 py-3">
              <p className="text-xs leading-4 text-red-300/80">
               {(error.message ?? "Wallet connection failed.")
  .split(".")[0]
  .slice(0, 160)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
