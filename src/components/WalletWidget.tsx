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
import { USDC_ADDRESS, USDC_DECIMALS, FAUCET_URL } from "@/lib/config";
import { shortAddress, formatUsdc } from "@/lib/format";
import { formatUnits } from "viem";

function WalletIcon({ name }: { name: string }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas-panel border border-line text-xs font-semibold text-ink-dim">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function WalletWidget() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const wrongNetwork = isConnected && chainId !== arcTestnet.id;

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: { enabled: Boolean(address) && !wrongNetwork, refetchInterval: 15_000 },
  });

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  if (!isConnected) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-pop transition-all hover:bg-accent-hover active:scale-[0.98]"
        >
          Connect wallet
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-64 animate-fade-up rounded-xl border border-line bg-canvas-panel p-1.5 shadow-card">
            {connectors.length === 0 && (
              <p className="px-3 py-2 text-xs text-ink-faint">No connectors configured.</p>
            )}
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector, chainId: arcTestnet.id });
                  setMenuOpen(false);
                }}
                disabled={isPending}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-canvas-raised disabled:opacity-50"
              >
                <WalletIcon name={connector.name} />
                <span>{connector.name}</span>
              </button>
            ))}
            {error && (
              <p className="border-t border-line px-3 py-2 text-xs text-bad">
                {error.message.split(".")[0]}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        disabled={isSwitching}
        className="inline-flex items-center gap-2 rounded-lg bg-warn/10 border border-warn/30 px-4 py-2 text-sm font-medium text-warn transition-colors hover:bg-warn/15 disabled:opacity-60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-warn" />
        {isSwitching ? "Switching…" : "Wrong network — switch to Arc Testnet"}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg border border-line bg-canvas-panel px-3 py-1.5 text-sm transition-colors hover:border-line-soft hover:bg-canvas-raised"
      >
        <span className="flex flex-col items-end leading-tight">
          <span className="tabular font-medium text-ink">
            {balanceLoading
              ? "…"
              : `${formatUsdc(formatUnits(balance ?? 0n, USDC_DECIMALS))} USDC`}
          </span>
          <span className="font-mono text-[11px] text-ink-faint">
            {address ? shortAddress(address) : ""}
          </span>
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-good" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
        </span>
      </button>
      {menuOpen && (
        <div className="absolute right-0 z-20 mt-2 w-56 animate-fade-up rounded-xl border border-line bg-canvas-panel p-1.5 shadow-card">
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-canvas-raised hover:text-ink"
          >
            Get testnet USDC ↗
          </a>
          <button
            onClick={() => {
              disconnect();
              setMenuOpen(false);
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-bad transition-colors hover:bg-bad/10"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
