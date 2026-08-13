export type PaymentStatus = "pending" | "checking" | "paid" | "error";

const styles: Record<PaymentStatus, string> = {
  pending: "bg-warn/10 text-warn border-warn/25",
  checking: "bg-line-soft text-ink-dim border-line",
  paid: "bg-good/10 text-good border-good/25",
  error: "bg-bad/10 text-bad border-bad/25",
};

const labels: Record<PaymentStatus, string> = {
  pending: "Awaiting payment",
  checking: "Checking chain…",
  paid: "Paid",
  error: "Verification failed",
};

export function StatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-warn" />}
      {status === "checking" && (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-ink-faint border-t-transparent" />
      )}
      {status === "paid" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {status === "error" && <span className="h-1.5 w-1.5 rounded-full bg-bad" />}
      {labels[status]}
    </span>
  );
}
