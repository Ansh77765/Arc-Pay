"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Wallet,
  X,
} from "lucide-react";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { arcTestnet } from "@/lib/chain";
import { explorerAddressUrl } from "@/lib/config";

export function TopBar() {
  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const [copied, setCopied] = useState(false);

  const [walletModalOpen, setWalletModalOpen] =
    useState(false);

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

  const { disconnect } = useDisconnect();

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain();

  const connected = isConnected && !!address;

  const onArcTestnet =
    connected && chainId === arcTestnet.id;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  useEffect(() => {
    if (connected) {
      setWalletModalOpen(false);
    }
  }, [connected]);

  useEffect(() => {
    if (!walletModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWalletModalOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [walletModalOpen]);

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

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect({
      connector,
      chainId: arcTestnet.id,
    });
  };

  const handleDisconnect = () => {
    disconnect();
    setAccountMenuOpen(false);
  };

  return (
    <>
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

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            {/* NETWORK */}
            <div className="hidden items-center gap-2 rounded-full border border-[#E7E7EA] px-3 py-2 sm:flex">
              <span
                className={`h-[7px] w-[7px] rounded-full ${
                  connected && !onArcTestnet
                    ? "bg-[#D99A36]"
                    : "bg-[#31A66A]"
                }`}
              />

              <span className="text-[10px] font-medium text-[#66676E]">
                {connected && !onArcTestnet
                  ? "Wrong network"
                  : "Arc Testnet"}
              </span>
            </div>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#66676E] transition hover:bg-[#F5F5F6] hover:text-[#111111]"
            >
              <Bell
                size={17}
                strokeWidth={1.7}
              />
            </button>

            {/* WRONG NETWORK */}
            {connected && !onArcTestnet ? (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() =>
                  switchChain({
                    chainId: arcTestnet.id,
                  })
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#111111] px-4 text-[10px] font-semibold text-white transition hover:bg-[#292929] disabled:opacity-60"
              >
                {isSwitching
                  ? "Switching..."
                  : "Switch network"}
              </button>
            ) : connected ? (

              /* CONNECTED WALLET */
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen(
                      (value) => !value
                    )
                  }
                  className="flex h-[40px] items-center gap-2 rounded-full border border-[#E2E2E5] bg-white px-2.5 pr-3 transition hover:bg-[#F7F7F8]"
                >
                  <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#F1F1F2]">
                    <Wallet
                      size={14}
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="hidden text-[11px] font-medium text-[#33343A] sm:block">
                    {shortAddress}
                  </span>

                  <ChevronDown
                    size={13}
                    className={`text-[#96979F] transition-transform ${
                      accountMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* ACCOUNT MENU */}
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

                      {/* COPY */}
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] text-[#55565D] transition hover:bg-[#F7F7F8]"
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

                      {/* EXPLORER */}
                      <a
                        href={
                          address
                            ? explorerAddressUrl(
                                address
                              )
                            : "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-[#55565D] transition hover:bg-[#F7F7F8]"
                      >
                        <ExternalLink size={15} />

                        View on explorer
                      </a>

                      {/* DISCONNECT */}
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] text-red-500 transition hover:bg-red-50"
                      >
                        <LogOut size={15} />

                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>

            ) : (

              /* CONNECT WALLET */
              <button
                type="button"
                onClick={() =>
                  setWalletModalOpen(true)
                }
                className="flex h-[40px] items-center gap-2 rounded-full bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292929]"
              >
                <Wallet
                  size={14}
                  strokeWidth={1.8}
                />

                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* WALLET MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]">

          <button
            type="button"
            aria-label="Close wallet modal"
            onClick={() =>
              setWalletModalOpen(false)
            }
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-[22px] border border-[#E4E4E7] bg-white shadow-[0_25px_70px_-25px_rgba(0,0,0,.3)]">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#EEEEF1] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111111]">
                  Connect wallet
                </h2>

                <p className="mt-1 text-[10px] text-[#8C8D95]">
                  Connect a wallet to use Arc Pay.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWalletModalOpen(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888991] hover:bg-[#F5F5F6]"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONNECTORS */}
            <div className="space-y-2 p-4">

              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleConnect(connector)
                  }
                  className="flex w-full items-center gap-3 rounded-[14px] border border-[#E7E7EA] p-3.5 text-left transition hover:bg-[#F7F7F8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#F5F5F6]">
                    <Wallet
                      size={18}
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-[#33343A]">
                      {connector.name}
                    </span>

                    <span className="mt-1 block text-[9px] text-[#96979F]">
                      {isPending
                        ? "Confirm in your wallet..."
                        : "Connect to Arc Pay"}
                    </span>
                  </span>

                  <ChevronDown
                    size={14}
                    className="-rotate-90 text-[#A0A1A8]"
                  />
                </button>
              ))}

              {connectors.length === 0 && (
                <div className="rounded-[14px] bg-[#F7F7F8] p-4 text-center">
                  <p className="text-[11px] font-medium text-[#55565D]">
                    No wallet found
                  </p>

                  <p className="mt-1 text-[9px] text-[#96979F]">
                    Install a compatible wallet and
                    refresh the page.
                  </p>
                </div>
              )}

              {/* NETWORK */}
              <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[#F7F7F8] p-3.5">
                <span className="h-2 w-2 rounded-full bg-[#31A66A]" />

                <div>
                  <p className="text-[10px] font-semibold text-[#55565D]">
                    Arc Testnet
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#96979F]">
                    Wallet will connect to Arc Testnet.
                  </p>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-[12px] border border-[#F0D4D4] bg-[#FFF8F8] px-3 py-2.5 text-[9px] leading-4 text-[#B85D5D]">
                  {error.message.includes(
                    "User rejected"
                  )
                    ? "Connection was rejected in your wallet."
                    : error.message}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-[#EEEEF1] px-5 py-3.5 text-center">
              <p className="text-[9px] text-[#999AA2]">
                Arc Pay never receives or stores your
                private keys.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
