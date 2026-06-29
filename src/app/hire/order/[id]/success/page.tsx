"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { api, type ServicePaymentVerifyResponse } from "@/lib/api";
import { useBooking } from "@/contexts/BookingContext";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  requirements_reviewed: "Requirements Reviewed",
  clarification_needed: "Clarification Needed",
  ready_for_kickoff: "Ready for Kickoff",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STAGES = [
  "Payment Confirmed",
  "Project Created",
  "Requirements Review",
  "Team Assignment",
  "Kickoff",
  "In Progress",
  "Completed",
];

function OrderSuccessContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ServicePaymentVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useBooking();

  useEffect(() => {
    if (!id) return;

    const reference = searchParams.get("reference");
    if (reference) {
      api.verifyServicePayment(reference, id).then((res) => {
        setStatus(res.data);
        setLoading(false);
        reset();
      }).catch((err) => {
        setError(err?.message || "Failed to verify payment");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, searchParams, reset]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-4 w-64 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="relative pt-20 pb-20 overflow-hidden min-h-screen flex items-center">
        <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification In Progress</h2>
            <p className="text-muted text-sm mb-6">{error}</p>
            <p className="text-xs text-muted">Your payment may still be processing. Check your dashboard or contact support.</p>
            <Link href="/dashboard" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const paid = status?.payment_status === "paid" || status?.payment_status === "partially_paid";
  const isDeposit = status?.payment_type === "deposit";
  const projectStatusLabel = PROJECT_STATUS_LABELS[status?.project_status || ""] || status?.project_status || "Pending Review";
  const estimatedKickoff = status?.created_at
    ? new Date(new Date(status.created_at).getTime() + 3 * 24 * 60 * 60 * 1000)
    : null;

  const currentStageIdx = paid ? 1 : 0;

  return (
    <section className="relative pt-20 pb-20 md:pt-28 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-8">
            <motion.svg
              className="w-12 h-12 text-gold"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {paid ? "Payment Successful!" : "Order Placed!"}
          </h1>
          <p className="text-lg text-muted mb-1 max-w-lg mx-auto">
            {paid
              ? isDeposit
                ? "Your deposit has been received. We'll begin preparing your project workspace."
                : "Your project is confirmed! Your workspace is being provisioned."
              : "Your order has been received. Complete payment to start the project."}
          </p>
          {status?.project_number && (
            <p className="text-sm text-muted">
              Project: <span className="text-white font-mono">{status.project_number}</span>
            </p>
          )}
          <p className="text-sm text-muted">
            Order: <span className="text-white font-mono">{status?.order_number}</span>
          </p>
        </motion.div>

        {/* Status Pipeline */}
        {paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass rounded-2xl p-6 text-left max-w-2xl mx-auto"
          >
            <h3 className="text-xs text-muted uppercase tracking-wider mb-4">Project Timeline</h3>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = currentStageIdx > idx;
                const isCurrent = currentStageIdx === idx;
                return (
                  <div key={stage} className="flex items-center shrink-0">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                        isCurrent
                          ? "bg-gold/15 text-gold border border-gold/30"
                          : isCompleted
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white/5 text-muted border border-white/5"
                      }`}
                    >
                      {isCompleted && <span className="text-green-400">✓</span>}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                      {stage}
                    </div>
                    {idx < STATUS_STAGES.length - 1 && (
                      <div className={`w-4 h-px mx-1 ${isCompleted ? "bg-green-500/40" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 glass rounded-2xl p-6 text-left max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted">Amount Paid</span>
                <p className="text-gold font-bold mt-0.5">₦{Number(status.amount_paid_ngn).toLocaleString()}</p>
              </div>
              {Number(status.balance_ngn) > 0 && (
                <div>
                  <span className="text-xs text-muted">Balance Due</span>
                  <p className="text-gold font-bold mt-0.5">₦{Number(status.balance_ngn).toLocaleString()}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted">Payment Status</span>
                <p className={`font-bold mt-0.5 capitalize ${status.payment_status === "paid" ? "text-green-400" : "text-yellow-400"}`}>
                  {status.payment_status === "partially_paid" ? "Deposit Paid" : status.payment_status}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted">Project Status</span>
                <p className="text-white font-bold mt-0.5">{projectStatusLabel}</p>
              </div>
              {estimatedKickoff && paid && (
                <div>
                  <span className="text-xs text-muted">Est. Kickoff</span>
                  <p className="text-white font-bold mt-0.5">
                    {estimatedKickoff.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              )}
              {status.invoice_number && (
                <div>
                  <span className="text-xs text-muted">Invoice</span>
                  <p className="text-white font-mono text-xs mt-0.5">{status.invoice_number}</p>
                </div>
              )}
              {status.receipt_number && (
                <div>
                  <span className="text-xs text-muted">Receipt</span>
                  <p className="text-white font-mono text-xs mt-0.5">{status.receipt_number}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        {paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 glass rounded-2xl p-6 text-left max-w-2xl mx-auto"
          >
            <h3 className="text-sm font-bold text-white mb-3">What&apos;s Next?</h3>
            <div className="space-y-3">
              {[
                { step: 1, text: "Our team reviews your requirements and project scope", done: true },
                { step: 2, text: "Project manager assigned to your project", done: false },
                { step: 3, text: isDeposit ? "Balance payment due at project midpoint" : "Project kickoff within 24-48 hours", done: false },
                { step: 4, text: "Receive regular updates through your project dashboard", done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    item.done ? "bg-gold/20" : "bg-white/5"
                  }`}>
                    {item.done ? (
                      <span className="text-gold text-xs">✓</span>
                    ) : (
                      <span className="text-muted text-xs">{item.step}</span>
                    )}
                  </div>
                  <span className={`text-sm ${item.done ? "text-white" : "text-muted"}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          {paid ? (
            <>
              <Link
                href={`/hire/project/${id}`}
                className="px-8 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
              >
                Go to Project Workspace →
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl glass text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-gold-gradient text-background font-bold text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300"
            >
              Go to Dashboard
            </Link>
          )}
        </motion.div>

        <p className="text-xs text-muted mt-6">
          A confirmation has been sent to your email with all project details.
          Need help? <Link href="/contact" className="text-gold hover:underline">Contact Support</Link>
        </p>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
