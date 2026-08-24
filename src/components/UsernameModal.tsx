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
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { arcTestnet } from "@/lib/chain";
import {
  USERNAME_REGISTRY_ADDRESS,
} from "@/lib/config";

import {
  usernameRegistryAbi,
} from "@/lib/usernameRegistryAbi";

type UsernameModalProps = {
  open: boolean;
  onClose: () => void;
  address?: string;
};

const USERNAME_REGEX =
  /^[a-z0-9]{3,20}$/;

export function UsernameModal({
  open,
  onClose,
  address = "",
}: UsernameModalProps) {
  const {
    chainId,
  } = useAccount();

  const [username, setUsername] =
    useState("");

  const [reserved, setReserved] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const normalized = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const valid =
    USERNAME_REGEX.test(
      normalized
    );

  const onArcTestnet =
    chainId === arcTestnet.id;

  const shortAddress =
    useMemo(() => {
      if (!address) {
        return "Wallet not connected";
      }

      return `${address.slice(
        0,
        6
      )}...${address.slice(-4)}`;
    }, [address]);

  /* ============================================================
     EXISTING USERNAME
     ============================================================ */

  const {
    data: registeredUsername,
    isLoading:
      loadingRegisteredUsername,
    refetch:
      refetchRegisteredUsername,
  } = useReadContract({
    address:
      USERNAME_REGISTRY_ADDRESS,

    abi:
      usernameRegistryAbi,

    functionName:
      "usernameOf",

    args: address
      ? [
          address as `0x${string}`,
        ]
      : undefined,

    chainId:
      arcTestnet.id,

    query: {
      enabled:
        open &&
        Boolean(address) &&
        onArcTestnet,
    },
  });

  /* ============================================================
     AVAILABILITY
     ============================================================ */

  const {
    data: available,
    isLoading: checking,
    refetch:
      refetchAvailability,
  } = useReadContract({
    address:
      USERNAME_REGISTRY_ADDRESS,

    abi:
      usernameRegistryAbi,

    functionName:
      "isUsernameAvailable",

    args: [
      normalized,
    ],

    chainId:
      arcTestnet.id,

    query: {
      enabled:
        open &&
        valid &&
        onArcTestnet,
    },
  });

  /* ============================================================
     REGISTRATION
     ============================================================ */

  const {
    writeContract,
    data: registrationHash,
    isPending:
      isRegistering,
    error:
      registrationError,
  } = useWriteContract();

  const {
    isLoading:
      isConfirming,
    isSuccess:
      registrationSuccess,
  } =
    useWaitForTransactionReceipt({
      hash:
        registrationHash,
    });

  /* ============================================================
     LOAD EXISTING USERNAME
     ============================================================ */

  useEffect(() => {
    if (
      !open ||
      !address ||
      !onArcTestnet
    ) {
      return;
    }

    if (
      typeof registeredUsername ===
        "string" &&
      registeredUsername.length > 0
    ) {
      setUsername(
        registeredUsername
      );

      setReserved(true);
    } else {
      setUsername("");
      setReserved(false);
    }
  }, [
    open,
    address,
    onArcTestnet,
    registeredUsername,
  ]);

  /* ============================================================
     REGISTRATION SUCCESS
     ============================================================ */

  useEffect(() => {
    if (!registrationSuccess) {
      return;
    }

    setReserved(true);

    refetchAvailability();
    refetchRegisteredUsername();
  }, [
    registrationSuccess,
    refetchAvailability,
    refetchRegisteredUsername,
  ]);

  /* ============================================================
     RESET WHEN CLOSED
     ============================================================ */

  useEffect(() => {
    if (open) {
      return;
    }

    setUsername("");
    setReserved(false);
    setCopied(false);
  }, [open]);

  /* ============================================================
     RESET WHEN WALLET CHANGES
     ============================================================ */

  useEffect(() => {
    setUsername("");
    setReserved(false);
    setCopied(false);
  }, [address]);

  /* ============================================================
     USERNAME INPUT
     ============================================================ */

  function handleUsernameChange(
    value: string
  ) {
    const cleaned =
      value
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        )
        .slice(0, 20);

    setUsername(cleaned);
    setReserved(false);
  }

  /* ============================================================
     REGISTER
     ============================================================ */

  function handleReserve() {
    if (
      !onArcTestnet ||
      !address ||
      !valid ||
      available !== true ||
      isRegistering ||
      isConfirming ||
      reserved
    ) {
      return;
    }

    writeContract({
      address:
        USERNAME_REGISTRY_ADDRESS,

      abi:
        usernameRegistryAbi,

      functionName:
        "registerUsername",

      args: [
        normalized,
      ],

      chainId:
        arcTestnet.id,
    });
  }

  /* ============================================================
     COPY ADDRESS
     ============================================================ */

  async function copyAddress() {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Ignore clipboard failure.
    }
  }

  /* ============================================================
     CLOSE
     ============================================================ */

  function handleClose() {
    if (
      isRegistering ||
      isConfirming
    ) {
      return;
    }

    setCopied(false);
    onClose();
  }

  if (!open) {
    return null;
  }

  const busy =
    isRegistering ||
    isConfirming;

  const displayedUsername =
    username || "username";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close username modal"
        onClick={handleClose}
        className="absolute inset-0 bg-[#0C1220]/35 backdrop-blur-md"
      />

      {/* MODAL */}

      <div className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-[28px] border border-[#E1E4EA] bg-[#FBFBFD] shadow-[0_35px_100px_-35px_rgba(17,19,26,0.30)]">

        {/* CLOSE */}

        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={busy}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E5EA] bg-white text-[#777D89] shadow-[0_1px_2px_rgba(17,19,26,0.04)] transition hover:bg-[#F4F5F8] hover:text-[#11131A] disabled:opacity-40"
        >
          <X
            size={16}
            strokeWidth={1.7}
          />
        </button>

        {/* HEADER */}

        <div className="relative overflow-hidden px-7 pb-6 pt-7 sm:px-8">

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#6366F1]/[0.08] blur-[65px]" />

          <div className="relative flex items-start gap-3.5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#6366F1] text-white shadow-[0_8px_22px_rgba(79,70,229,0.18)]">
              <Sparkles
                size={18}
                strokeWidth={1.6}
              />
            </div>

            <div className="pr-8">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6366F1]">
                Arc Pay identity
              </p>

              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.045em] text-[#11131A]">
                {registeredUsername
                  ? "Your Arc Pay username"
                  : "Choose your username"}
              </h2>

              <p className="mt-2 max-w-[370px] text-[10px] leading-5 text-[#858B97]">
                {registeredUsername
                  ? "Your username is permanently linked to this wallet."
                  : "Give people an easier way to pay you without sharing your wallet address."}
              </p>

            </div>

          </div>

        </div>

        <div className="border-t border-[#EEF0F4]" />

        {/* CONTENT */}

        <div className="px-6 py-6 sm:px-8 sm:py-7">

          {/* IDENTITY CARD */}

          <div className="relative mx-auto aspect-[1.62/1] w-full max-w-[430px] overflow-hidden rounded-[23px] bg-[#0C1220] shadow-[0_18px_45px_-25px_rgba(17,19,26,0.30)]">

            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#6366F1]/25 blur-[65px]" />

            <div className="pointer-events-none absolute -bottom-24 left-[-40px] h-64 w-64 rounded-full bg-[#2563EB]/20 blur-[70px]" />

            <div className="pointer-events-none absolute right-0 top-0 h-full w-[58%] opacity-20">
              <PixelPattern />
            </div>

            <div className="absolute left-6 right-6 top-6 flex items-start justify-between">

              <div className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white text-[11px] font-bold text-[#11131A]">
                  A
                </div>

                <div>

                  <p className="text-[10px] font-bold tracking-[0.16em] text-white">
                    ARC PAY
                  </p>

                  <p className="mt-0.5 text-[6px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Payment identity
                  </p>

                </div>

              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-white/60 backdrop-blur">
                Arc Testnet
              </div>

            </div>

            <div className="absolute left-6 right-6 top-[43%]">

              <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Your payment identity
              </p>

              <p className="mt-1 font-mono text-[29px] font-semibold tracking-[-0.055em] text-white sm:text-[35px]">
                @{displayedUsername}
              </p>

            </div>

            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">

              <div>

                <p className="text-[6px] font-semibold uppercase tracking-[0.15em] text-white/35">
                  Wallet
                </p>

                <p className="mt-1 font-mono text-[8px] font-medium text-white/65">
                  {shortAddress}
                </p>

              </div>

              <div className="text-right">

                <div className="flex items-center justify-end gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />

                  <span className="text-[7px] font-semibold text-white/60">
                    VERIFIED
                  </span>

                </div>

                <p className="mt-1 text-[7px] text-white/35">
                  Arc Pay identity
                </p>

              </div>

            </div>

          </div>

          {/* WRONG NETWORK */}

          {!onArcTestnet && (
            <div className="mt-5 rounded-[15px] border border-[#F0E2C8] bg-[#FFFBF4] px-4 py-3.5">

              <div className="flex items-start gap-2.5">

                <CircleAlert
                  size={14}
                  className="mt-0.5 shrink-0 text-[#C58A28]"
                />

                <div>

                  <p className="text-[9px] font-semibold text-[#755522]">
                    Switch to Arc Testnet
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-[#A47A3A]">
                    Username registration is available on Arc Testnet.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* EXISTING USERNAME */}

          {loadingRegisteredUsername ? (

            <div className="mt-5 flex items-center justify-center gap-2 text-[9px] text-[#9298A4]">

              <Loader2
                size={12}
                className="animate-spin"
              />

              Loading your username…

            </div>

          ) : registeredUsername ? (

            <div className="mt-5 flex items-center justify-between gap-4 rounded-[15px] border border-[#CDE6D7] bg-[#F2FBF6] px-4 py-3.5">

              <div className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F5E9] text-[#16A36A]">
                  <Check size={14} />
                </div>

                <div>

                  <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#16A36A]">
                    Username registered
                  </p>

                  <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#333740]">
                    @{registeredUsername}
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#4F8B6A] shadow-[0_1px_3px_rgba(22,163,106,0.08)]">
                Active
              </span>

            </div>

          ) : null}

          {/* INPUT */}

          {!registeredUsername && (
            <div className="mt-7">

              <div className="mb-2.5 flex items-center justify-between">

                <label className="text-[10px] font-semibold text-[#444952]">
                  Choose username
                </label>

                <span className="text-[9px] text-[#9AA0AB]">
                  3–20 characters
                </span>

              </div>

              <div
                className={`arc-input flex h-[58px] items-center ${
                  available === false
                    ? "!border-[#E4BDBD]"
                    : available === true
                    ? "!border-[#BBDDC9]"
                    : ""
                }`}
              >

                <span className="pl-4 text-[18px] font-semibold text-[#9298A4]">
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
                  className="min-w-0 flex-1 bg-transparent px-2 text-[15px] font-semibold tracking-[-0.025em] text-[#11131A] outline-none placeholder:text-[#C2C6CE]"
                />

                <div className="mr-3">

                  {checking && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F8]">

                      <Loader2
                        size={15}
                        className="animate-spin text-[#777D89]"
                      />

                    </div>
                  )}

                  {!checking &&
                    available === true && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF8F2] text-[#16A36A]">

                        <Check
                          size={15}
                          strokeWidth={2.2}
                        />

                      </div>
                    )}

                  {!checking &&
                    available === false && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1F1] text-[#D05B5B]">

                        <CircleAlert
                          size={15}
                        />

                      </div>
                    )}

                </div>

              </div>

              {!valid &&
                username.length > 0 && (
                  <p className="mt-2 text-[9px] font-medium text-[#B76A6A]">
                    Use only lowercase letters and numbers, 3–20 characters.
                  </p>
                )}

              {valid &&
                checking && (
                  <p className="mt-2 text-[9px] text-[#9298A4]">
                    Checking availability…
                  </p>
                )}

              {valid &&
                !checking &&
                available === true && (
                  <p className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#16A36A]">

                    <Check size={11} />

                    @{normalized} is available

                  </p>
                )}

              {valid &&
                !checking &&
                available === false && (
                  <p className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#D05B5B]">

                    <CircleAlert size={11} />

                    @{normalized} is already taken

                  </p>
                )}

            </div>
          )}

          {/* WALLET */}

          <div className="mt-5 rounded-[15px] border border-[#E7E9EF] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(17,19,26,0.02)]">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <div className="flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

                  <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#9AA0AB]">
                    Connected wallet
                  </p>

                </div>

                <p className="mt-1 truncate font-mono text-[10px] text-[#555B67]">
                  {shortAddress}
                </p>

              </div>

              {address && (
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#E1E4EA] bg-[#FBFBFD] px-2.5 text-[8px] font-semibold text-[#666C78] transition hover:border-[#D7DAE2] hover:bg-[#F3F4F7]"
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
            <div className="mt-4 flex gap-2.5 rounded-[13px] border border-[#E7CACA] bg-[#FFF6F6] px-4 py-3.5">

              <CircleAlert
                size={14}
                className="mt-0.5 shrink-0 text-[#D05B5B]"
              />

              <p className="text-[9px] font-medium leading-4 text-[#B65353]">
                Transaction failed or was rejected. If the username was just taken, choose another one.
              </p>

            </div>
          )}

          {/* STATUS */}

          {isRegistering && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#F1F2FF] py-2.5 text-[9px] font-medium text-[#5B61D6]">

              <Loader2
                size={12}
                className="animate-spin"
              />

              Confirm the transaction in your wallet…

            </div>
          )}

          {isConfirming && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#F1F2FF] py-2.5 text-[9px] font-medium text-[#5B61D6]">

              <Loader2
                size={12}
                className="animate-spin"
              />

              Confirming registration on Arc…

            </div>
          )}

          {/* RESERVE */}

          {!registeredUsername && (
            <button
              type="button"
              onClick={handleReserve}
              disabled={
                !onArcTestnet ||
                !valid ||
                available !== true ||
                checking ||
                busy ||
                reserved
              }
              className="arc-accent mt-5 flex h-[53px] w-full items-center justify-center gap-2 rounded-[15px] text-[11px] font-semibold disabled:bg-[#E8EAF0] disabled:text-[#A1A6B0] disabled:shadow-none"
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
          )}

          {/* FOOTNOTE */}

          <div className="mt-4 flex items-center justify-center gap-2 text-center">

            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF0F4] text-[8px] font-bold text-[#777D89]">
              ✓
            </div>

            <p className="text-[8px] leading-4 text-[#999FAA]">
              Your wallet controls this identity. Arc Pay never holds your keys.
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
      const row =
        Math.floor(index / 15);

      const column =
        index % 15;

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
      {pixels.map(
        (pixel, index) => (
          <rect
            key={index}
            x={pixel.x}
            y={pixel.y}
            width="6"
            height="6"
            rx="1"
            fill="#A5B4FC"
            opacity={
              pixel.opacity
            }
          />
        )
      )}
    </svg>
  );
}
