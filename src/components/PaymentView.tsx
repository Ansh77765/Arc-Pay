"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { maxUint256, parseUnits, formatUnits, type PublicClient } from "viem";
import { arcTestnet } from "@/lib/chain";
import { erc20Abi } from "@/lib/erc20";
import { PERMIT2_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, explorerTxUrl, explorerAddressUrl } from "@/lib/config";
import { formatUsdc, formatDate, shortAddress, shortHash } from "@/lib/format";
import { permit2Abi, permit2Domain, permit2Types } from "@/lib/permit2";
import { findMatchingPayment, verifyPaymentTx, type VerifiedPayment } from "@/lib/verify";
import { verifyInvoiceSignature } from "@/lib/paymentRequest";
import { WalletWidget } from "./WalletWidget";
import { StatusPill, type PaymentStatus } from "./StatusPill";
import { CopyButton } from "./CopyButton";
import type { Invoice } from "@/types/invoice";
import Link from "next/link";

export function PaymentView({ invoice }: { invoice: Invoice }) {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync, isPending: writing } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();

  const [status, setStatus] = useState<PaymentStatus>("checking");
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const [invoiceValid, setInvoiceValid] = useState<boolean | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const onArcTestnet = isConnected && chainId === arcTestnet.id;
  const isRecipient = address?.toLowerCase() === invoice.recipient.toLowerCase();

  useEffect(() => {
    setShareUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  useEffect(() => {
    let active = true;
    verifyInvoiceSignature(invoice).then((valid) => {
      if (active) setInvoiceValid(valid);
    });
    return () => { active = false; };
  }, [invoice]);

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: { enabled: Boolean(address) && onArcTestnet, refetchInterval: 15_000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PERMIT2_ADDRESS] : undefined,
    chainId: arcTestnet.id,
    query: { enabled: Boolean(address) && onArcTestnet, refetchInterval: 15_000 },
  });

  const requiredAmount = parseUnits(invoice.amount, USDC_DECIMALS);
  const insufficientBalance = onArcTestnet && balance !== undefined ? balance < requiredAmount : false;
  const needsApproval = onArcTestnet && allowance !== undefined ? allowance < requiredAmount : false;

  const scanForPayment = useCallback(async () => {
    if (!publicClient || invoiceValid !== true) return;
    try {
      const match = await findMatchingPayment(publicClient as PublicClient, invoice);
      if (match) {
        setPayment(match);
        setStatus("paid");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  }, [publicClient, invoice, invoiceValid]);

  useEffect(() => {
    scanForPayment();
    const interval = setInterval(scanForPayment, 12_000);
    return () => clearInterval(interval);
  }, [scanForPayment]);

  async function handleApproval() {
    setError(null);
    setApprovalPending(true);
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [PERMIT2_ADDRESS, maxUint256],
        chainId: arcTestnet.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchAllowance();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Approval failed.";
      setError(/user rejected|denied/i.test(message) ? "Approval was rejected in your wallet." : message.split("\n")[0]?.slice(0, 180) ?? "Approval failed.");
    } finally {
      setApprovalPending(false);
    }
  }

  async function handlePay() {
    setError(null);
    if (!publicClient || !address) return;
    if (invoiceValid !== true) {
      setError("This payment request signature is invalid.");
      return;
    }

    try {
      if (needsApproval) {
        await handleApproval();
        const updated = await refetchAllowance();
        if ((updated.data ?? 0n) < requiredAmount) return;
      }

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);
      const signature = await signTypedDataAsync({
        domain: permit2Domain(arcTestnet.id, PERMIT2_ADDRESS),
        types: permit2Types,
        primaryType: "PermitTransferFrom",
        message: {
          permitted: { token: USDC_ADDRESS, amount: requiredAmount },
          spender: PERMIT2_ADDRESS,
          nonce: BigInt(invoice.nonce),
          deadline,
        },
      });

      const hash = await writeContractAsync({
        address: PERMIT2_ADDRESS,
        abi: permit2Abi,
        functionName: "permitTransferFrom",
        args: [
          {
            permitted: { token: USDC_ADDRESS, amount: requiredAmount },
            nonce: BigInt(invoice.nonce),
            deadline,
          },
          { to: invoice.recipient as `0x${string}`, requestedAmount: requiredAmount },
          address,
          signature,
        ],
        chainId: arcTestnet.id,
      });

      setPendingTxHash(hash);
      setConfirming(true);
      await publicClient.waitForTransactionReceipt({ hash });

      const verified = await verifyPaymentTx(publicClient as PublicClient, invoice, hash);
      if (verified) {
        setPayment(verified);
        setStatus("paid");
      } else {
        setError("The transaction confirmed, but it did not contain this invoice's unique payment nonce.");
        setStatus("error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed.";
      if (/user rejected|denied/i.test(message)) setError("Transaction was rejected in your wallet.");
      else if (/insufficient|balance/i.test(message)) setError("Insufficient USDC balance to complete this payment.");
      else setError(message.split("\n")[0]?.slice(0, 180) ?? "Transaction failed.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto max-w-[440px] px-6 pb-24 pt-10 sm:pt-16">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-dim hover:text-ink">← New link</Link>
        <WalletWidget />
      </div>

      <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-canvas-panel shadow-card">
        <div className="space-y-5 p-7">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">Payment request</span>
            <StatusPill status={status} />
          </div>
          <div>
            <p className="font-mono text-4xl tabular font-medium text-ink">{formatUsdc(invoice.amount)}<span className="ml-2 text-lg text-ink-faint">USDC</span></p>
            <p className="mt-2 text-[15px] text-ink-dim">{invoice.description}</p>
          </div>
          <div className="space-y-2.5 rounded-xl border border-line-soft bg-canvas-raised/60 p-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-ink-faint">Recipient</span><span className="flex items-center gap-2"><a href={explorerAddressUrl(invoice.recipient)} target="_blank" rel="noreferrer" className="font-mono text-ink hover:text-accent">{shortAddress(invoice.recipient)}</a><CopyButton value={invoice.recipient} label="" /></span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Network</span><span className="text-ink">Arc Testnet</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Requested</span><span className="text-ink">{formatDate(invoice.createdAt)}</span></div>
          </div>
          {invoiceValid === false && <p className="rounded-lg border border-bad/25 bg-bad/10 px-4 py-2.5 text-center text-sm text-bad">Invalid payment request signature. Do not send funds.</p>}
        </div>

        <div className="perforation" />
        <div className="space-y-4 p-7">
          {status === "paid" && payment ? (
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-good/10"><span className="text-good text-xl">✓</span></div>
              <p className="text-sm font-medium text-ink">Payment confirmed on-chain</p>
              <a href={explorerTxUrl(payment.txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-ink-dim hover:border-accent hover:text-accent">{shortHash(payment.txHash)} ↗</a>
              <p className="text-xs text-ink-faint">Paid from {shortAddress(payment.from)}</p>
            </div>
          ) : isRecipient ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-ink-dim">This is your request. Share the link below to get paid.</p>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas-raised/60 px-4 py-3"><span className="truncate font-mono text-xs text-ink-dim">{shareUrl}</span><CopyButton value={shareUrl} label="Copy link" copiedLabel="Copied" /></div>
            </div>
          ) : !isConnected ? (
            <div className="space-y-3"><p className="text-center text-sm text-ink-dim">Connect a wallet to pay</p><div className="flex justify-center"><WalletWidget /></div></div>
          ) : !onArcTestnet ? (
            <button onClick={() => switchChain({ chainId: arcTestnet.id })} disabled={switching} className="w-full rounded-lg bg-warn/10 border border-warn/25 py-3.5 text-sm font-medium text-warn hover:bg-warn/15 disabled:opacity-60">{switching ? "Switching…" : "Switch to Arc Testnet"}</button>
          ) : invoiceValid !== true ? (
            <p className="text-center text-sm text-ink-faint">Verifying payment request…</p>
          ) : (
            <>
              {pendingTxHash && confirming && <a href={explorerTxUrl(pendingTxHash)} target="_blank" rel="noreferrer" className="block rounded-lg border border-line bg-canvas-raised/60 px-4 py-2.5 text-center font-mono text-xs text-ink-dim hover:text-accent">Confirming {shortHash(pendingTxHash)}…</a>}
              <button onClick={handlePay} disabled={writing || confirming || approvalPending || insufficientBalance} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-semibold text-white shadow-pop hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint disabled:shadow-none">
                {approvalPending ? "Approve USDC for Permit2…" : writing || confirming ? (writing ? "Confirm in wallet…" : "Verifying…") : insufficientBalance ? "Insufficient USDC balance" : needsApproval ? `Enable ${formatUsdc(invoice.amount)} USDC payment` : `Pay ${formatUsdc(invoice.amount)} USDC`}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-ink-faint">First-time payers may be asked to approve Permit2 once. The payment then uses a unique invoice nonce so another transfer cannot satisfy this request.</p>
              {insufficientBalance && balance !== undefined && <p className="text-center text-xs text-ink-faint">Balance: {formatUsdc(formatUnits(balance, USDC_DECIMALS))} USDC — get more from the faucet in your wallet menu.</p>}
            </>
          )}
          {error && <p className="rounded-lg border border-bad/25 bg-bad/10 px-4 py-2.5 text-center text-sm text-bad">{error}</p>}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-ink-faint">Payments settle directly wallet-to-wallet on Arc. Arc Pay never holds funds.</p>
    </div>
  );
}
