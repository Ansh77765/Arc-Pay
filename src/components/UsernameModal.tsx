"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { USERNAME_REGISTRY_ADDRESS } from "@/lib/config";
import { usernameRegistryAbi } from "@/lib/usernameRegistryAbi";

type UsernameModalProps = {
  open: boolean;
  onClose: () => void;
  address?: string;
};

const USERNAME_REGEX = /^[a-z0-9]{3,20}$/;

export function UsernameModal({
  open,
  onClose,
  address = "",
}: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [reserved, setReserved] = useState(false);
  const [copied, setCopied] = useState(false);

  const normalized = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const valid = USERNAME_REGEX.test(normalized);

  const shortAddress = useMemo(() => {
    if (!address) return "Wallet not connected";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  /*
   * LIVE BLOCKCHAIN AVAILABILITY
   */

  const {
    data: available,
    isLoading: checking,
    refetch: refetchAvailability,
  } = useReadContract({
    address: USERNAME_REGISTRY_ADDRESS,
    abi: usernameRegistryAbi,
    functionName: "isUsernameAvailable",
    args: [normalized],
    query: {
      enabled: open && valid,
    },
  });

  /*
   * REGISTER USERNAME
   */

  const {
    writeContract,
    data: registrationHash,
    isPending: isRegistering,
    error: registrationError,
  } = useWriteContract();

  /*
   * WAIT FOR TRANSACTION
   */

  const {
    isLoading: isConfirming,
    isSuccess: registrationSuccess,
  } = useWaitForTransactionReceipt({
    hash: registrationHash,
  });

  useEffect(() => {
    if (!open) {
      setUsername("");
      setReserved(false);
    }
  }, [open]);

  useEffect(() => {
    if (registrationSuccess) {
      setReserved(true);
      refetchAvailability();
    }
  }, [
    registrationSuccess,
    refetchAvailability,
  ]);

  function handleUsernameChange(value: string) {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);

    setUsername(cleaned);
    setReserved(false);
  }

  function handleReserve() {
    if (
      !valid ||
      available !== true ||
      isRegistering ||
      isConfirming
    ) {
      return;
    }

    writeContract({
      address: USERNAME_REGISTRY_ADDRESS,
      abi: usernameRegistryAbi,
      functionName: "registerUsername",
      args: [normalized],
    });
  }

  async function copyAddress() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard failure.
    }
  }

  function handleClose() {
    if (
      !isRegistering &&
      !isConfirming
    ) {
      setUsername("");
      setReserved(false);
      setCopied(false);
      onClose();
    }
  }

  if (!open) {
    return null;
  }

  const busy =
    isRegistering || isConfirming;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close username modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/[0.16] backdrop-blur-[5px]"
      />

      {/* MODAL */}

      <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#E3E3E6] bg-white shadow-[0_35px_100px_-35px_rgba(0,0,0,.28)]">

        {/* CLOSE */}

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={busy}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E8] bg-white text-[#777880] transition hover:bg-[#F5F5F6] hover:text-[#111111] disabled:opacity-40"
        >
          <X
            size={16}
            strokeWidth={1.7}
          />
        </button>

        {/* HEADER */}

        <div className="px-7 pb-5 pt-7 sm:px-8">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#111111] text-white">
              <Sparkles
                size={18}
                strokeWidth={1.5}
              />
            </div>

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A8B93]">
                Arc Pay identity
              </p>

              <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.04em] text-[#111111]">
                Reserve your username
              </h2>

              <p className="mt-1.5 max-w-[360px] text-[10px] leading-5 text-[#85868E]">
                Create a simple payment identity
                that people can use instead of
                your wallet address.
              </p>

            </div>
          </div>
        </div>

        <div className="border-t border-[#EEEEF1]" />

        {/* CONTENT */}

        <div className="px-7 py-7 sm:px-8">

          {/* IDENTITY CARD */}

          <div className="relative mx-auto aspect-[1.62/1] w-full max-w-[430px] overflow-hidden rounded-[22px] border border-[#D9DCE2] bg-gradient-to-br from-[#F8F9FB] via-[#E7EAF0] to-[#D6DAE3] shadow-[0_18px_45px_-28px_rgba(0,0,0,.35)]">

            <div className="pointer-events-none absolute right-[-20px] top-[-15px] h-[170px] w-[260px] opacity-35">
              <PixelPattern />
            </div>

            <div className="pointer-events-none absolute bottom-[-55px] left-[-25px] h-[150px] w-[250px] rotate-[8deg] opacity-25">
              <PixelPattern />
            </div>

            {/* BRAND */}

            <div className="absolute left-6 top-6 flex items-center gap-2.5">

              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#111111] text-[11px] font-bold text-white">
                A
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-[#34363C]">
                  ARC PAY
                </p>

                <p className="mt-0.5 text-[6px] font-medium uppercase tracking-[0.2em] text-[#777A83]">
                  Payment identity
                </p>
              </div>

            </div>

            {/* TESTNET */}

            <div className="absolute right-6 top-6 rounded-full border border-[#C8CBD2] bg-white/50 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#676A73] backdrop-blur">
              Arc Testnet
            </div>

            {/* USERNAME */}

            <div className="absolute left-6 right-6 top-[42%]">

              <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#777A83]">
                Your payment identity
              </p>

              <p className="mt-1 font-mono text-[29px] font-semibold tracking-[-0.05em] text-[#17181B] sm:text-[34px]">
                @{normalized || "username"}
              </p>

            </div>

            {/* BOTTOM */}

            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">

              <div>

                <p className="text-[6px] font-semibold uppercase tracking-[0.15em] text-[#777A83]">
                  Wallet
                </p>

                <p className="mt-1 font-mono text-[8px] font-medium text-[#44464D]">
                  {shortAddress}
                </p>

              </div>

              <div className="text-right">

                <p className="text-[6px] font-semibold uppercase tracking-[0.15em] text-[#777A83]">
                  ARC
                </p>

                <p className="mt-1 text-[8px] font-medium text-[#555860]">
                  PAY
                </p>

              </div>

            </div>

          </div>

          {/* INPUT */}

          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777880]">
                Choose username
              </label>

              <span className="text-[9px] text-[#A0A1A8]">
                3–20 characters
              </span>

            </div>

            <div
              className={`flex h-[54px] items-center rounded-[15px] border bg-white transition ${
                available === false
                  ? "border-[#E7CACA]"
                  : available === true
                  ? "border-[#CDE6D7]"
                  : "border-[#E2E2E5]"
              }`}
            >

              <span className="pl-4 text-[17px] font-medium text-[#85868E]">
                @
              </span>

              <input
                value={username}
                onChange={(e) =>
                  handleUsernameChange(
                    e.target.value
                  )
                }
                placeholder="yourname"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
                className="min-w-0 flex-1 bg-transparent px-2 text-[15px] font-medium tracking-[-0.02em] text-[#111111] outline-none placeholder:text-[#C4C5CA]"
              />

              <div className="mr-3">

                {checking && (
                  <Loader2
                    size={17}
                    className="animate-spin text-[#999AA2]"
                  />
                )}

                {!checking &&
                  available === true && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7EF] text-[#31A66A]">
                      <Check
                        size={14}
                        strokeWidth={2.2}
                      />
                    </div>
                  )}

                {!checking &&
                  available === false && (
                    <CircleAlert
                      size={18}
                      className="text-[#D65A5A]"
                    />
                  )}

              </div>
            </div>

            {!valid &&
              username.length > 0 && (
                <p className="mt-2 text-[9px] text-[#B76A6A]">
                  Use only lowercase letters
                  and numbers, 3–20 characters.
                </p>
              )}

            {valid &&
              checking && (
                <p className="mt-2 text-[9px] text-[#999AA2]">
                  Checking availability…
                </p>
              )}

            {valid &&
              !checking &&
              available === true && (
                <p className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-[#31A66A]">
                  <Check size={11} />
                  {normalized} is available
                </p>
              )}

            {valid &&
              !checking &&
              available === false && (
                <p className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-[#D65A5A]">
                  <CircleAlert size={11} />
                  {normalized} is already taken
                </p>
              )}

          </div>

          {/* WALLET */}

          <div className="mt-5 rounded-[15px] border border-[#E7E7EA] bg-[#F7F7F8] px-4 py-3.5">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#9A9BA2]">
                  Connected wallet
                </p>

                <p className="mt-1 truncate font-mono text-[10px] text-[#55565D]">
                  {shortAddress}
                </p>

              </div>

              {address && (
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#E1E1E4] bg-white px-2.5 text-[8px] font-medium text-[#66676E] transition hover:bg-[#F2F2F3]"
                >
                  {copied ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>
              )}

            </div>
          </div>

          {/* ERROR */}

          {registrationError && (
            <div className="mt-4 rounded-[12px] border border-[#E8CCCC] bg-[#FFF7F7] px-4 py-3">

              <p className="text-[9px] font-medium leading-4 text-[#B65353]">
                Transaction failed or was rejected.
                If the username was just taken,
                choose another one.
              </p>

            </div>
          )}

          {/* TRANSACTION STATUS */}

          {isRegistering && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-[#777880]">
              <Loader2
                size={12}
                className="animate-spin"
              />
              Confirm the transaction in your wallet…
            </div>
          )}

          {isConfirming && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-[#777880]">
              <Loader2
                size={12}
                className="animate-spin"
              />
              Confirming registration on Arc…
            </div>
          )}

          {/* RESERVE */}

          <button
            type="button"
            onClick={handleReserve}
            disabled={
              !valid ||
              available !== true ||
              checking ||
              busy ||
              reserved
            }
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[11px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:bg-[#EEEEF0] disabled:text-[#A0A1A8]"
          >

            {reserved ? (
              <>
                <Check size={14} />
                Username reserved
              </>
            ) : busy ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                {isRegistering
                  ? "Confirm in wallet…"
                  : "Registering…"}
              </>
            ) : (
              <>
                Reserve @{normalized || "username"}

                <span className="text-white/45">
                  →
                </span>
              </>
            )}

          </button>

          {/* FOOTNOTE */}

          <div className="mt-4 flex items-center justify-center gap-2 text-center">

            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#DADBE0] text-[8px] text-[#777880]">
              ✓
            </div>

            <p className="text-[8px] text-[#999AA2]">
              Your wallet controls this identity.
              Arc Pay never holds your keys.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PIXEL / DITHER PATTERN
   ============================================================ */

function PixelPattern() {
  const pixels = Array.from(
    { length: 90 },
    (_, index) => {
      const row = Math.floor(index / 15);
      const column = index % 15;

      const distance =
        Math.abs(
          column -
            row * 0.9 -
            2
        );

      const opacity = Math.max(
        0.08,
        1 - distance / 7
      );

      return {
        x: column * 13,
        y: row * 13,
        opacity,
      };
    }
  );

  return (
    <svg
      viewBox="0 0 210 80"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      {pixels.map((pixel, index) => (
        <rect
          key={index}
          x={pixel.x}
          y={pixel.y}
          width="6"
          height="6"
          rx="1"
          fill="#7E8490"
          opacity={pixel.opacity}
        />
      ))}
    </svg>
  );
}
