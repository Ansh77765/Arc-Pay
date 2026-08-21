export type PaymentStatus =
  | "pending"
  | "checking"
  | "paid"
  | "error";

const styles: Record<PaymentStatus, string> = {
  pending:
    "border-amber-400/15 bg-amber-400/[0.06] text-amber-300/80",

  checking:
    "border-blue-400/15 bg-blue-500/[0.06] text-blue-300/75",

  paid:
    "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300/80",

  error:
    "border-red-400/15 bg-red-500/[0.06] text-red-300/80",
};

const labels: Record<PaymentStatus, string> = {
  pending: "Awaiting payment",
  checking: "Checking chain…",
  paid: "Paid",
  error: "Verification failed",
};

export function StatusPill({
  status,
}: {
  status: PaymentStatus;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-[9px]
        font-semibold
        tracking-wide
        backdrop-blur-md
        transition-all
        duration-300
        ${styles[status]}
      `}
    >
      {status === "pending" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />

          <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.45)]" />
        </span>
      )}

      {status === "checking" && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-300/20 border-t-blue-400" />
      )}

      {status === "paid" && (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400/[0.12]">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {status === "error" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="relative h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,.4)]" />
        </span>
      )}

      <span>{labels[status]}</span>
    </span>
  );
}
