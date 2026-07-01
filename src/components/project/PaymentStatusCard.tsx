"use client";

import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentStatusCardProps {
  totalNgn: number;
  amountPaidNgn: number;
  balanceNgn: number;
  paymentStatus: string;
  projectStatus: string;
  paymentType: string;
  lastPaymentDate: string | null;
  invoiceNumber?: string;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Unpaid",
  processing: "Processing",
  partially_paid: "Deposit Paid",
  paid: "Fully Paid",
  completed: "Fully Paid",
  refunded: "Refunded",
  failed: "Failed",
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending",
  in_progress: "In Progress",
  awaiting_feedback: "Awaiting Client Feedback",
  awaiting_payment: "Awaiting Final Payment",
  awaiting_completion: "Awaiting Project Completion",
  completed: "Completed",
  delivered: "Delivered",
  archived: "Archived",
};

export default function PaymentStatusCard({
  totalNgn,
  amountPaidNgn,
  balanceNgn,
  paymentStatus,
  projectStatus,
  paymentType,
  lastPaymentDate,
  invoiceNumber,
}: PaymentStatusCardProps) {
  return (
    <div className="glass rounded-2xl p-6 md:p-8 border border-gold/10">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Payment Status</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-muted mb-1">Project Cost</div>
          <div className="text-lg font-bold text-white">{formatCurrency(totalNgn)}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-muted mb-1">Paid</div>
          <div className="text-lg font-bold text-green-400">{formatCurrency(amountPaidNgn)}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-muted mb-1">Balance</div>
          <div className="text-lg font-bold text-gold">{formatCurrency(balanceNgn)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-muted text-xs">Payment Status</span>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
              paymentStatus === "paid" || paymentStatus === "completed"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : paymentStatus === "partially_paid"
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : paymentStatus === "failed" || paymentStatus === "refunded"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-white/5 text-muted border border-white/10"
            }`}>
              {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div>
          <span className="text-muted text-xs">Project Status</span>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
              projectStatus === "completed" || projectStatus === "delivered"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : projectStatus === "in_progress"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-white/5 text-muted border border-white/10"
            }`}>
              {PROJECT_STATUS_LABELS[projectStatus] || projectStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-muted">Payment Type</span>
          <p className="text-white font-medium mt-0.5 capitalize">{paymentType === "full" ? "Full Payment" : "50% Deposit"}</p>
        </div>
        {lastPaymentDate && (
          <div>
            <span className="text-muted">Last Payment</span>
            <p className="text-white font-medium mt-0.5">{formatDate(lastPaymentDate)}</p>
          </div>
        )}
        {invoiceNumber && (
          <div className="col-span-2">
            <span className="text-muted">Invoice</span>
            <p className="text-white font-medium mt-0.5 font-mono text-xs">{invoiceNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}
