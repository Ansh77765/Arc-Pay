"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Loader2,
  X,
} from "lucide-react";

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { parseUnits } from "viem";

import {
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/config";

type PaymentRequest = {
  id: string;
  requester_wallet: string;
  requester_username: string;
  recipient_wallet: string;
  recipient_username: string;
  amount: string;
  status: "pending" | "paid" | "declined";
  created_at: string;
};

const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const;

export function PendingRequests() {
  const { address } = useAccount();

  const [requests, setRequests] = useState<
    PaymentRequest[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [payingId, setPayingId] =
    useState<string | null>(null);

  const [decliningId, setDecliningId] =
    useState<string | null>(null);

  const {
    writeContract,
    data: transactionHash,
    isPending: walletPending,
    error: walletError,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess: transactionSuccess,
  } =
    useWaitForTransactionReceipt({
      hash: transactionHash,
    });

  /*
   * ============================================================
   * LOAD REQUESTS
   * ============================================================
   */

  async function loadRequests() {
    if (!address) {
      setRequests([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response =
        await fetch(
          `/api/requests?wallet=${address}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not load requests."
        );
      }

      setRequests(
        data.requests || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();

    const interval =
      setInterval(
        loadRequests,
        10000
      );

    return () =>
      clearInterval(interval);
  }, [address]);

  /*
   * ============================================================
   * PAY REQUEST
   * ============================================================
   */

  function handlePay(
    paymentRequest: PaymentRequest
  ) {
    try {
      setError(null);
      setPayingId(
        paymentRequest.id
      );

      const amount =
        parseUnits(
          paymentRequest.amount,
          USDC_DECIMALS
        );

      /*
       * THIS OPENS THE WALLET POPUP.
       *
       * The recipient is paying the requester.
       */

      writeContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          paymentRequest.requester_wallet as `0x${string}`,
          amount,
        ],
      });
    } catch {
      setPayingId(null);

      setError(
        "Could not start the payment."
      );
    }
  }

  /*
   * ============================================================
   * MARK PAID AFTER BLOCKCHAIN CONFIRMATION
   * ============================================================
   */

  useEffect(() => {
    if (
      !transactionSuccess ||
      !transactionHash ||
      !payingId
    ) {
      return;
    }

    async function markPaid() {
      try {
        const response =
          await fetch(
            "/api/requests",
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                id: payingId,
                status: "paid",
              }),
            }
          );

        if (!response.ok) {
          throw new Error();
        }

        setRequests(
          (current) =>
            current.filter(
              (request) =>
                request.id !==
                payingId
            )
        );
      } catch {
        setError(
          "Payment succeeded, but the request status could not be updated."
        );
      } finally {
        setPayingId(null);
      }
    }

    markPaid();
  }, [
    transactionSuccess,
    transactionHash,
    payingId,
  ]);

  /*
   * ============================================================
   * DECLINE
   * ============================================================
   */

  async function handleDecline(
    id: string
  ) {
    try {
      setDecliningId(id);
      setError(null);

      const response =
        await fetch(
          "/api/requests",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id,
              status: "declined",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Could not decline request."
        );
      }

      setRequests(
        (current) =>
          current.filter(
            (request) =>
              request.id !== id
          )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not decline request."
      );
    } finally {
      setDecliningId(null);
    }
  }

  /*
   * ============================================================
   * NOTHING TO SHOW
   * ============================================================
   */

  if (
    !loading &&
    requests.length === 0 &&
    !error
  ) {
    return null;
  }

  return (
    <section className="arc-card mt-7 overflow-hidden">

      <div className="border-b border-[#EEF0F4] px-5 py-5 sm:px-6">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
              Payment requests
            </h2>

            <p className="mt-1 text-[10px] text-[#9298A4]">
              Requests waiting for your approval.
            </p>
          </div>

          {requests.length > 0 && (
            <span className="rounded-full bg-[#F1EDFF] px-2.5 py-1 text-[9px] font-bold text-[#6D4AFF]">
              {requests.length}
            </span>
          )}

        </div>

      </div>

      {loading ? (

        <div className="flex min-h-[120px] items-center justify-center">

          <div className="flex items-center gap-2 text-[10px] text-[#8D939F]">

            <Loader2
              size={13}
              className="animate-spin"
            />

            Checking requests…

          </div>

        </div>

      ) : (

        <div>

          {requests.map(
            (request) => {

              const isThisRequestPaying =
                payingId ===
                request.id;

              const busy =
                isThisRequestPaying ||
                walletPending ||
                confirming;

              return (
                <div
                  key={request.id}
                  className="border-b border-[#EEF0F4] px-5 py-5 last:border-b-0 sm:px-6"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold text-[#33343A]">
                        @{request.requester_username}
                        {" "}
                        requested
                      </p>

                      <p className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-[#11131A]">
                        {request.amount}{" "}
                        <span className="text-[11px] text-[#777D89]">
                          USDC
                        </span>
                      </p>

                      <p className="mt-1 font-mono text-[8px] text-[#999FAA]">
                        {request.requester_wallet.slice(
                          0,
                          6
                        )}
                        ...
                        {request.requester_wallet.slice(
                          -4
                        )}
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleDecline(
                            request.id
                          )
                        }
                        className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E1E4EA] px-4 text-[10px] font-semibold text-[#666B75] transition hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {decliningId ===
                        request.id ? (
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <X
                            size={13}
                          />
                        )}

                        Decline

                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handlePay(
                            request
                          )
                        }
                        className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#111111] px-5 text-[10px] font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {isThisRequestPaying ||
                        confirming ? (
                          <>
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />

                            {confirming
                              ? "Confirming…"
                              : "Wallet…"}
                          </>
                        ) : (
                          <>
                            <Check
                              size={13}
                            />

                            Pay

                            <ArrowRight
                              size={12}
                            />
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      )}

      {walletError && (
        <div className="flex items-start gap-2 border-t border-[#F2D5D5] bg-[#FFF8F8] px-5 py-3.5 sm:px-6">

          <CircleAlert
            size={14}
            className="mt-0.5 shrink-0 text-[#D85C5C]"
          />

          <p className="text-[9px] leading-5 text-[#B76A6A]">
            Wallet transaction was rejected or failed.
          </p>

        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border-t border-[#F2D5D5] bg-[#FFF8F8] px-5 py-3.5 sm:px-6">

          <CircleAlert
            size={14}
            className="mt-0.5 shrink-0 text-[#D85C5C]"
          />

          <p className="text-[9px] leading-5 text-[#B76A6A]">
            {error}
          </p>

        </div>
      )}

    </section>
  );
}
